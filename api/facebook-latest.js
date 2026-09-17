function checkerConfig() {
  const baseUrl = String(process.env.FACEBOOK_CHECKER_URL || '').trim().replace(/\/+$/, '');
  const secret = String(process.env.FACEBOOK_CHECKER_SECRET || '').trim();
  return { baseUrl, secret };
}

function cleanPost(post) {
  if (!post || typeof post !== 'object') return null;

  const url = String(post.url || '').trim();
  if (!url || !/^https:\/\/(www\.)?facebook\.com\//i.test(url)) return null;

  const image = String(post.image || '').trim();
  return {
    author: String(post.author || 'QORVO CFPH').trim(),
    age: String(post.age || '').trim(),
    caption: String(post.caption || '').trim(),
    url,
    image: /^https:\/\//i.test(image) ? image : '',
    imageAlt: String(post.imageAlt || '').trim()
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // The browser only calls this Vercel function. The private checker key is
  // attached server-side and is never sent to the website visitor.
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
    const response = await fetch(`${checker.baseUrl}/latest`, {
      headers: {
        Accept: 'application/json',
        'x-qorvo-key': checker.secret
      },
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) throw new Error(`Checker HTTP ${response.status}`);

    const payload = await response.json();
    const post = cleanPost(payload?.post);
    if (!payload?.ok || !post) throw new Error('Checker returned an invalid post');

    return res.status(200).json({
      ok: true,
      configured: true,
      source: payload.source || 'facebook-public',
      checkedAt: payload.checkedAt || new Date().toISOString(),
      cached: Boolean(payload.cached),
      stale: Boolean(payload.stale),
      post
    });
  } catch (error) {
    console.error('Facebook latest checker failed:', error?.message || error);
    return res.status(502).json({
      ok: false,
      configured: true,
      warning: 'The latest Facebook post could not be checked right now.'
    });
  }
};
