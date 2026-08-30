# QORVO CFPH — WEB v5.16

This release adds the live Latest From QORVO Facebook post through the self-hosted Facebook checker and a server-side Vercel bridge, while keeping the private checker secret out of browser code.

Required Vercel variables:
- `FACEBOOK_CHECKER_URL=https://facebook.koufuprinting.com`
- `FACEBOOK_CHECKER_SECRET=<your private checker secret>`

Existing admin, TikTok LIVE, events, giveaways, featured post, and CFPH/STOVE news features remain unchanged.


WEB v5.16 adds a live QORVO Facebook Reels selector to the hero using the secured self-hosted checker via `/api/facebook-reels`.

WEB v5.16 adds in-site Facebook Reel playback. Reel cards now open a QORVO-styled vertical video modal, while `/api/facebook-reel-video` securely proxies the self-hosted Reel media endpoint so the private checker secret remains server-side. The player supports native sound, seeking, fullscreen, mobile playback, loading/error states, and a View on Facebook fallback.
