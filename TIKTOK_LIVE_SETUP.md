# TikTok LIVE auto detection

QORVO v15 can automatically show monitored members at the top of **Events & Live Nights** whenever they are LIVE on TikTok.

## 1. Get a TikTools API key
Create a TikTools account at https://tik.tools and copy your API key. The site uses TikTools' server-side `/webcast/check_alive` endpoint.

## 2. Add the key to Vercel
Project Settings -> Environment Variables -> Production:

`TIKTOOLS_API_KEY = your private TikTools API key`

Redeploy once after adding it.

## 3. Add members
Open the QORVO Control Panel (3 quick clicks on the footer QORVO logo), log in, then use **TIKTOK LIVE MEMBERS**.

Add:
- Member display name
- TikTok username (without @)

Click **Save TikTok Members**.

## How it behaves
- The homepage checks approximately every 90 seconds.
- LIVE members appear before manually scheduled events.
- Clicking the arrow opens that member's TikTok LIVE page.
- When they are no longer live, their LIVE row disappears on a later check.
- Manual events remain managed separately in the same admin panel.

## Notes
TikTok LIVE detection uses a third-party service because TikTok's standard public Display API does not provide a simple public live-status endpoint for this use case. Availability and API limits depend on TikTools.
