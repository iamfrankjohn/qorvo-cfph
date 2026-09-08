const crypto = require('crypto');

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30 * 1000;
const WINDOW_MS = 10 * 60 * 1000;
const VIEWER_TOKEN_TTL = 12 * 60 * 60;
const attempts = new Map();

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function clientKey(req, scope = 'admin') {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || String(req.socket?.remoteAddress || 'unknown');
  return `${scope}:${ip}`;
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

function turnCredentials(res) {
  const host = process.env.TURN_HOST;
  const secret = process.env.TURN_AUTH_SECRET;

  if (!host || !secret) {
    return res.status(200).json({
      configured: false,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
  }

  const requestedTtl = Number(process.env.TURN_CREDENTIAL_TTL || 3600);
  const ttl = Number.isFinite(requestedTtl) ? Math.min(Math.max(Math.floor(requestedTtl), 300), 86400) : 3600;
  const username = `${Math.floor(Date.now() / 1000) + ttl}:qorvo`;
  const credential = crypto.createHmac('sha1', secret).update(username).digest('base64');

  return res.status(200).json({
    configured: true,
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: [
          `turn:${host}:3478?transport=udp`,
          `turn:${host}:3478?transport=tcp`
        ],
        username,
        credential
      }
    ],
    expiresIn: ttl
  });
}

function viewerTokenSecret() {
  return process.env.QORVO_VIEWER_TOKEN_SECRET || process.env.TURN_AUTH_SECRET || '';
}

function signViewerToken() {
  const secret = viewerTokenSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + VIEWER_TOKEN_TTL;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = `${exp}.${nonce}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return { token: `${payload}.${sig}`, expiresIn: VIEWER_TOKEN_TTL };
}

function verifyViewerToken(token) {
  const secret = viewerTokenSecret();
  if (!secret || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [expRaw, nonce, sig] = parts;
  if (!/^\d+$/.test(expRaw) || !/^[a-f0-9]{24}$/.test(nonce) || !sig) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const payload = `${expRaw}.${nonce}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return safeEqual(sig, expected);
}

function rateLimitedPinCheck(req, res, configuredPin, scope, wrongMessage) {
  const key = clientKey(req, scope);
  const state = getAttemptState(key);
  const now = Date.now();

  if (state.lockedUntil > now) {
    const retryAfter = Math.ceil((state.lockedUntil - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return { ok: false, response: res.status(429).json({
      ok: false,
      error: `Too many incorrect attempts. Try again in ${retryAfter} seconds.`,
      retryAfter
    }) };
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
      return { ok: false, response: res.status(429).json({
        ok: false,
        error: 'Too many incorrect attempts. Try again in 30 seconds.',
        retryAfter: 30
      }) };
    }
    attempts.set(key, state);
    return { ok: false, response: res.status(401).json({
      ok: false,
      error: wrongMessage,
      attemptsRemaining: MAX_ATTEMPTS - state.count
    }) };
  }

  attempts.delete(key);
  return { ok: true };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET' && String(req.query?.mode || '') === 'turn') {
    return turnCredentials(res);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const mode = String(req.body?.mode || 'admin');

  if (mode === 'viewer-verify') {
    return res.status(verifyViewerToken(req.body?.token) ? 200 : 401).json({
      ok: verifyViewerToken(req.body?.token)
    });
  }

  if (mode === 'viewer') {
    const configuredPin = process.env.QORVO_VIEWER_PIN || process.env.QORVO_ADMIN_PIN;
    if (!configuredPin || !/^\d{6}$/.test(configuredPin)) {
      return res.status(500).json({
        ok: false,
        error: 'Configure QORVO_VIEWER_PIN in Vercel as exactly 6 digits.'
      });
    }
    if (!viewerTokenSecret()) {
      return res.status(500).json({
        ok: false,
        error: 'Viewer token signing is not configured.'
      });
    }
    const check = rateLimitedPinCheck(req, res, configuredPin, 'viewer', 'Incorrect viewer PIN.');
    if (!check.ok) return check.response;
    const signed = signViewerToken();
    return res.status(200).json({ ok: true, ...signed });
  }

  const configuredPin = process.env.QORVO_ADMIN_PIN;
  if (!configuredPin || !/^\d{6}$/.test(configuredPin)) {
    return res.status(500).json({
      ok: false,
      error: 'QORVO_ADMIN_PIN must be configured in Vercel as exactly 6 digits.'
    });
  }

  const check = rateLimitedPinCheck(req, res, configuredPin, 'admin', 'Incorrect admin PIN.');
  if (!check.ok) return check.response;
  return res.status(200).json({ ok: true });
};
