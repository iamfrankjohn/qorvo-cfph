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
