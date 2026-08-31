## WEB v6.11 — Desktop Join Section Readability

- Keeps the left-panel paragraph inside the safe area of the diagonal green shape so text is no longer clipped on desktop.
- Makes HOW TO JOIN descriptions brighter and slightly larger on desktop.
- Makes the application notice at the bottom brighter, larger, and easier to read.
- Mobile readability fixes from WEB v6.10 are retained.

## WEB v6.11 — Mobile Join Section Readability

- The green JOIN panel and dark HOW TO JOIN panel are fully separated on mobile/tablet.
- The diagonal green shape can no longer wash over the application steps.
- Step descriptions and the footer notice use higher-contrast text.
- Mobile step copy is slightly larger for easier reading.

## WEB v6.11 — Force STOVE visual in Server Intel

- The Server Intel hero visual now always uses the STOVE branded artwork.
- Article/post images are no longer allowed to replace the STOVE visual.
- This fixes the QORVO artwork appearing again when an official news item contains a QORVO image.

## WEB v6.11 — STOVE Server Intel Branding

- Replaced the QORVO fallback artwork in Server Intel with a dedicated STOVE-branded visual.
- Server Intel continues to use official CFPH/STOVE news data and article images when available.
- QORVO branding elsewhere on the website is unchanged.

## WEB v6.11 — Auto-refresh Latest Facebook Post

- The Latest From QORVO CFPH card now checks for updates every 60 seconds while the tab is visible.
- If the first Facebook request is still processing, the card retries automatically instead of requiring a full page refresh.
- Returning to the browser tab triggers an immediate refresh.
- After a post loads successfully, temporary checker failures keep the existing post visible instead of replacing it with the fallback.
- The server-side Facebook post cache remains unchanged; this is only a lightweight website refresh.

## WEB v6.11 — Latest Facebook Caption Formatting

- Preserves real line breaks from the Facebook caption in the Latest From QORVO card.
- Handles escaped newline characters returned by the checker.
- Restores the QORVO stacked slogan layout when Facebook flattens the public caption.
- Separates the hashtag block for cleaner readability.
- Removes trailing Facebook “Send message” UI text when it is accidentally included in the scraped caption.

## WEB v6.5 — Auto-Unlock Admin PIN

- Removed the manual UNLOCK button from the QORVO Control PIN screen.
- The admin PIN now submits automatically as soon as all 6 digits are entered.
- Pasting a valid 6-digit PIN also triggers automatic authentication.
- Incorrect PINs clear the boxes, shake the PIN row, and return focus to the first digit.
- Existing server-side PIN validation and failed-attempt cooldown remain unchanged.

## WEB v6.5 — Admin PIN Lock Screen
- 6-digit server-side admin PIN using `QORVO_ADMIN_PIN`.
- 5 failed authentication attempts trigger a 30-second cooldown.
- Updated all admin write requests to send `pin` instead of `password`.

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


## WEB v6.1
- Major version bump.
- Changed footer credit to `QORVO CFPH Community Website • Developed by FRNK.sys`.
- Added the FRNK.sys developer logo to the footer as secondary branding.
- Preserved the WEB v5.16 in-site Facebook Reel player and existing integrations.


## WEB v6.5
- Removed the redundant DEVELOPED BY label beside the FRNK.sys footer logo.
- Updated visible website version to WEB v6.5.


## WEB v6.5
- Removed the separate QORVO / CFPH text from the footer branding group.
- Positioned WEB v6.5 directly below the QORVO logo.
- Kept the FRNK.sys logo beside QORVO with the existing divider.
