# QORVO CFPH Update Fix

Updated files:

- `index.html`
  - Changed the old CrossFire PH migration URL to `https://cfph.onstove.com/News`.
  - Community Update visual now uses the existing QORVO cover artwork.

- `styles.css`
  - Community Update now displays `assets/qorvo-cover.jpg` with a readable overlay.
  - Server Intel now has a local visual fallback so the card never appears blank.
  - Corrected dynamic image stacking so fetched images display above the card background.

- `script.js`
  - Added reliable image fallback/error handling.
  - Server Intel falls back to `assets/qorvo-logo.jpg` when the official source has no image or blocks scraping.
  - Server Intel link falls back to the current `cfph.onstove.com/News` address.

- `api/crossfire-update.js`
  - Changed the old `cfph-mig.onstove.com` address to `cfph.onstove.com`.
  - API fallback now always returns a local image.

- `.env.example`
  - Updated the default official CrossFire PH news URL.

This keeps the existing design while preventing the two outer Latest Updates cards from looking blank.
