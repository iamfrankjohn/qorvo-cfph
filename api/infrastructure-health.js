const CRITICAL_URL = 'https://media.koufuprinting.com/health';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkOnce() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(CRITICAL_URL, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'User-Agent': 'QORVO-CFPH-Health/7.83' }
    });
    if (!response.ok) return false;
    const data = await response.json().catch(() => null);
    return Boolean(data && data.ok === true);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (await checkOnce()) {
      return res.status(200).json({ ok: true, infrastructure: 'online', attempts: attempt });
    }
    if (attempt < 3) await sleep(300);
  }

  return res.status(503).json({ ok: false, infrastructure: 'unavailable', attempts: 3 });
}
