# QORVO CFPH — WEB v6.15
## WEB v6.15 — Desktop Join Section Readability

- Prevents desktop Join copy from being clipped by the diagonal panel and increases contrast in How To Join.

## WEB v6.15 — Mobile Join Section Readability

- Fixes low-contrast text and green overlap in the mobile Join / How To Join section.

## WEB v6.15 — Force STOVE visual in Server Intel

- Server Intel now always displays the STOVE branded header visual.
- Official article images no longer override that section branding.

## WEB v6.15 — Auto-refresh Latest Facebook Post

- Latest Facebook card retries and refreshes automatically every 60 seconds while visible.
- No manual browser refresh is required when the checker finishes loading.

## WEB v6.15 — Facebook Caption Formatting

The Latest From QORVO card now preserves Facebook caption line breaks. If the public Facebook render flattens the caption, the frontend restores QORVO's common stacked LOCK IN. / QORVO UP. / DOMINATE. layout and separates the hashtag block. Stray “Send message” UI text from Facebook is also removed when present.


## WEB v6.5 — Auto-Unlock PIN

The QORVO Control lock screen now behaves like a device PIN screen: entering the sixth digit immediately authenticates the PIN, with no separate Unlock button. Paste and Enter remain supported as accessibility/desktop fallbacks.


## WEB v6.5 — Admin PIN Lock Screen
- Replaced the admin password field with a 6-digit PIN lock screen.
- Added numeric mobile keypad support, auto-advance, backspace navigation, paste support, and Enter-to-unlock.
- Added a 30-second cooldown after 5 incorrect PIN attempts in the auth endpoint.
- Admin write APIs now use `QORVO_ADMIN_PIN`.


This release adds the live Latest From QORVO Facebook post through the self-hosted Facebook checker and a server-side Vercel bridge, while keeping the private checker secret out of browser code.

Required Vercel variables:
- `FACEBOOK_CHECKER_URL=https://facebook.koufuprinting.com`
- `FACEBOOK_CHECKER_SECRET=<your private checker secret>`

Existing admin, TikTok LIVE, events, giveaways, featured post, and CFPH/STOVE news features remain unchanged.


WEB v5.15 adds a live QORVO Facebook Reels selector to the hero using the secured self-hosted checker via `/api/facebook-reels`.

WEB v5.16 adds in-site Facebook Reel playback. Reel cards now open a QORVO-styled vertical video modal, while `/api/facebook-reel-video` securely proxies the self-hosted Reel media endpoint so the private checker secret remains server-side. The player supports native sound, seeking, fullscreen, mobile playback, loading/error states, and a View on Facebook fallback.


## WEB v6.1

Major branding update: the footer now credits **FRNK.sys** as the website developer and displays the FRNK.sys developer logo beside the footer branding. Existing Reel player, live integrations, admin tools, and community features are preserved.


## WEB v6.5

Footer refinement: removed the redundant “DEVELOPED BY” label beside the FRNK.sys logo. The existing credit line remains “QORVO CFPH Community Website • Developed by FRNK.sys”.
