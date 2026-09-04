## WEB v7.0 — Tournament Bracket System

- Added public `/bracket.html` in the QORVO black/neon-green style.
- Added Tournament Bracket management inside QORVO Control.
- Registration can remain open with any current team count; the public page shows the registered team count before generation.
- Supports 2–64 teams with automatic bracket sizing and BYEs.
- Generate in listed order or randomize teams.
- Generated positions persist until an admin explicitly resets the bracket.
- Admin match score entry automatically advances winners.
- Optional Battle for 3rd automatically receives semifinal losers.
- Public bracket is horizontally scrollable on mobile.
- Data is stored through GitHub as `data/tournament-bracket.json`.
- Safe deployment ZIP excludes all live `data/*.json`.

## WEB v7.0 — Clean Event Modal Carousel

- Removed the partial preview/peek of the next event image.
- Modal now shows one complete image at a time for a cleaner presentation.
- Previous/next arrows remain outside the poster and do not cover image details.
- Manual navigation remains available through arrows, dots, keyboard arrows, and mobile swipe.
- No automatic sliding.
- Custom CTA, modal delay, multi-image admin controls, and automatic image cleanup remain unchanged.

## WEB v7.0 — Event Modal Peek Carousel

- Moved previous/next arrows completely outside the poster image so they no longer cover event details.
- Multi-image modal now uses a Reels-style horizontal track.
- The next image is partially visible as a visual cue that more images are available.
- Navigation remains fully manual: arrows, dots, keyboard arrows, and mobile swipe.
- No automatic image sliding was added.
- Single-image modals remain centered and hide carousel navigation.
- Admin multi-image management, custom CTA, delay, and automatic unused-image cleanup remain unchanged.

## WEB v7.0 — Multi-Image Event Modal

- Admin can include 1–12 event images.
- Multiple images can be selected at once, reordered, or removed before publishing.
- Homepage uses manual previous/next arrows and dots, like the Reels viewer, with no automatic sliding.
- One-image modals hide navigation controls.
- Custom CTA and display delay remain supported.
- Removed/replaced images are deleted from GitHub; deleting the modal deletes all its photos.
- Existing single-image modal data remains compatible.

## WEB v7.0 — Custom Event Modal Button

- Added optional Button Text and Button Link fields to the Event Announcement Modal manager.
- Admin can choose any button name, such as `Register Here`, `Join Tournament`, `View Mechanics`, or `Learn More`.
- When both fields are provided, the button appears directly below the poster inside the homepage modal.
- The button opens the configured HTTP/HTTPS link in a new tab.
- Leaving either button field blank hides the button completely.
- Existing modal image upload, replacement cleanup, deletion cleanup, and display-delay controls remain unchanged.

## WEB v7.0 — Admin-Managed Event Modal Photos

- Added an Event Announcement Modal manager inside Events & Schedule in QORVO Control.
- Admin can upload a PNG/JPG/WebP poster, set its title and display delay, and publish it to the homepage modal.
- Browser-side image optimization converts uploads to WebP before sending them, reducing repository and request size.
- Replacing a modal keeps only the new active image and removes older event-modal images.
- Removing the modal also permanently deletes its actual uploaded photo from GitHub.
- The existing Civil War modal is automatically treated as the current legacy modal until it is replaced or deleted.
- Homepage modal now loads its image/configuration dynamically from `/api/event-modal`.
- Safe deployment ZIP continues to exclude live `data/*.json` files.

## WEB v7.0 — Civil War Modal Delay

- Civil War opening poster now waits 4 seconds after the main page loads before appearing.
- It still appears on every new page load/refresh.
- All modal close behavior and existing website features remain unchanged.

## WEB v7.0 — Civil War Opening Modal

- Added the uploaded Civil War 3v3 poster as a modal on every main-page open/refresh.
- Full poster is contained without cropping.
- Close with ×, backdrop click, or Esc.
- Existing website sections and officer viewer are unchanged.

## WEB v7.0 — Reel-Style Officer Image Viewer

- Fixed the officer viewer initialization issue by placing the viewer markup before `script.js`.
- Clicking/tapping any individual officer card now opens the matching `With_IGN` image.
- Viewer now matches the existing in-site Reel player presentation: dark blurred backdrop, bordered viewer shell, top title bar, close button, contained media frame, and footer.
- The complete `With_IGN` image is shown with `object-fit: contain` so it is never cropped.
- Backdrop click and `Esc` close the viewer.
- Mobile viewer expands to the screen similarly to the Reel player.
- Main-page cards continue using the matching `No_IGN` images.

