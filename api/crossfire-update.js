const OFFICIAL_NEWS_URL = 'https://cfph.onstove.com/News';
const FALLBACK_IMAGE = '/assets/qorvo-logo.jpg';

function json(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  res.end(JSON.stringify(body));
}

function stripHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function absolute(base, value) {
  if (!value) return null;
  try { return new URL(value, base).toString(); }
  catch { return null; }
}

function findMeta(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function extractCandidates(html, baseUrl) {
  const candidates = [];

  // Try JSON-LD first
  const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of jsonLdMatches) {
    try {
      const parsed = JSON.parse(match[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const title = item.headline || item.name;
        const url = item.url || item.mainEntityOfPage?.['@id'];
        if (title && url) {
          candidates.push({
            title: stripHtml(String(title)),
            url: absolute(baseUrl, String(url)),
            date: item.datePublished || item.dateModified || null,
            image: Array.isArray(item.image) ? item.image[0] : (typeof item.image === 'string' ? item.image : item.image?.url),
            summary: stripHtml(item.description || '')
          });
        }
      }
    } catch {}
  }

  // Generic anchors from official news listing
  const anchorRe = /<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(anchorRe)) {
    const href = m[2];
    const text = stripHtml(m[4]);
    if (!text || text.length < 8) continue;

    const lowerHref = href.toLowerCase();
    const lowerText = text.toLowerCase();
    const looksLikeNews =
      lowerHref.includes('news') ||
      lowerHref.includes('notice') ||
      lowerHref.includes('update') ||
      /\b(update|notice|maintenance|event|news|patch|migration)\b/.test(lowerText);

    if (!looksLikeNews) continue;

    const url = absolute(baseUrl, href);
    if (!url) continue;

    candidates.push({
      title: text.slice(0, 160),
      url,
      date: null,
      image: null,
      summary: ''
    });
  }

  // Deduplicate
  const seen = new Set();
  return candidates.filter(item => {
    const key = `${item.url}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function enrich(candidate) {
  try {
    const response = await fetch(candidate.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QORVO-CFPH/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    if (!response.ok) return candidate;

    const html = await response.text();
    const title = findMeta(html, 'og:title') || candidate.title;
    const description = findMeta(html, 'og:description') || findMeta(html, 'description') || candidate.summary;
    const image = findMeta(html, 'og:image') || candidate.image;

    const time =
      html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1] ||
      html.match(/(?:datePublished|publishDate|publishedAt)["']?\s*[:=]\s*["']([^"']+)["']/i)?.[1] ||
      candidate.date;

    return {
      ...candidate,
      title: stripHtml(title),
      summary: stripHtml(description),
      image: absolute(candidate.url, image),
      date: time || null
    };
  } catch {
    return candidate;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  // Normalize an old Vercel environment variable too, so existing deployments
  // do not keep using the retired cfph-mig hostname.
  const configuredUrl = process.env.CROSSFIRE_NEWS_URL || OFFICIAL_NEWS_URL;
  const sourceUrl = configuredUrl.replace('cfph-mig.onstove.com', 'cfph.onstove.com');

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QORVO-CFPH/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`Official CrossFire news returned ${response.status}`);
    }

    const html = await response.text();
    const candidates = extractCandidates(html, sourceUrl);

    if (!candidates.length) {
      throw new Error('No news entries were detected on the official CrossFire page.');
    }

    const latest = await enrich(candidates[0]);

    return json(res, 200, {
      ok: true,
      source: 'CrossFire Philippines official news',
      title: latest.title || 'Latest CrossFire Philippines update',
      summary: latest.summary || 'Read the latest official CrossFire Philippines update.',
      date: latest.date,
      image: latest.image,
      url: latest.url || sourceUrl
    });
  } catch (error) {
    // Graceful fallback: the site still shows a useful official link.
    return json(res, 200, {
      ok: true,
      source: 'CrossFire Philippines official news',
      title: 'Latest CrossFire Philippines updates',
      summary: 'Open the official CrossFire Philippines news page for the newest game updates, notices, maintenance information and events.',
      date: null,
      image: FALLBACK_IMAGE,
      url: sourceUrl,
      fallback: true,
      warning: error.message
    });
  }
}
