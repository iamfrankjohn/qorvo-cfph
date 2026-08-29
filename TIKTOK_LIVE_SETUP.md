# TikTok LIVE setup — self-hosted checker

The QORVO website no longer uses Tik.Tools. TikTok LIVE status is read from your own checker server.

## Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add:

- `TIKTOK_CHECKER_URL` = the public HTTPS base URL of your checker, for example `https://live.example.com`
- `TIKTOK_CHECKER_SECRET` = the exact same private key stored as `QORVO_API_KEY` on the checker server

Keep your existing QORVO/GitHub variables:

- `QORVO_ADMIN_PASSWORD`
- `GITHUB_CONTENT_TOKEN`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_REPO_BRANCH`

Remove the old Tik.Tools variables if present:

- `TIKTOOLS_API_KEY`
- `TIKTOOLS_LIVE_ENABLED`

Redeploy after changing environment variables.

## How it works

1. A visitor opens the QORVO website.
2. The browser calls `/api/tiktok-live` on Vercel.
3. Vercel reads the enabled TikTok member list managed in QORVO Control.
4. Vercel securely sends that member list to your self-hosted checker.
5. If the checker's cached result for that exact member list is less than 2 minutes old, it returns the cache and does not contact TikTok.
6. If the cache is missing or expired, the checker checks TikTok once, stores the result, and returns it.
7. LIVE members appear automatically above Events & Live Nights.

The browser never receives `TIKTOK_CHECKER_SECRET`.

## Important network requirement

Vercel cannot access a private LAN address such as `http://192.168.1.193:3000`. The checker must have a public HTTPS URL reachable from Vercel. Do not expose port 3000 directly without HTTPS/authentication. A secure tunnel or HTTPS reverse proxy is recommended.

## Member management

Continue using QORVO Control → TikTok LIVE Members. The Vercel API sends the currently enabled member list to the checker on each request, so you do not need to manually keep `members.json` on the checker server synchronized.