## WEB v7.0 — No_IGN Main / With_IGN Viewer

- Main-page officer cards use the matching No_IGN images.
- One click/tap opens the matching full-resolution With_IGN PNG.
- Clean image-only viewer with close button, backdrop click, and Esc close.
- Existing officer sequence and group image remain unchanged.

## WEB v7.0 — Simplify Command Image Overlay

- Removed the `QORVO CFPH // COMMAND` kicker from inside the group image only.
- Kept the separate `QORVO CFPH // COMMAND` section eyebrow above the photo.
- The image overlay now contains only:
  `Meet the core of QORVO CFPH.`
  `Leading with strategy, unity, and relentless dominance.`
- No image content, officer names/order, or other Command layout was changed.

## WEB v7.0 — Command Section Eyebrow

- Replaced `MEET OUR OFFICERS` with `QORVO CFPH // COMMAND`.
- Kept the existing eyebrow position, alignment, typography, green accent treatment, and spacing.
- No group-photo content, officer cards/order, names, roles, or Command imagery was changed.

## WEB v7.0 — Command Member Sequence

Updated the individual Command member order to:

1. IOX.Q — Clan Master
2. Reed.Q
3. T3r.Q
4. NeonQt.
5. JVRA.Q
6. Daichi.Q
7. HaeQt.
8. Grim.Q
9. Pynouc.Q

No other Command layout or photo behavior was changed.

## WEB v7.0 — Display-Only Command Photos

- Removed `VIEW FULL PHOTO ↗` from the main Command group image.
- Disabled photo viewing/lightbox interaction throughout the `MEET OUR OFFICERS` area.
- Officer photos are no longer clickable/tappable and no longer zoom, brighten, or glow on hover.
- Removed the v6.22 officer lightbox helper behavior.
- Officer cards now use `object-fit: contain` so each person's complete source image is displayed instead of being cropped to fill the card.
- The group image also stays fully contained with no hover zoom.
- Existing desktop grid and mobile swipe layout are retained.

## WEB v7.0 — Simple Officer Photo Lightbox

- Removed the magnifying-glass / plus hover icon from all officer cards.
- Officer portraits remain directly clickable/tappable.
- Desktop hover now uses only a subtle image scale, brightness lift, and soft green border glow.
- Clicking/tapping an officer opens the existing full-size modal with a dark backdrop and close button.
- Officer modal hides previous/next navigation and hides the name/role caption for a cleaner image-only view.
- Clicking outside the image or pressing `Esc` still closes the modal.
- The main Command group photo keeps its existing lightbox behavior.

## WEB v7.0 — Officers Lead-in + Hover Lightbox Cue

- Added a small `MEET OUR OFFICERS` lead-in above the Command photo without creating a new numbered section.
- Added a green magnify-plus cue and subtle dark image wash on desktop hover/focus for all nine individual member cards.
- On mobile, the magnify-plus cue remains visible as a small corner affordance while swipe scrolling remains available.
- Reuses the existing Command lightbox: clicking/tapping any portrait opens its larger source image, name/role caption, close button, outside-click/Escape close, and previous/next navigation.

## WEB v7.0 — Command Text + Desktop Grid + Mobile Arrows

- Keeps `Leading with strategy, unity, and relentless dominance.` on one line on desktop/tablet.
- Allows that sentence to wrap again on mobile so it never overflows the image.
- Desktop (1100px+) now shows all 9 Command member cards at once in a single responsive grid.
- Desktop pagination dots and carousel arrows are removed because all members are visible.
- Medium screens retain the horizontal slider with more cards visible per view.
- Mobile keeps swipe/touch scrolling and pagination dots, but hides the previous/next arrow buttons.

## WEB v7.0 — Command Copy Overlay

- Removed the separate left-side text column.
- Moved `QORVO CFPH // COMMAND` and the supporting copy inside the team image.
- Anchored the text to the bottom-left of the photo with responsive padding.
- Added a subtle dark gradient behind the overlay for readability without covering the players.
- The team image now spans the full Command hero width.
- Mobile reduces overlay size/padding to prevent clipping.

## WEB v7.0 — Restore QORVO Command Label

