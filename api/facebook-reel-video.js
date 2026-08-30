function checkerConfig() {
  const baseUrl = String(process.env.FACEBOOK_CHECKER_URL || '').trim().replace(/\/+$/, '');
  const secret = String(process.env.FACEBOOK_CHECKER_SECRET || '').trim();
  return { baseUrl, secret };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const id = String(req.query?.id || '').trim();
  if (!/^[0-9]{5,30}$/.test(id)) {
    return res.status(400).json({ ok: false, error: 'Invalid Reel ID' });
  }

  const checker = checkerConfig();
  if (!checker.baseUrl || !checker.secret) {
    return res.status(503).json({ ok: false, error: 'Facebook checker is not configured.' });
  }

  try {
    const headers = {
      Accept: 'video/mp4',
      'x-qorvo-key': checker.secret
    };
    if (req.headers.range) headers.Range = req.headers.range;

    const upstream = await fetch(`${checker.baseUrl}/reel-video/${encodeURIComponent(id)}`, {
      method: req.method,
      headers,
      signal: AbortSignal.timeout(55000)
    });

    const contentType = upstream.headers.get('content-type') || '';
    if (!upstream.ok && upstream.status !== 206) {
      let detail = `Checker HTTP ${upstream.status}`;
      if (contentType.includes('application/json')) {
        try {
          const payload = await upstream.json();
          detail = payload?.detail || payload?.error || detail;
        } catch (_) {}
      }
      return res.status(upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502)
        .json({ ok: false, error: 'Unable to prepare Reel video', detail });
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    res.setHeader('Cache-Control', 'private, max-age=3600');

    for (const name of ['content-length', 'content-range', 'last-modified', 'etag']) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }

    if (req.method === 'HEAD') return res.end();

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.end(buffer);
  } catch (error) {
    console.error('Facebook Reel video proxy failed:', error?.message || error);
    return res.status(502).json({
      ok: false,
      error: 'Facebook Reel video could not be loaded right now.'
    });
  }
};
