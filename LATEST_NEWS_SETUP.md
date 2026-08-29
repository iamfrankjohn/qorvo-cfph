# Latest CrossFire PH News — Manual JSON setup

The Server Intel card no longer scrapes STOVE. STOVE currently blocks automated requests with HTTP 567, so the site now reads a local file instead:

`data/news.json`

## Updating the Server Intel card

Open `data/news.json` in GitHub and edit these fields:

- `category` — Event, Announcement, Promo, Notice, etc.
- `title` — the news headline
- `summary` — a short 1–3 sentence preview written in your own words
- `date` — use `YYYY-MM-DD`
- `image` — local image path such as `/assets/cfph-latest.jpg` or a reliable direct image URL
- `url` — direct official article URL if you have it; otherwise use `https://cfph.onstove.com/News/List`

Example:

```json
{
  "ok": true,
  "source": "CrossFire Philippines official news",
  "category": "Event",
  "title": "Your newest CFPH headline",
  "summary": "Short preview of the announcement.",
  "date": "2026-08-29",
  "image": "/assets/cfph-latest.jpg",
  "url": "https://cfph.onstove.com/News/List",
  "fallback": false
}
```

Commit the change to the GitHub branch connected to Vercel. Vercel will redeploy automatically.

## Changing the image

Place the desired image in the `assets` folder, for example:

`assets/cfph-latest.jpg`

Then set:

```json
"image": "/assets/cfph-latest.jpg"
```

If the image fails to load, the card automatically falls back to `/assets/qorvo-logo.jpg`.

## API test URL

The compatibility endpoint `/api/crossfire-update` is still included. It now returns the same local `data/news.json` data and does not contact STOVE.
