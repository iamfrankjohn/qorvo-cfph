# QORVO CFPH Fix Notes

## Server Intel latest-news fix

- Uses the current official CrossFire PH URL: `https://cfph.onstove.com/News/List`.
- First tries to read STOVE directly.
- If STOVE rejects Vercel/server requests, automatically retries through Jina Reader's browser-rendered proxy.
- Detects the newest official CrossFire PH news link.
- Attempts to show the real article title, date, featured image, short preview, and direct article link.
- Keeps a local QORVO fallback image and official-news button if the external feed is temporarily unavailable.
- Edge cache remains 15 minutes to avoid unnecessary external requests.

## Existing visual fixes retained

- Community Update uses `assets/qorvo-cover.jpg`.
- Server Intel has `assets/qorvo-logo.jpg` as a safe fallback.
- Old `cfph-mig.onstove.com` links are normalized to `cfph.onstove.com`.


## v3 Reader parser fix
- Accepts any official `*.onstove.com/News/...` article URL, not only `cfph.onstove.com`.
- Can parse latest CFPH title/date/image from Reader text even when article links are stripped.
- Uses the official News list as the destination when an exact article URL is unavailable.
- Adds a diagnostic excerpt to `warning` only when all parsing methods fail.
