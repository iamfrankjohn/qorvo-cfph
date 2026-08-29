const crypto = require('crypto');

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const configuredPassword = process.env.QORVO_ADMIN_PASSWORD;
  if (!configuredPassword) {
    return res.status(500).json({ ok: false, error: 'Admin password is not configured in Vercel.' });
  }

  const password = req.body && req.body.password;
  if (!safeEqual(password, configuredPassword)) {
    return res.status(401).json({ ok: false, error: 'Incorrect password.' });
  }

  return res.status(200).json({ ok: true });
};
