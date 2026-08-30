# WEB v5.13 — Latest From QORVO Redesign

- Removed the Facebook timeline iframe from the `LATEST FROM QORVO` card.
- The iframe was correctly showing the newest Facebook post, but because the latest post contains a screenshot of the QORVO website, it looked like the website was embedded inside itself.
- Replaced it with a native QORVO-branded Facebook card that looks consistent on desktop and mobile.
- The new card links directly to the official QORVO CFPH Facebook Page.
- Removed the obsolete responsive Facebook iframe loader from `script.js`.
- Footer version updated to `WEB v5.13`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.12 — Facebook Mobile Feed Fix

- Fixed the broken-looking Facebook Page timeline area on mobile.
- Facebook's embedded timeline can create its own internal scrollbar and awkward white plugin UI on narrow screens.
- On screens 700px and below, the iframe is now replaced with a clean QORVO-branded Facebook preview card.
- Tapping the mobile preview opens the official QORVO CFPH Facebook Page.
- Desktop keeps the live Facebook Page Plugin.
- Footer version updated to `WEB v5.12`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.11 — LIVE Alert Copy

- Changed the popup status label from `QORVO LIVE ALERT` to `LIVE ALERT`.
- One member: `A QORVO MEMBER / IS LIVE NOW`.
- Multiple members: `QORVO MEMBERS / ARE LIVE NOW`.
- Existing LIVE modal design, WATCH LIVE SVG icon, and TikTok detection behavior remain unchanged.
- Footer version updated to `WEB v5.11`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.10 — WATCH LIVE Icon Fix

- Replaced the custom CSS-drawn WATCH LIVE arrow with a clean inline SVG external-link icon.
- The icon now keeps the same shape and proportions across desktop, iPhone, Android, and other browsers.
- Mobile icon sizing was tuned to match the WATCH LIVE label.
- TikTok LIVE detection and modal behavior are unchanged.
- Footer version updated to `WEB v5.10`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.9 — LIVE Modal Mobile Polish

- Made the TikTok LIVE popup smaller and more balanced on phones.
- Reduced mobile headline size, spacing, card padding, avatar size, and button height.
- Limited the popup to a compact mobile width instead of nearly filling the screen.
- Replaced the WATCH LIVE Unicode arrow with a CSS-drawn external-link arrow so iPhone/iOS and desktop use the same visual style.
- Desktop LIVE modal styling and LIVE detection behavior remain unchanged.
- Footer version updated to `WEB v5.9`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.8 — LIVE Modal Redesign

- Redesigned the visitor TikTok LIVE notification modal.
- Stronger QORVO gaming-style hierarchy with a split white/green LIVE headline.
- Added animated broadcast signal artwork using CSS only.
- Added member initial avatars and improved stream cards.
- WATCH LIVE is now a stronger primary action.
- Cleaner MAYBE LATER divider treatment.
- Improved desktop and mobile layouts while keeping the existing LIVE detection behavior.
- Footer version updated to `WEB v5.8`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.7 — About Copy Update

- Refined the `Who We Are` section copy to sound more natural and less repetitive.
- New wording reinforces the `MORE THAN A PAGE. A SQUAD.` message.
- Closing line now ends with `there’s a place for you in the squad.`
- Footer version updated to `WEB v5.7`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.6 — Help Button Idle Opacity

- Floating `Need help?` Messenger button is now 50% opacity while idle.
- It returns to 100% opacity when hovered, keyboard-focused, touched/active, or when the help panel is open.
- Footer version updated to `WEB v5.6`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.5 — CTA Cleanup

- Removed Messenger from the homepage hero.
- Hero now has one focused CTA: `Explore the Community ↓`.
- Removed the duplicate `MESSAGE QORVO` link inside Join the Squad.
- Kept `Continue on Messenger` as the application CTA in Join the Squad.
- Kept the separate floating Messenger help widget for support.
- Kept the Who We Are Facebook Page CTA.
- Footer version updated to `WEB v5.5`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.4 — Responsive Polish

- Prevented `LOCK IN.`, `QORVO UP.`, and `DOMINATE.` from splitting internally.
- Added laptop-specific hero sizing for common 901–1399px widths.
- Changed the floating Messenger help control to a compact circular icon on phones.
- Tightened phone-only vertical spacing for smoother scrolling.
- Replaced admin-facing Featured Post placeholder text with visitor-facing loading and fallback copy.
- Added a visitor-friendly Featured Post fallback when the API is unavailable.
- Footer version updated to `WEB v5.4`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.3 — Who We Are Redesign

- Rewrote Section 01 to describe QORVO itself instead of describing the website.
- Kept the strong `MORE THAN A PAGE. A SQUAD.` headline.
- Added the community manifesto: `PLAY TOGETHER. COMPETE TOGETHER. GROW TOGETHER.`
- Added a subtle `QORVO CFPH // BUILT FOR THE COMMUNITY` signature.
- Added a green accent rail to the lead copy and improved spacing/hierarchy.
- Facebook CTA remains a Page link (not Messenger) and now reads `Explore QORVO on Facebook`.
- Visible footer version updated to `WEB v5.3`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.2 — Hero Polish

- Hero primary CTA now opens QORVO Messenger directly.
- Updated the hero description.
- Added `QORVO CFPH // COMMUNITY ONLINE`.
- Hero info labels now read CrossFire Community, Events & Game Nights, and Drops / Giveaways & Rewards.
- Navigation `Community` is now `Join Us`.
- Footer version updated to `WEB v5.2`.
- Safe ZIP excludes all live `data/*.json` files.

