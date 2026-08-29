const OFFICIAL_LIST_URL = 'https://cfph.onstove.com/News/List';
const FALLBACK_IMAGE = '/assets/qorvo-logo.jpg';
const FETCH_TIMEOUT_MS = 12000;

function sendJson(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  res.end(JSON.stringify(body));
}

function compact(text = '', max = 320) {
  const clean = String(text)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function absolute(base, value) {
  if (!value) return null;
  const v = String(value).trim();
  if (!v || v.startsWith('data:')) return null;
  try { return new URL(v, base).toString(); }
  catch { return null; }
}

function normalizeUrl(value) {
  if (!value) return value;
  return String(value)
    .replace('cfph-mig.onstove.com', 'cfph.onstove.com')
    .replace('http://cfph.onstove.com', 'https://cfph.onstove.com');
}

async function fetchText(url, extraHeaders = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-PH,en;q=0.9',
      'Referer': 'https://cfph.onstove.com/',
      ...extraHeaders
    }
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return { text: await response.text(), finalUrl: response.url || url };
}

async function fetchViaJina(targetUrl) {
  const readerUrl = `https://r.jina.ai/${targetUrl}`;
  return fetchText(readerUrl, {
    'Accept': 'text/plain',
    'X-Return-Format': 'markdown',
    'X-Engine': 'browser',
    'X-Cache-Tolerance': '900'
  });
}

function meta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["']`, 'i')
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].replace(/&amp;/g, '&');
  }
  return null;
}

function looksLikeNewsLink(url, title = '') {
  const u = String(url || '').toLowerCase();
  const t = String(title || '').toLowerCase();
  if (!u.includes('cfph.onstove.com')) return false;
  if (!u.includes('/news')) return false;
  if (/\/news\/?(list)?$/i.test(new URL(url).pathname)) return false;
  if (/facebook|discord|login|signup|download/i.test(t)) return false;
  return true;
}

function extractDirectHtmlCandidates(html, baseUrl) {
  const candidates = [];
  const re = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(re)) {
    const url = normalizeUrl(absolute(baseUrl, m[2]));
    const title = compact(m[4], 180);
    if (!url || !title || !looksLikeNewsLink(url, title)) continue;
    const img = m[4].match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i)?.[1] || null;
    candidates.push({ title, url, image: absolute(baseUrl, img), date: null });
  }
  return candidates;
}

function extractMarkdownCandidates(markdown, baseUrl) {
  const lines = String(markdown || '').split(/\r?\n/);
  const candidates = [];
  const linkRe = /\[([^\]]{6,220})\]\((https?:\/\/[^)]+|\/[^)]+)\)/g;
  const dateRe = /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(20\d{2})\b/;
  const imageRe = /!\[[^\]]*\]\((https?:\/\/[^)]+|\/[^)]+)\)/;

  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(linkRe)) {
      const title = compact(m[1], 180);
      const url = normalizeUrl(absolute(baseUrl, m[2]));
      if (!url || !looksLikeNewsLink(url, title)) continue;

      let date = null;
      let image = null;
      for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 7); j++) {
        if (!date) {
          const dm = lines[j].match(dateRe);
          if (dm) date = `${dm[3]}-${String(dm[1]).padStart(2, '0')}-${String(dm[2]).padStart(2, '0')}`;
        }
        if (!image) {
          const im = lines[j].match(imageRe);
          if (im) image = absolute(baseUrl, im[1]);
        }
      }
      candidates.push({ title, url, image, date, order: i });
    }
  }

  const seen = new Set();
  return candidates.filter(c => {
    const key = c.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function chooseLatest(candidates) {
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : 0;
    const db = b.date ? Date.parse(b.date) : 0;
    if (db !== da) return db - da;
    return (a.order ?? 9999) - (b.order ?? 9999);
  })[0];
}

