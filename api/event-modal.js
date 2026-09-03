const crypto = require('crypto');

const CONFIG_PATH = 'data/event-modal.json';
const MODAL_DIR = 'assets/event-modals';
const LEGACY_PATHS = ['assets/civil-war-3v3.webp', 'assets/civil-war-3v3.png'];

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
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cleanText(value, max = 120) {
  return String(value || '').trim().slice(0, max);
}

function clampDelay(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return 4;
  return Math.min(30, Math.max(0, seconds));
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function contentsUrl(cfg, path, withRef = false) {
  const base = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${encodePath(path)}`;
  return withRef ? `${base}?ref=${encodeURIComponent(cfg.branch)}` : base;
}

async function githubRequest(url, options, token, allow404 = false) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'qorvo-cfph-admin',
      ...(options?.headers || {})
    }
  });

  if (allow404 && response.status === 404) return null;

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text.slice(0, 300)}`);
  }

  if (response.status === 204) return {};
  return response.json();
}

async function getFile(cfg, path) {
  return githubRequest(contentsUrl(cfg, path, true), { method: 'GET' }, cfg.token, true);
}

async function getDirectory(cfg, path) {
  const result = await githubRequest(contentsUrl(cfg, path, true), { method: 'GET' }, cfg.token, true);
  return Array.isArray(result) ? result : [];
}

async function putFile(cfg, path, bytes, message, sha) {
  const body = {
    message,
    content: Buffer.from(bytes).toString('base64'),
    branch: cfg.branch
  };
  if (sha) body.sha = sha;

  return githubRequest(
    contentsUrl(cfg, path),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    },
    cfg.token
  );
}

async function deleteFile(cfg, path, message, knownSha) {
  let sha = knownSha;
  if (!sha) {
    const current = await getFile(cfg, path);
    if (!current?.sha) return false;
    sha = current.sha;
  }

  await githubRequest(
    contentsUrl(cfg, path),
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sha, branch: cfg.branch })
    },
    cfg.token
  );
  return true;
}

async function readConfig(cfg) {
  const file = await getFile(cfg, CONFIG_PATH);
  if (!file?.content) return null;

  try {
    const data = JSON.parse(Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'));
    return { data, sha: file.sha };
  } catch {
    return null;
  }
}

async function legacyModal(cfg) {
  for (const path of LEGACY_PATHS) {
    const file = await getFile(cfg, path);
    if (file?.sha) {
      return {
        enabled: true,
        title: 'QORVO Civil War 3v3',
        imagePath: path,
        imageUrl: `/${path}`,
        delaySeconds: 4,
        updatedAt: null,
        legacy: true
      };
    }
  }
  return null;
}

async function currentModal(cfg) {
  const config = await readConfig(cfg);
  if (config?.data?.imagePath) {
    const data = config.data;
    return {
      enabled: data.enabled !== false,
      title: cleanText(data.title, 120) || 'QORVO Event Announcement',
      imagePath: cleanText(data.imagePath, 220),
      imageUrl: cleanText(data.imageUrl, 240) || `/${cleanText(data.imagePath, 220)}`,
      delaySeconds: clampDelay(data.delaySeconds),
      updatedAt: data.updatedAt || null,
      legacy: false
    };
  }
  return legacyModal(cfg);
}

function parseImageData(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) throw new Error('Unsupported image. Use PNG, JPG, or WebP.');

  const mime = match[1];
  const bytes = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (!bytes.length) throw new Error('The uploaded image is empty.');
  if (bytes.length > 3 * 1024 * 1024) throw new Error('The processed image is too large. Please use an image under 3 MB.');

  const valid =
    (mime === 'image/png' && bytes.length > 8 && bytes.slice(1,4).toString('ascii') === 'PNG') ||
    (mime === 'image/jpeg' && bytes[0] === 0xFF && bytes[1] === 0xD8) ||
    (mime === 'image/webp' && bytes.slice(0,4).toString('ascii') === 'RIFF' && bytes.slice(8,12).toString('ascii') === 'WEBP');

  if (!valid) throw new Error('The uploaded image data is invalid.');

  const ext = mime === 'image/png' ? 'png' : mime === 'image/jpeg' ? 'jpg' : 'webp';
  return { bytes, ext };
}

