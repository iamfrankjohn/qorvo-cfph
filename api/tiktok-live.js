const localMembers = require('../data/tiktok-members.json');

const FILE_PATH = 'data/tiktok-members.json';

function githubConfig() {
  return {
    token: process.env.GITHUB_CONTENT_TOKEN,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    branch: process.env.GITHUB_REPO_BRANCH || 'main'
  };
}

function githubConfigured(c) {
  return Boolean(c.token && c.owner && c.repo);
}

function checkerConfig() {
  const baseUrl = String(process.env.TIKTOK_CHECKER_URL || '').trim().replace(/\/+$/, '');
  const secret = String(process.env.TIKTOK_CHECKER_SECRET || '').trim();
  return { baseUrl, secret };
}

async function readMembers() {
  const c = githubConfig();
  if (!githubConfigured(c)) return localMembers.members || [];

  const url = `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${FILE_PATH}?ref=${encodeURIComponent(c.branch)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${c.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'qorvo-cfph-live'
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  const payload = await response.json();
  const data = JSON.parse(Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8'));
  return Array.isArray(data.members) ? data.members : [];
}

function normalizeLiveMember(member) {
  const username = String(member?.username || '').replace(/^@+/, '').trim();
  if (!username) return null;

  return {
    id: `tiktok-${username}`,
    name: String(member?.name || username).trim(),
    username,
    title: `${String(member?.name || username).trim()} is LIVE on TikTok`,
    viewers: Number(member?.viewers || 0) || 0,
    roomId: String(member?.roomId || ''),
    url: member?.url || `https://www.tiktok.com/@${encodeURIComponent(username)}/live`
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Every website visit may reach this Vercel function. The self-hosted checker
  // decides whether TikTok actually needs to be contacted using its 2-minute cache.
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const checker = checkerConfig();
  if (!checker.baseUrl || !checker.secret) {
    return res.status(200).json({
      ok: true,
      configured: false,
      live: [],
      message: 'Self-hosted TikTok checker is not configured in Vercel.'
    });
  }

  try {
    const members = (await readMembers())
      .filter(member => member?.enabled !== false && member?.username)
      .map(member => ({
        name: String(member.name || member.username).trim(),
        username: String(member.username).replace(/^@+/, '').trim(),
        enabled: true
      }))
      .slice(0, 12);

    if (!members.length) {
      return res.status(200).json({
        ok: true,
        configured: true,
        checkedAt: null,
        source: 'no-members',
        live: []
      });
    }

    const response = await fetch(`${checker.baseUrl}/api/live`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-qorvo-key': checker.secret
      },
      body: JSON.stringify({ members }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Checker HTTP ${response.status}`);
    }

    const payload = await response.json();
    const live = (Array.isArray(payload.live) ? payload.live : [])
      .map(normalizeLiveMember)
      .filter(Boolean);

    return res.status(200).json({
      ok: true,
      configured: true,
      checkedAt: payload.checkedAt || new Date().toISOString(),
      source: payload.source || 'checker',
      cacheAgeSeconds: Number(payload.cacheAgeSeconds || 0) || 0,
      live
    });
  } catch (error) {
    console.error('Self-hosted TikTok checker failed:', error?.message || error);
    return res.status(200).json({
      ok: true,
      configured: true,
      live: [],
      warning: 'TikTok LIVE status could not be checked right now.'
    });
  }
};