function extractMarkdownSummary(markdown, title) {
  const lines = String(markdown || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^(!?\[|#{1,6}\s|[-*_]{3,})/.test(s))
    .filter(s => !/^(like\s+\d+|by\s+gm\b|events?|news|promo|announcement)$/i.test(s));

  const body = lines
    .filter(s => !title || !s.toLowerCase().includes(title.toLowerCase()))
    .filter(s => s.length >= 35)
    .slice(0, 4)
    .join(' ');
  return compact(body, 300);
}

async function enrichArticle(candidate) {
  // First try the official article directly.
  try {
    const { text: html, finalUrl } = await fetchText(candidate.url);
    const title = compact(meta(html, 'og:title') || meta(html, 'twitter:title') || candidate.title, 180);
    const summary = compact(
      meta(html, 'og:description') || meta(html, 'twitter:description') || meta(html, 'description') || '',
      300
    );
    const image = absolute(finalUrl, meta(html, 'og:image') || meta(html, 'twitter:image')) || candidate.image;
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
    return {
      ...candidate,
      title: title || candidate.title,
      summary: summary || candidate.summary || '',
      image,
      url: normalizeUrl(absolute(finalUrl, canonical) || finalUrl || candidate.url)
    };
  } catch {}

  // STOVE often blocks Vercel/server-side requests. Jina Reader renders the page in a browser,
  // which gives us a second path without exposing credentials in the frontend.
  try {
    const { text: markdown } = await fetchViaJina(candidate.url);
    const titleMatch = markdown.match(/^Title:\s*(.+)$/mi);
    const imageMatch = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/);
    const dateMatch = markdown.match(/\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(20\d{2})\b/);
    return {
      ...candidate,
      title: compact(titleMatch?.[1] || candidate.title, 180),
      summary: extractMarkdownSummary(markdown, candidate.title) || candidate.summary || '',
      image: imageMatch?.[1] || candidate.image,
      date: candidate.date || (dateMatch ? `${dateMatch[3]}-${String(dateMatch[1]).padStart(2, '0')}-${String(dateMatch[2]).padStart(2, '0')}` : null)
    };
  } catch {
    return candidate;
  }
}

async function getLatestNews() {
  const sourceUrl = normalizeUrl(process.env.CROSSFIRE_NEWS_URL || OFFICIAL_LIST_URL);
  const errors = [];

  // 1) Best case: direct STOVE HTML fetch.
  try {
    const { text: html, finalUrl } = await fetchText(sourceUrl);
    const latest = chooseLatest(extractDirectHtmlCandidates(html, finalUrl));
    if (latest) return { latest: await enrichArticle(latest), method: 'direct' };
    errors.push('Direct STOVE fetch returned no usable news links.');
  } catch (e) {
    errors.push(`Direct STOVE fetch: ${e.message}`);
  }

  // 2) Reliable fallback: browser-rendered Reader proxy.
  try {
    const { text: markdown } = await fetchViaJina(sourceUrl);
    const latest = chooseLatest(extractMarkdownCandidates(markdown, sourceUrl));
    if (latest) return { latest: await enrichArticle(latest), method: 'reader' };
    errors.push('Reader fetch returned no usable news links.');
  } catch (e) {
    errors.push(`Reader fetch: ${e.message}`);
  }

  throw new Error(errors.join(' | '));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const { latest, method } = await getLatestNews();
    return sendJson(res, 200, {
      ok: true,
      source: 'CrossFire Philippines official news',
      method,
      title: latest.title || 'Latest CrossFire Philippines update',
      summary: latest.summary || 'Read the latest official CrossFire Philippines announcement.',
      date: latest.date || null,
      image: latest.image || FALLBACK_IMAGE,
      url: latest.url || OFFICIAL_LIST_URL,
      fallback: false
    });
  } catch (error) {
    return sendJson(res, 200, {
      ok: true,
      source: 'CrossFire Philippines official news',
      title: 'Latest CrossFire Philippines updates',
      summary: 'CrossFire Philippines news is temporarily unavailable for automatic preview. Open the official News page to see the newest announcement.',
      date: null,
      image: FALLBACK_IMAGE,
      url: OFFICIAL_LIST_URL,
      fallback: true,
      warning: String(error?.message || error).slice(0, 700)
    });
  }
}