function isManagedImagePath(path) {
  const value = String(path || '');
  return value.startsWith(`${MODAL_DIR}/`) || LEGACY_PATHS.includes(value);
}

async function cleanupUnusedImages(cfg, keepPath = '') {
  const errors = [];

  try {
    const files = await getDirectory(cfg, MODAL_DIR);
    for (const file of files) {
      if (file?.type !== 'file' || !file.path || file.path === keepPath) continue;
      try {
        await deleteFile(cfg, file.path, 'Remove unused QORVO event modal image', file.sha);
      } catch (error) {
        errors.push(file.path);
      }
    }
  } catch {
    // Directory may not exist yet.
  }

  for (const path of LEGACY_PATHS) {
    if (path === keepPath) continue;
    try {
      await deleteFile(cfg, path, 'Remove old QORVO event modal image');
    } catch {
      errors.push(path);
    }
  }

  return errors;
}

function verifyPin(req, res) {
  const configuredPin = process.env.QORVO_ADMIN_PIN;
  if (!configuredPin || !/^\d{6}$/.test(configuredPin)) {
    res.status(500).json({ ok: false, error: 'QORVO_ADMIN_PIN must be configured in Vercel as exactly 6 digits.' });
    return false;
  }
  if (!safeEqual(req.body?.pin, configuredPin)) {
    res.status(401).json({ ok: false, error: 'Incorrect admin PIN.' });
    return false;
  }
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const cfg = githubConfig();

  if (req.method === 'GET') {
    if (!configured(cfg)) {
      return res.status(200).json({ ok: true, modal: null, source: 'unconfigured' });
    }

    try {
      return res.status(200).json({ ok: true, modal: await currentModal(cfg), source: 'github' });
    } catch (error) {
      console.error(error);
      return res.status(200).json({ ok: true, modal: null, source: 'fallback', warning: 'Could not load the event modal.' });
    }
  }

  if (!['POST', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!verifyPin(req, res)) return;
  if (!configured(cfg)) {
    return res.status(500).json({ ok: false, error: 'GitHub storage environment variables are not configured.' });
  }

  if (req.method === 'DELETE') {
    try {
      const config = await readConfig(cfg);

      // Delete the images first so removing a modal cannot leave unused event photos behind.
      await cleanupUnusedImages(cfg, '');

      if (config?.sha) {
        await deleteFile(cfg, CONFIG_PATH, 'Remove QORVO event modal', config.sha);
      }

      return res.status(200).json({ ok: true, modal: null });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: 'Could not completely remove the modal and its photo from GitHub.' });
    }
  }

  try {
    const existingConfig = await readConfig(cfg);
    const existing = existingConfig?.data?.imagePath
      ? existingConfig.data
      : await legacyModal(cfg);

    let imagePath = existing?.imagePath || '';
    const imageData = String(req.body?.imageData || '');

    if (imageData) {
      const { bytes, ext } = parseImageData(imageData);
      imagePath = `${MODAL_DIR}/event-modal-${Date.now()}.${ext}`;
      await putFile(cfg, imagePath, bytes, 'Upload QORVO event modal image');
    }

    if (!imagePath) {
      return res.status(400).json({ ok: false, error: 'Choose an event image before publishing the modal.' });
    }

    const next = {
      enabled: true,
      title: cleanText(req.body?.title, 120) || 'QORVO Event Announcement',
      imagePath,
      imageUrl: `/${imagePath}`,
      delaySeconds: clampDelay(req.body?.delaySeconds),
      updatedAt: new Date().toISOString()
    };

    await putFile(
      cfg,
      CONFIG_PATH,
      Buffer.from(`${JSON.stringify(next, null, 2)}\n`, 'utf8'),
      'Update QORVO event modal',
      existingConfig?.sha
    );

    // Keep only the active image. This also removes the old Civil War hardcoded asset after migration.
    const cleanupErrors = await cleanupUnusedImages(cfg, imagePath);

    return res.status(200).json({
      ok: true,
      modal: next,
      warning: cleanupErrors.length ? `Published, but ${cleanupErrors.length} old image(s) could not be cleaned up yet.` : null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: error.message || 'Could not publish the event modal.' });
  }
};
