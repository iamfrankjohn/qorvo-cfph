const OFFICIAL_NEWS_URL = 'https://cfph.onstove.com/News/List';
const FALLBACK_IMAGE = '/assets/qorvo-logo.jpg';
const FETCH_TIMEOUT_MS = 9000;

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Keep one copy at the edge for 15 minutes and allow stale data for an hour.
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  res.end(JSON.stringify(body));
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(value = '') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(value = '', max = 300) {
  const text = stripHtml(value);
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function absolute(base, value) {
  if (!value || typeof value !== 'string') return null;
  const cleaned = decodeHtml(value).replace(/\\u002F/gi, '/').replace(/\\\//g, '/').trim();
  if (!cleaned || cleaned.startsWith('data:')) return null;
  try { return new URL(cleaned, base).toString(); }
  catch { return null; }
}

function normalizeOfficialUrl(value) {
  if (!value) return value;
  return String(value)
    .replace('cfph-mig.onstove.com', 'cfph.onstove.com')
    .replace('http://cfph.onstove.com', 'https://cfph.onstove.com');
}

function findMeta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }
  return null;
}

function dateValue(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function looksLikeArticleUrl(url = '') {
  const u = String(url).toLowerCase();
  return (
    /\/news\/(view|detail|article|read)/.test(u) ||
    /[?&](postno|boardno|articleid|newsno|seq|id)=\d+/.test(u) ||
    /page\.onstove\.com\/cfph\/.+\/view\/\d+/.test(u)
  );
}

function scoreCandidate(item) {
  let score = 0;
  const title = (item.title || '').toLowerCase();
  const url = (item.url || '').toLowerCase();
  if (looksLikeArticleUrl(url)) score += 80;
  if (url.includes('/news/')) score += 30;
  if (/update|notice|maintenance|event|patch|news|announcement|migration|server/.test(title)) score += 12;
  if ((item.title || '').length >= 12) score += 8;
  if (item.date) score += 8;
  if (item.image) score += 5;
  if (item.summary) score += 4;
  if (/login|signup|register|download|support|facebook|discord|home$/i.test(title)) score -= 80;
  if (/\/news\/?(list)?$/i.test(new URL(item.url || 'https://x.invalid').pathname)) score -= 60;
  return score;
}

function addCandidate(store, baseUrl, raw = {}) {
  const title = compact(raw.title || raw.headline || raw.subject || raw.name || '', 180);
  const url = normalizeOfficialUrl(absolute(baseUrl, raw.url || raw.href || raw.link || raw.permalink || raw.webUrl));
  if (!title || !url || title.length < 6) return;

  const imageValue = Array.isArray(raw.image) ? raw.image[0] :
    (typeof raw.image === 'object' ? (raw.image?.url || raw.image?.contentUrl) : raw.image);

  store.push({
    title,
    url,
    date: raw.date || raw.datePublished || raw.publishedAt || raw.publishDate || raw.createdAt || raw.regDate || null,
    image: absolute(baseUrl, imageValue || raw.thumbnail || raw.thumbnailUrl || raw.imageUrl || raw.coverImage || null),
    summary: compact(raw.summary || raw.description || raw.excerpt || raw.content || raw.body || '', 320)
  });
}

function walkJson(node, baseUrl, candidates, depth = 0) {
  if (!node || depth > 10) return;
  if (Array.isArray(node)) {
    for (const child of node) walkJson(child, baseUrl, candidates, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;

  const keys = Object.keys(node);
  const hasTitle = keys.some(k => /^(title|headline|subject|name)$/i.test(k));
  const hasUrl = keys.some(k => /^(url|href|link|permalink|webUrl)$/i.test(k));
  if (hasTitle && hasUrl) addCandidate(candidates, baseUrl, node);

  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') walkJson(value, baseUrl, candidates, depth + 1);
  }
}

function extractJsonCandidates(html, baseUrl, candidates) {
  // JSON-LD
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walkJson(JSON.parse(match[1]), baseUrl, candidates); } catch {}
  }

  // Common SPA hydration payloads (Next.js / Nuxt / generic application JSON)
  for (const match of html.matchAll(/<script[^>]+(?:id=["']__NEXT_DATA__["']|type=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walkJson(JSON.parse(match[1]), baseUrl, candidates); } catch {}
  }

  // Some sites embed escaped JSON directly in JS. Pull likely news objects conservatively.
  const objectRe = /\{[^{}]{0,1800}(?:"title"|"subject"|"headline")[^{}]{0,1800}(?:"url"|"href"|"link")[^{}]{0,1800}\}/gi;
  for (const match of html.matchAll(objectRe)) {
    try { walkJson(JSON.parse(match[0]), baseUrl, candidates); } catch {}
  }
}

function extractAnchorCandidates(html, baseUrl, candidates) {
  const anchorRe = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRe)) {
    const href = match[2];
    const text = compact(match[4], 180);
    if (!text || text.length < 8) continue;

    const url = normalizeOfficialUrl(absolute(baseUrl, href));
    if (!url) continue;

    const lower = `${href} ${text}`.toLowerCase();
    if (!looksLikeArticleUrl(url) && !/news|notice|update|maintenance|event|patch|announcement|migration/.test(lower)) continue;

    // Try to capture a thumbnail from inside the anchor.
    const img = match[4].match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i)?.[1] || null;
    addCandidate(candidates, baseUrl, { title: text, url, image: img });
  }
}

