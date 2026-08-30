function checkerConfig() {
  const baseUrl = String(process.env.FACEBOOK_CHECKER_URL || '').trim().replace(/\/+$/, '');
  const secret = String(process.env.FACEBOOK_CHECKER_SECRET || '').trim();
  return { baseUrl, secret };
}

function cleanReel(reel) {
  if (!reel || typeof reel !== 'object') return null;

  const url = String(reel.url || '').trim();
  if (!/^https:\/\/(www\.)?facebook\.com\/reel\//i.test(url)) return null;

  const match = url.match(/\/reel\/([0-9]+)/i);
  const id = String(reel.id || (match ? match[1] : '')).trim();
  if (!/^[0-9]{5,30}$/.test(id)) return null;

  const thumbnail = String(reel.thumbnail || '').trim();
  return {
    id,
    url,
    thumbnail: /^https:\/\//i.test(thumbnail) ? thumbnail : '',
    metric: String(reel.metric || '').trim().slice(0, 30)
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const checker = checkerConfig();
  if (!checker.baseUrl || !checker.secret) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error: 'Facebook checker is not configured.'
    });
  }

  try {
    const response = await fetch(`${checker.baseUrl}/reels`, {
      headers: {
        Accept: 'application/json',
        'x-qorvo-key': checker.secret
      },
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) throw new Error(`Checker HTTP ${response.status}`);

    const payload = await response.json();
    const reels = Array.isArray(payload?.reels)
      ? payload.reels.map(cleanReel).filter(Boolean).slice(0, 5)
      : [];

    if (!payload?.ok || !reels.length) {
      throw new Error('Checker returned no valid Reels');
    }

    return res.status(200).json({
      ok: true,
      configured: true,
      source: payload.source || 'facebook-public-reels',
      checkedAt: payload.checkedAt || new Date().toISOString(),
      cached: Boolean(payload.cached),
      stale: Boolean(payload.stale),
      reels
    });
  } catch (error) {
    console.error('Facebook Reels checker failed:', error?.message || error);
    return res.status(502).json({
      ok: false,
      configured: true,
      warning: 'Facebook Reels could not be checked right now.'
    });
  }
};
