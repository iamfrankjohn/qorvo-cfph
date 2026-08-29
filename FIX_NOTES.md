# QORVO CFPH v4 — Stable Server Intel News

## What changed

- Removed live STOVE scraping from Server Intel because STOVE returns HTTP 567 Restricted Access to automated/server requests.
- Added `data/news.json` as the single source for the Server Intel card.
- The homepage now loads `/data/news.json` directly.
- `/api/crossfire-update` is retained for compatibility and simply returns the same local JSON.
- No external scraper, API key, environment variable, or proxy is required.
- Existing image fallback remains in place.

## Update only one file

For future CrossFire PH news, edit:

`data/news.json`

See `LATEST_NEWS_SETUP.md` for instructions.