function extractCandidates(html, baseUrl) {
  const candidates = [];
  extractJsonCandidates(html, baseUrl, candidates);
  extractAnchorCandidates(html, baseUrl, candidates);

  const seen = new Set();
  return candidates
    .filter(item => {
      const key = `${item.url}|${item.title}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const dateDiff = dateValue(b.date) - dateValue(a.date);
      if (dateDiff) return dateDiff;
      return scoreCandidate(b) - scoreCandidate(a);
    });
}

function extractArticleText(html) {
  // Prefer paragraphs from article/main content. This is intentionally generic
  // because STOVE has changed its markup several times.
  const scoped =
    html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ||
    html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
    html;

  const paragraphs = [];
  for (const match of scoped.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = compact(match[1], 500);
    if (text.length < 35) continue;
    if (/cookie|privacy|terms|customer service|javascript enabled/i.test(text)) continue;
    paragraphs.push(text);
    if (paragraphs.join(' ').length > 450) break;
  }
  return compact(paragraphs.join(' '), 360);
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-PH,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Referer': 'https://cfph.onstove.com/'
    }
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return { html: await response.text(), finalUrl: response.url || url };
}

async function enrich(candidate) {
  try {
    const { html, finalUrl } = await fetchHtml(candidate.url);
    const title = findMeta(html, 'og:title') || findMeta(html, 'twitter:title') || candidate.title;
    const description =
      findMeta(html, 'og:description') ||
      findMeta(html, 'twitter:description') ||
      findMeta(html, 'description') ||
      candidate.summary ||
      extractArticleText(html);
    const image =
      findMeta(html, 'og:image') ||
      findMeta(html, 'twitter:image') ||
      candidate.image;
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || finalUrl;
    const time =
      html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1] ||
      html.match(/"(?:datePublished|publishedAt|publishDate|createdAt|regDate)"\s*:\s*"([^"]+)"/i)?.[1] ||
      candidate.date;

    return {
      ...candidate,
      title: compact(title, 180) || candidate.title,
      summary: compact(description, 360) || 'Read the latest official CrossFire Philippines announcement.',
      image: absolute(finalUrl, image),
      date: time || null,
      url: normalizeOfficialUrl(absolute(finalUrl, canonical) || candidate.url)
    };
  } catch {
    return candidate;
  }
}

function sourceVariants(configuredUrl) {
  const configured = normalizeOfficialUrl(configuredUrl || OFFICIAL_NEWS_URL);
  const urls = [
    configured,
    'https://cfph.onstove.com/News/List',
    'https://cfph.onstove.com/News'
  ];
  return [...new Set(urls)];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const configuredUrl = process.env.CROSSFIRE_NEWS_URL || OFFICIAL_NEWS_URL;
  const sources = sourceVariants(configuredUrl);
  const errors = [];

  for (const sourceUrl of sources) {
    try {
      const { html, finalUrl } = await fetchHtml(sourceUrl);
      const candidates = extractCandidates(html, finalUrl);
      const latestCandidate = candidates.find(item => scoreCandidate(item) > 20) || candidates[0];
      if (!latestCandidate) throw new Error('No news entries detected.');

      const latest = await enrich(latestCandidate);
      return json(res, 200, {
        ok: true,
        source: 'CrossFire Philippines official news',
        title: latest.title || 'Latest CrossFire Philippines update',
        summary: latest.summary || 'Read the latest official CrossFire Philippines announcement.',
        date: latest.date,
        image: latest.image || FALLBACK_IMAGE,
        url: latest.url || sourceUrl,
        fallback: false
      });
    } catch (error) {
      errors.push(error?.message || String(error));
    }
  }

  // The official STOVE edge occasionally blocks server-side requests. Keep the
  // card useful and clickable instead of exposing an error/blank area.
  return json(res, 200, {
    ok: true,
    source: 'CrossFire Philippines official news',
    title: 'Latest CrossFire Philippines updates',
    summary: 'The official news feed could not be read automatically right now. Open CrossFire Philippines News to view the newest notices, events, maintenance posts and game updates.',
    date: null,
    image: FALLBACK_IMAGE,
    url: 'https://cfph.onstove.com/News/List',
    fallback: true,
    warning: errors.join(' | ').slice(0, 500)
  });
}