# WEB v5.1 — Direct Messenger Application Links

- Section 05 application buttons now open the QORVO Messenger conversation directly using `m.me/qorvo.cfph`.
- Main CTA changed to `Continue on Messenger`.
- `MESSAGE QORVO` also opens Messenger directly.
- Visible footer version updated to `WEB v5.1`.
- Safe-update ZIP still excludes all `data/*.json` files.

# WEB v5.0 — Join the Squad Redesign

- Major section redesign: rebuilt Section 05 as a Facebook-only QORVO application/joining section.
- Removed TikTok completely from the section.
- Added a three-step joining process: Visit, Message, Connect.
- Applications clearly direct visitors to the official QORVO CFPH Facebook Page.
- Visible footer version updated to `WEB v5.0`.
- Safe-update ZIP still excludes all `data/*.json` files so Featured Post, TikTok Members, Events, Giveaways, and News remain preserved.

# WEB v4.1 — QORVO Rewards

- Added dynamic QORVO Rewards / Giveaways section and Giveaways manager in QORVO Control.
- Visible footer version changed to WEB v4.1.
- Safe-update ZIP excludes ALL `data/*.json`, including giveaway data, so Featured Post, TikTok Members, Events, News, and Giveaways are preserved.

# v24.0

- Changed the homepage heading from “EVENTS & LIVE NIGHTS” to “EVENTS & LIVE”.
- Added visible footer marker `WEB v24.0` beside the QORVO footer brand.
- Kept the no-events message as: “No QORVO events are currently scheduled and no monitored member is live right now.”

# v7 changes

- Added fully automatic latest-3 CFPH update workflow.
- Added `.github/workflows/update-cfph-news.yml` (runs every 30 minutes + manual run).
- Added `scripts/update-cfph-news.mjs`.
- Assumes CFPH numeric article IDs continue sequentially.
- Automatically checks both `News/Detail/{id}` and `Event/Detail/{id}`.
- Keeps `View all official CFPH news` on `https://cfph.onstove.com/News/`.
- Does not scrape STOVE directly because STOVE returns HTTP 567 to server-side fetches.


## v11
- Fixed footer QORVO admin trigger. Single/double clicks no longer jump to the top.
- Three quick clicks still open `/qorvo-control`.


## v12 — Featured post mobile fix
- Facebook featured-post plugin now uses the actual card width instead of a fixed 500px plugin width.
- Added responsive resize handling for phone rotation / viewport changes.
- Disabled the generic 16:9 card aspect-ratio rule for the Facebook featured-post card on mobile.
- Reduced very-small-phone page padding slightly so the Facebook embed has enough usable width.

## v13
- Removed the featured-post description text below the card title for a cleaner desktop and mobile layout.
- Featured card now shows only the metadata, title, and Open Featured Post action below the Facebook embed.

## v14
- Added Events & Live Schedule Manager to QORVO Control Panel.
- Replaced placeholder event rows with dynamic event data.
- Added automatic hiding of expired dated events.
- Added Always Open support for ongoing community activities.
- Uses the existing GitHub/Vercel admin credentials; no new environment variables are required.

## v15
- Added TikTok LIVE member manager to QORVO Control Panel.
- Added server-side TikTok live-status checks using TikTools.
- LIVE members automatically appear at the top of Events & Live.
- Homepage refreshes live status about every 90 seconds.
- Added `TIKTOOLS_API_KEY` environment variable and setup guide.

## v16 - TikTok LIVE quota / production safety
- Changed homepage TikTok status refresh from 90 seconds to 5 minutes.
- Added 5-minute CDN caching (`s-maxage=300`) and 5-minute server memory caching.
- Added `TIKTOOLS_LIVE_ENABLED` kill switch.
- Monitoring stays OFF unless explicitly enabled.
- Sandbox key can be kept for testing, but public production monitoring should only be enabled with a Tik.Tools plan that permits production use.

## v17 — Self-hosted TikTok LIVE checker
- Replaced Tik.Tools integration with the user's self-hosted QORVO TikTok checker.
- Added `TIKTOK_CHECKER_URL` and `TIKTOK_CHECKER_SECRET` Vercel environment variables.
- Vercel sends the enabled QORVO Control TikTok member list to the checker server-side.
- The checker keeps a 2-minute cache, so many website visitors do not cause repeated TikTok checks.
- Browser refresh interval is now 2 minutes while the page remains open.

## v18 — TikTok LIVE UI polish
- Rebuilt the LIVE event row to prevent the left-side LIVE/NOW text from crowding or clipping.
- Added a dedicated LIVE pill with pulse dot, cleaner spacing, username badge, and watch button.
- Added tablet and phone layouts so the LIVE row stays readable on narrow screens.


## v20 - Control panel login lock
- Sidebar management buttons are disabled before admin authentication.
- Sidebar buttons are automatically enabled after successful login.
- Added a JavaScript authentication guard so tool switching cannot occur before login.


## v21 — LIVE visitor modal
- Added an automatic QORVO LIVE modal when one or more monitored TikTok members are live.
- Uses the same `/api/tiktok-live` response as the Events & Live section, so it does not create a second TikTok check.
- Shows once per browser session, only when a live member is detected.
- Supports multiple simultaneous live members and mobile layout.
