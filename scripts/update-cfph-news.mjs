import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const NEWS_FILE = path.join(ROOT, 'data', 'news.json');
const BING_RSS = 'https://www.bing.com/search?format=rss&q=';
const MAX_LOOKAHEAD = Number(process.env.CFPH_MAX_LOOKAHEAD || 20);
const REQUEST_DELAY_MS = Number(process.env.CFPH_REQUEST_DELAY_MS || 650);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function decodeXml(text = '') {
  return String(text)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/');
}

function stripHtml(text = '') {
  return decodeXml(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(text = '') {
  return stripHtml(text)
    .replace(/\s*[-|]\s*Crossfire(?: Philippines)?\s*$/i, '')
    .replace(/^Crossfire\s*[-|:]\s*/i, '')
    .trim();
}

function summarize(text = '', title = '') {
  let value = stripHtml(text);
  if (title) value = value.replace(title, '').trim();
  value = value
    .replace(/\bCached\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!value) return 'Open the official CrossFire Philippines post for complete details.';
  return value.length > 180 ? `${value.slice(0, 179).trimEnd()}…` : value;
}

function parsePublishedDate(...texts) {
  const text = texts.filter(Boolean).join(' ');
  let m = text.match(/\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(20\d{2})\b/);
  if (m) return `${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
  m = text.match(/\b(20\d{2})[-.](0?[1-9]|1[0-2])[-.](0?[1-9]|[12]\d|3[01])\b/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
  return null;
}

function categoryFromTitle(title, section) {
  const bracket = title.match(/^\s*\[([^\]]+)\]/);
  if (bracket) return bracket[1].trim();
  if (/promo/i.test(title)) return 'Promo';
  if (/announcement|notice/i.test(title)) return 'Announcement';
  return section === 'Event' ? 'Event' : 'News';
}

function extractItems(xml) {
  const out = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml))) {
    const block = match[1];
    const get = tag => {
      const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? decodeXml(m[1]).trim() : '';
    };
    out.push({
      title: get('title'),
      link: get('link'),
      description: get('description'),
      pubDate: get('pubDate')
    });
  }
  return out;
}

function extractCfphPost(item) {
  const combined = `${item.link} ${item.description} ${item.title}`;
  const m = combined.match(/https?:\/\/cfph\.onstove\.com\/(News|Event)\/Detail\/(\d+)(?:\?[^\s<"']*)?/i);
  if (!m) return null;
  const section = /^event$/i.test(m[1]) ? 'Event' : 'News';
  const id = Number(m[2]);
  if (!Number.isInteger(id)) return null;

  const title = cleanTitle(item.title) || `CrossFire Philippines update #${id}`;
  return {
    id,
    section,
    category: categoryFromTitle(title, section),
    title,
    summary: summarize(item.description, title),
    date: parsePublishedDate(item.description, item.title),
    image: '/assets/qorvo-logo.jpg'
  };
}

async function bingSearch(query) {
  const url = `${BING_RSS}${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QORVO-CFPH-NewsBot/1.0; +https://github.com/)'
      },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Bing RSS HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function searchCandidate(id) {
  const queries = [
    `site:cfph.onstove.com/News/Detail/${id} ${id}`,
    `site:cfph.onstove.com/Event/Detail/${id} ${id}`
  ];

  for (const query of queries) {
    try {
      const xml = await bingSearch(query);
      const found = extractItems(xml)
        .map(extractCfphPost)
        .filter(Boolean)
        .find(post => post.id === id);
      if (found) return found;
    } catch (err) {
      console.warn(`[CFPH] Search failed for ${id}:`, err.message);
    }
    await sleep(REQUEST_DELAY_MS);
  }
  return null;
}

async function discoverGeneral() {
  const queries = [
    'site:cfph.onstove.com/News/Detail/ CrossFire Philippines',
    'site:cfph.onstove.com/Event/Detail/ CrossFire Philippines'
  ];
  const posts = [];
  for (const query of queries) {
    try {
      const xml = await bingSearch(query);
      posts.push(...extractItems(xml).map(extractCfphPost).filter(Boolean));
    } catch (err) {
      console.warn('[CFPH] General search failed:', err.message);
    }
    await sleep(REQUEST_DELAY_MS);
  }
  return posts;
}

function normalizePost(post) {
  return {
    id: Number(post.id),
    section: /^event$/i.test(post.section) ? 'Event' : 'News',
    category: post.category || (/^event$/i.test(post.section) ? 'Event' : 'News'),
    title: post.title || `CrossFire Philippines update #${post.id}`,
    summary: post.summary || 'Open the official CrossFire Philippines post for complete details.',
    date: post.date || null,
    image: post.image || '/assets/qorvo-logo.jpg'
  };
}

function meaningfulPosts(posts) {
  return posts.map(normalizePost).map(({ id, section, category, title, summary, date, image }) => ({
    id, section, category, title, summary, date, image
  }));
}

async function main() {
  const current = JSON.parse(await fs.readFile(NEWS_FILE, 'utf8'));
  const currentPosts = Array.isArray(current.posts) ? current.posts.map(normalizePost) : [];
  const known = new Map(currentPosts.map(post => [post.id, post]));
  const currentMax = Math.max(0, ...currentPosts.map(post => post.id));

  // First collect whatever the search index already knows.
  for (const post of await discoverGeneral()) known.set(post.id, { ...known.get(post.id), ...post });

  // Then explicitly look ahead from the newest known numeric ID. This follows
  // CFPH's observed sequential IDs (4722, 4723, 4724, ...). Missing IDs are OK.
  // We check both /News/Detail/{id} and /Event/Detail/{id} because the section varies.
  for (let id = currentMax + 1; id <= currentMax + MAX_LOOKAHEAD; id += 1) {
    const post = await searchCandidate(id);
    if (post) {
      console.log(`[CFPH] Found new post ${id}: ${post.title}`);
      known.set(id, post);
    }
  }

  const nextPosts = [...known.values()]
    .filter(post => Number.isInteger(post.id) && post.id > 0)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map(normalizePost);

  if (!nextPosts.length) throw new Error('No CFPH posts are available. Keeping existing data/news.json.');

  const before = JSON.stringify(meaningfulPosts(currentPosts));
  const after = JSON.stringify(meaningfulPosts(nextPosts));
  if (before === after) {
    console.log('[CFPH] No changes. Latest IDs:', nextPosts.map(p => p.id).join(', '));
    return;
  }

  const next = {
    ok: true,
    source: 'CrossFire Philippines official news',
    image: '/assets/qorvo-logo.jpg',
    allNewsUrl: 'https://cfph.onstove.com/News/',
    autoUpdate: {
      enabled: true,
      method: 'GitHub Actions + search index',
      note: 'New CFPH IDs are discovered automatically after they appear in the search index.'
    },
    posts: nextPosts
  };

  await fs.writeFile(NEWS_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log('[CFPH] Updated data/news.json:', nextPosts.map(p => p.id).join(', '));
}

main().catch(err => {
  console.error('[CFPH] Updater failed:', err);
  process.exitCode = 1;
});
