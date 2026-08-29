const localMembers = require('../data/tiktok-members.json');

const FILE_PATH = 'data/tiktok-members.json';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let memoryCache = { key: '', at: 0, payload: null };

function cfg() {
  return {
    token: process.env.GITHUB_CONTENT_TOKEN,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    branch: process.env.GITHUB_REPO_BRANCH || 'main'
  };
}

function ghConfigured(c) {
  return Boolean(c.token && c.owner && c.repo);
}

function liveMonitoringEnabled() {
  return String(process.env.TIKTOOLS_LIVE_ENABLED || '').toLowerCase() === 'true';
}

async function readMembers() {
  const c = cfg();
  if (!ghConfigured(c)) return localMembers.members || [];

  const url = `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${FILE_PATH}?ref=${encodeURIComponent(c.branch)}`;
  const r = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${c.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'qorvo-cfph-live'
    }
  });

  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const x = await r.json();
  const data = JSON.parse(Buffer.from(x.content.replace(/\n/g, ''), 'base64').toString('utf8'));
  return Array.isArray(data.members) ? data.members : [];
}

async function checkOne(member, key) {
  const u = encodeURIComponent(member.username);
  const r = await fetch(`https://api.tik.tools/webcast/check_alive?unique_id=${u}`, {
    headers: { 'x-api-key': key, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000)
  });

  if (!r.ok) throw new Error(`TikTools ${r.status}`);
  const x = await r.json();
  const raw = Array.isArray(x.data) ? x.data[0] : x.data;
  if (!raw) return null;

  const alive = raw.alive === true || raw.is_live === true || raw.alive_status === 'live' || raw.live_status === 'live';
  if (!alive) return null;

  return {
    id: `tiktok-${member.username}`,
    name: member.name || member.username,
    username: member.username,
    title: String(raw.title || `${member.name || member.username} is LIVE on TikTok`).trim(),
    viewers: Number(raw.userCount ?? raw.user_count ?? 0) || 0,
    roomId: String(raw.room_id || ''),
    url: `https://www.tiktok.com/@${encodeURIComponent(member.username)}/live`
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Vercel CDN may reuse this response for 5 minutes, so many visitors do not
  // cause one TikTools request each. stale-while-revalidate keeps the page fast.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (!liveMonitoringEnabled()) {
    return res.status(200).json({
      ok: true,
      enabled: false,
      configured: Boolean(process.env.TIKTOOLS_API_KEY),
      live: [],
      message: 'TikTok LIVE monitoring is disabled. Set TIKTOOLS_LIVE_ENABLED=true only with a plan permitted for production use.'
    });
  }

  const key = process.env.TIKTOOLS_API_KEY;
  if (!key) {
    return res.status(200).json({
      ok: true,
      enabled: true,
      configured: false,
      live: [],
      message: 'TIKTOOLS_API_KEY is not configured.'
    });
  }

  try {
    const members = (await readMembers())
      .filter(m => m.enabled !== false && m.username)
      .slice(0, 8);

    const cacheKey = members.map(m => m.username).join('|');
    if (memoryCache.payload && memoryCache.key === cacheKey && Date.now() - memoryCache.at < CACHE_TTL_MS) {
      return res.status(200).json(memoryCache.payload);
    }

    const live = [];
    for (const member of members) {
      try {
        const x = await checkOne(member, key);
        if (x) live.push(x);
      } catch (e) {
        console.warn('TikTok live check failed:', member.username, e.message);
      }
    }

    const payload = {
      ok: true,
      enabled: true,
      configured: true,
      checkedAt: new Date().toISOString(),
      cacheSeconds: 300,
      live
    };

    memoryCache = { key: cacheKey, at: Date.now(), payload };
    return res.status(200).json(payload);
  } catch (e) {
    console.error(e);
    return res.status(200).json({
      ok: true,
      enabled: true,
      configured: true,
      live: [],
      warning: 'TikTok live status could not be checked right now.'
    });
  }
};
