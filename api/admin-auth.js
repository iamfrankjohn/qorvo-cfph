const crypto = require('crypto');

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30 * 1000;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map();

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function clientKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.socket?.remoteAddress || 'unknown');
}

function getAttemptState(key) {
  const now = Date.now();
  const state = attempts.get(key);
  if (!state || now - state.windowStartedAt > WINDOW_MS) {
    const fresh = { count: 0, windowStartedAt: now, lockedUntil: 0 };
    attempts.set(key, fresh);
    return fresh;
  }
  return state;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const configuredPin = process.env.QORVO_ADMIN_PIN;
  if (!configuredPin || !/^\d{6}$/.test(configuredPin)) {
    return res.status(500).json({
      ok: false,
      error: 'QORVO_ADMIN_PIN must be configured in Vercel as exactly 6 digits.'
    });
  }

  const key = clientKey(req);
  const state = getAttemptState(key);
  const now = Date.now();

  if (state.lockedUntil > now) {
    const retryAfter = Math.ceil((state.lockedUntil - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      ok: false,
      error: `Too many incorrect attempts. Try again in ${retryAfter} seconds.`,
      retryAfter
    });
  }

  const pin = String(req.body?.pin || '');
  if (!/^\d{6}$/.test(pin) || !safeEqual(pin, configuredPin)) {
    state.count += 1;

    if (state.count >= MAX_ATTEMPTS) {
      state.count = 0;
      state.windowStartedAt = now;
      state.lockedUntil = now + COOLDOWN_MS;
      attempts.set(key, state);
      res.setHeader('Retry-After', '30');
      return res.status(429).json({
        ok: false,
        error: 'Too many incorrect attempts. Try again in 30 seconds.',
        retryAfter: 30
      });
    }

    attempts.set(key, state);
    return res.status(401).json({
      ok: false,
      error: 'Incorrect admin PIN.',
      attemptsRemaining: MAX_ATTEMPTS - state.count
    });
  }

  attempts.delete(key);
  return res.status(200).json({ ok: true });
};
