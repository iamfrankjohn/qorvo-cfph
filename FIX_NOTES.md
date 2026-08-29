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
- LIVE members automatically appear at the top of Events & Live Nights.
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
