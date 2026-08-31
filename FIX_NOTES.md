# WEB v5.14 — Live Latest Facebook Post

- Replaced the static “Latest From QORVO” Facebook card with the actual latest public QORVO CFPH post.
- Added `/api/facebook-latest` as a server-side Vercel bridge.
- `FACEBOOK_CHECKER_SECRET` stays server-side and is never exposed to visitors.
- Uses the self-hosted Facebook checker at `FACEBOOK_CHECKER_URL`.
- Renders the latest post image, author, relative age, caption, and direct post link in the existing QORVO design.
- Falls back to the QORVO Facebook Page and cover image if the checker is temporarily unavailable.
- Footer version updated to `WEB v5.14`.
- Safe update package excludes all `data/*.json` live/admin-managed files.

## WEB v5.15
- Replaced the large hero eagle artwork panel with a live QORVO Facebook Reels selector.
- Loads up to 5 latest Reels through `/api/facebook-reels`.
- Added secure Vercel bridge; `FACEBOOK_CHECKER_SECRET` remains server-side.
- Desktop shows center-focused Reel with adjacent previews, autoplay, arrows, and dots.
- Mobile supports swipe navigation and a vertical Reel-focused layout.
- Falls back to the QORVO Facebook Reels page if the checker is temporarily unavailable.

## WEB v5.16
- QORVO Reels now play inside the website in a responsive modal.
- Added secure `/api/facebook-reel-video` bridge with HTTP Range forwarding.
- Added Reel IDs to the sanitized `/api/facebook-reels` response.
- Added loading/error states, native controls, fullscreen support, and Facebook fallback.


## WEB v6.0
- Major version bump.
- Changed footer credit to `QORVO CFPH Community Website • Developed by FRNK.sys`.
- Added the FRNK.sys developer logo to the footer as secondary branding.
- Preserved the WEB v5.16 in-site Facebook Reel player and existing integrations.
