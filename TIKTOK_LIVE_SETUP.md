# TikTok LIVE setup (v16)

## Important plan note
Tik.Tools' Sandbox tier is intended for testing/evaluation and its Terms do not permit using Sandbox to power a public production website. For the live QORVO site, leave monitoring disabled while you are on Sandbox. Upgrade to a production-permitted Tik.Tools plan before enabling it publicly.

## Environment variables in Vercel

Add these in Project Settings > Environment Variables:

- `TIKTOOLS_API_KEY` = your private Tik.Tools key
- `TIKTOOLS_LIVE_ENABLED` = `false` while testing / Sandbox

When you have a production-permitted Tik.Tools plan, change:

- `TIKTOOLS_LIVE_ENABLED` = `true`

Then redeploy.

## How v16 reduces API usage

- Browser refresh interval changed from 90 seconds to 5 minutes.
- `/api/tiktok-live` sends Vercel CDN caching headers for 5 minutes.
- The function also keeps a 5-minute in-memory cache when the same serverless instance is reused.
- This means multiple site visitors generally share a cached live-status response instead of every visitor triggering fresh Tik.Tools calls.
- Up to 8 enabled TikTok members can be monitored from the QORVO Control Panel.

## Add members

1. On the public site, click the footer QORVO logo 3 times quickly.
2. Log in to QORVO Control Panel.
3. Under TikTok LIVE Members, add a display name and TikTok username without `@`.
4. Save.

When monitoring is enabled and a member is live, their LIVE row is shown above the manually managed Events & Live Nights schedule.
