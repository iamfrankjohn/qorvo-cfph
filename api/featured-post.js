const crypto = require('crypto');
const localFallback = require('../data/featured-post.json');

const FILE_PATH = 'data/featured-post.json';

function githubConfig() {
  return {
    token: process.env.GITHUB_CONTENT_TOKEN,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    branch: process.env.GITHUB_REPO_BRANCH || 'main'
  };
}

function configured(cfg) {
  return Boolean(cfg.token && cfg.owner && cfg.repo);
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function isFacebookPostUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    return (host === 'facebook.com' || host === 'm.facebook.com') && url.pathname.length > 1;
  } catch {
    return false;
  }
}

async function githubRequest(url, options, token) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'qorvo-cfph-admin',
      ...(options && options.headers ? options.headers : {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text.slice(0, 300)}`);
  }
  return response.json();
}

async function readFromGithub(cfg) {
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${FILE_PATH}?ref=${encodeURIComponent(cfg.branch)}`;
  const result = await githubRequest(apiUrl, { method: 'GET' }, cfg.token);
  const json = Buffer.from(result.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return { data: JSON.parse(json), sha: result.sha };
}

async function writeToGithub(cfg, data, sha) {
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${FILE_PATH}`;
  return githubRequest(apiUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Update featured QORVO Facebook post',
      content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`, 'utf8').toString('base64'),
      sha,
      branch: cfg.branch
    })
  }, cfg.token);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const cfg = githubConfig();

  if (req.method === 'GET') {
    try {
      if (!configured(cfg)) {
        return res.status(200).json({ ok: true, post: localFallback, source: 'local' });
      }
      const current = await readFromGithub(cfg);
      return res.status(200).json({ ok: true, post: current.data, source: 'github' });
    } catch (error) {
      console.error(error);
      return res.status(200).json({ ok: true, post: localFallback, source: 'fallback', warning: 'Could not read GitHub data.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const configuredPassword = process.env.QORVO_ADMIN_PASSWORD;
  if (!configuredPassword) {
    return res.status(500).json({ ok: false, error: 'QORVO_ADMIN_PASSWORD is not configured in Vercel.' });
  }

  const { password, url, label, title, enabled } = req.body || {};
  if (!safeEqual(password, configuredPassword)) {
    return res.status(401).json({ ok: false, error: 'Incorrect admin password.' });
  }
  if (!configured(cfg)) {
    return res.status(500).json({ ok: false, error: 'GitHub storage environment variables are not configured.' });
  }

  const cleanUrl = String(url || '').trim();
  const isEnabled = enabled !== false;
  if (isEnabled && !isFacebookPostUrl(cleanUrl)) {
    return res.status(400).json({ ok: false, error: 'Please paste a valid Facebook post URL.' });
  }

  const nextData = {
    enabled: isEnabled,
    url: isEnabled ? cleanUrl : '',
    label: String(label || 'PINNED FROM QORVO').trim().slice(0, 60),
    title: String(title || 'Featured QORVO Post').trim().slice(0, 100),
    updatedAt: new Date().toISOString()
  };

  try {
    const current = await readFromGithub(cfg);
    await writeToGithub(cfg, nextData, current.sha);
    return res.status(200).json({ ok: true, post: nextData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Could not save to GitHub. Check the token/repository settings.' });
  }
};