- Restored `QORVO CFPH // COMMAND` above the Command description.
- The large `CLAN MASTER & OFFICERS` heading remains removed.
- Kept the existing group-photo spacing and one-line member carousel.

## WEB v7.0 — Minimal QORVO Command Copy

- Removed the `QORVO CFPH // COMMAND` label from the Command hero.
- Removed the large `CLAN MASTER & OFFICERS` heading.
- Kept only:
  `Meet the core of QORVO CFPH.`
  `Leading with strategy, unity, and`
  `relentless dominance.`
- Desktop keeps the paragraph in the left panel.
- Mobile places the paragraph cleanly below the group image.

## WEB v7.0 — QORVO Command Hero Spacing

- Moved the Command title/copy into its own left-side panel on desktop.
- Group photo now uses the full right-side area instead of being covered by text.
- Increased hero height for more breathing room.
- Uses `object-fit: contain` so the full group image is preserved and edge members are not cropped.
- Mobile keeps the compact stacked/overlay treatment with the image preserved.

## WEB v7.0 — QORVO Command Layout Match

- Fixed the Command showcase so the title/copy overlays the LEFT side of the group image instead of appearing underneath it.
- Group photo and text now occupy the same hero row, matching the approved concept.
- Kept all individual portraits in one horizontal carousel line.
- Wide desktop screens show up to all nine portrait cards in one row when space allows.
- Mobile keeps the same hero-overlay concept and horizontal swipe behavior.

## WEB v7.0 — QORVO Command Showcase Carousel

- Reworked QORVO Command to match the approved showcase concept.
- Group photo now acts as the large Command hero with left-side Clan Master & Officers copy.
- All individual portraits are placed in one horizontal line.
- Desktop and mobile can slide through the roster using arrows, swipe/trackpad, mouse wheel/drag scrolling, or keyboard arrows.
- Added active carousel progress indicators.
- Existing full-screen portrait lightbox remains available when a portrait is clicked.

## WEB v7.0 — Uniform QORVO Command Cards

- Clan Master portrait no longer spans two rows on desktop.
- All Clan Master and Officer portraits use the same card size and 2:3 portrait ratio.
- Desktop uses a clean 3-column roster; tablet uses 2 columns.
- Clan Master remains subtly highlighted with a stronger green border.
- Mobile keeps the existing swipeable portrait carousel.

## WEB v7.0 — QORVO Command Gallery

- Added the QORVO Clan Master & Officers group photo after WHO WE ARE.
- Added the Clan Master and eight Officer portraits.
- Added full-screen lightbox navigation.
- Added swipeable mobile roster.
- Optimized uploaded artwork to WebP.

## WEB v7.0 — Desktop Join Section Readability

- Keeps the left-panel paragraph inside the safe area of the diagonal green shape so text is no longer clipped on desktop.
- Makes HOW TO JOIN descriptions brighter and slightly larger on desktop.
- Makes the application notice at the bottom brighter, larger, and easier to read.
- Mobile readability fixes from WEB v6.10 are retained.

## WEB v7.0 — Mobile Join Section Readability

- The green JOIN panel and dark HOW TO JOIN panel are fully separated on mobile/tablet.
- The diagonal green shape can no longer wash over the application steps.
- Step descriptions and the footer notice use higher-contrast text.
- Mobile step copy is slightly larger for easier reading.

## WEB v7.0 — Force STOVE visual in Server Intel

- The Server Intel hero visual now always uses the STOVE branded artwork.
- Article/post images are no longer allowed to replace the STOVE visual.
- This fixes the QORVO artwork appearing again when an official news item contains a QORVO image.

## WEB v7.0 — STOVE Server Intel Branding

- Replaced the QORVO fallback artwork in Server Intel with a dedicated STOVE-branded visual.
- Server Intel continues to use official CFPH/STOVE news data and article images when available.
- QORVO branding elsewhere on the website is unchanged.

## WEB v7.0 — Auto-refresh Latest Facebook Post

- The Latest From QORVO CFPH card now checks for updates every 60 seconds while the tab is visible.
- If the first Facebook request is still processing, the card retries automatically instead of requiring a full page refresh.
- Returning to the browser tab triggers an immediate refresh.
- After a post loads successfully, temporary checker failures keep the existing post visible instead of replacing it with the fallback.
- The server-side Facebook post cache remains unchanged; this is only a lightweight website refresh.

## WEB v7.0 — Latest Facebook Caption Formatting

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
