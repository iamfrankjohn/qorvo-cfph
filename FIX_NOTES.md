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
