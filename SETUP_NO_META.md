# QORVO CFPH — No Meta Developer Setup

This version is designed to work without a Meta Developer App, Facebook Page ID, or Facebook access token.

## What works now

### COMMUNITY UPDATE
This is a permanent QORVO CFPH community card. You can edit its text directly in `index.html` anytime.

### LATEST FROM QORVO
This uses the official Facebook Page Plugin to show the QORVO CFPH Facebook timeline.

No `FB_PAGE_ID` and no `FB_PAGE_ACCESS_TOKEN` are required.

Because the Page Plugin is controlled by Facebook, its exact appearance can vary, and some browsers/privacy settings may block third-party Facebook content. The fallback button still opens the QORVO CFPH Facebook Page.

### SERVER INTEL
This remains automatic.

The Vercel serverless endpoint:

`/api/crossfire-update`

checks the official CrossFire Philippines news page and fills the Server Intel card.

## Vercel

You do not need to add Facebook Environment Variables for this version.

Just push the files to GitHub:

```bash
git add .
git commit -m "Use no-Meta automatic QORVO website"
git push
```

Vercel should redeploy automatically.

## Test Server Intel

After deployment, open:

`https://qorvo-cfph.vercel.app/api/crossfire-update`

If it is working, you should receive JSON.

## Later: Meta Graph API

Once your Meta Developer registration works, the Facebook Page Plugin can be replaced with the custom automatic Facebook card again. That future version can fetch the exact newest post and automatically select featured/community posts.
