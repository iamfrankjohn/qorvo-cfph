## WEB v6.20 — Command Text + Desktop Grid + Mobile Arrows

- Keeps `Leading with strategy, unity, and relentless dominance.` on one line on desktop/tablet.
- Allows that sentence to wrap again on mobile so it never overflows the image.
- Desktop (1100px+) now shows all 9 Command member cards at once in a single responsive grid.
- Desktop pagination dots and carousel arrows are removed because all members are visible.
- Medium screens retain the horizontal slider with more cards visible per view.
- Mobile keeps swipe/touch scrolling and pagination dots, but hides the previous/next arrow buttons.

## WEB v6.20 — Command Copy Overlay

- Removed the separate left-side text column.
- Moved `QORVO CFPH // COMMAND` and the supporting copy inside the team image.
- Anchored the text to the bottom-left of the photo with responsive padding.
- Added a subtle dark gradient behind the overlay for readability without covering the players.
- The team image now spans the full Command hero width.
- Mobile reduces overlay size/padding to prevent clipping.

## WEB v6.20 — Restore QORVO Command Label

- Restored `QORVO CFPH // COMMAND` above the Command description.
- The large `CLAN MASTER & OFFICERS` heading remains removed.
- Kept the existing group-photo spacing and one-line member carousel.

## WEB v6.20 — Minimal QORVO Command Copy

- Removed the `QORVO CFPH // COMMAND` label from the Command hero.
- Removed the large `CLAN MASTER & OFFICERS` heading.
- Kept only:
  `Meet the core of QORVO CFPH.`
  `Leading with strategy, unity, and`
  `relentless dominance.`
- Desktop keeps the paragraph in the left panel.
- Mobile places the paragraph cleanly below the group image.

## WEB v6.20 — QORVO Command Hero Spacing

- Moved the Command title/copy into its own left-side panel on desktop.
- Group photo now uses the full right-side area instead of being covered by text.
- Increased hero height for more breathing room.
- Uses `object-fit: contain` so the full group image is preserved and edge members are not cropped.
- Mobile keeps the compact stacked/overlay treatment with the image preserved.

## WEB v6.20 — QORVO Command Layout Match

- Fixed the Command showcase so the title/copy overlays the LEFT side of the group image instead of appearing underneath it.
- Group photo and text now occupy the same hero row, matching the approved concept.
- Kept all individual portraits in one horizontal carousel line.
- Wide desktop screens show up to all nine portrait cards in one row when space allows.
- Mobile keeps the same hero-overlay concept and horizontal swipe behavior.

## WEB v6.20 — QORVO Command Showcase Carousel

- Reworked QORVO Command to match the approved showcase concept.
- Group photo now acts as the large Command hero with left-side Clan Master & Officers copy.
- All individual portraits are placed in one horizontal line.
- Desktop and mobile can slide through the roster using arrows, swipe/trackpad, mouse wheel/drag scrolling, or keyboard arrows.
- Added active carousel progress indicators.
- Existing full-screen portrait lightbox remains available when a portrait is clicked.

## WEB v6.20 — Uniform QORVO Command Cards

- Clan Master portrait no longer spans two rows on desktop.
- All Clan Master and Officer portraits use the same card size and 2:3 portrait ratio.
- Desktop uses a clean 3-column roster; tablet uses 2 columns.
- Clan Master remains subtly highlighted with a stronger green border.
- Mobile keeps the existing swipeable portrait carousel.

## WEB v6.20 — QORVO Command Gallery

- Added the QORVO Clan Master & Officers group photo after WHO WE ARE.
- Added the Clan Master and eight Officer portraits.
- Added full-screen lightbox navigation.
- Added swipeable mobile roster.
- Optimized uploaded artwork to WebP.

## WEB v6.20 — Desktop Join Section Readability

- Keeps the left-panel paragraph inside the safe area of the diagonal green shape so text is no longer clipped on desktop.
- Makes HOW TO JOIN descriptions brighter and slightly larger on desktop.
- Makes the application notice at the bottom brighter, larger, and easier to read.
- Mobile readability fixes from WEB v6.10 are retained.

## WEB v6.20 — Mobile Join Section Readability

- The green JOIN panel and dark HOW TO JOIN panel are fully separated on mobile/tablet.
- The diagonal green shape can no longer wash over the application steps.
- Step descriptions and the footer notice use higher-contrast text.
- Mobile step copy is slightly larger for easier reading.

## WEB v6.20 — Force STOVE visual in Server Intel

- The Server Intel hero visual now always uses the STOVE branded artwork.
- Article/post images are no longer allowed to replace the STOVE visual.
- This fixes the QORVO artwork appearing again when an official news item contains a QORVO image.

## WEB v6.20 — STOVE Server Intel Branding

- Replaced the QORVO fallback artwork in Server Intel with a dedicated STOVE-branded visual.
- Server Intel continues to use official CFPH/STOVE news data and article images when available.
- QORVO branding elsewhere on the website is unchanged.

## WEB v6.20 — Auto-refresh Latest Facebook Post

- The Latest From QORVO CFPH card now checks for updates every 60 seconds while the tab is visible.
- If the first Facebook request is still processing, the card retries automatically instead of requiring a full page refresh.
- Returning to the browser tab triggers an immediate refresh.
- After a post loads successfully, temporary checker failures keep the existing post visible instead of replacing it with the fallback.
- The server-side Facebook post cache remains unchanged; this is only a lightweight website refresh.

## WEB v6.20 — Latest Facebook Caption Formatting

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
