# QORVO CFPH — 3 Latest CFPH Posts

The Server Intel card now reads the three entries inside:

`data/news.json`

## Update a post

Each post supports:

- `category` — Event, Announcement, Promo, Update, etc.
- `title` — title shown on the website
- `summary` — short preview shown under the title
- `date` — use YYYY-MM-DD
- `image` — optional image used by Server Intel visual
- `url` — official direct article URL
- `direct` — set `true` when `url` is the exact article; set `false` when it only points to the general official News page

The website displays only the first 3 objects in the `posts` array, so keep newest posts at the top.

## Known direct URL

The newest post supplied in this build uses:

`https://cfph.onstove.com/Event/Detail/4724?category=0&searchText=`

The other two posts currently open the official News list because their exact direct URLs were not supplied. When you copy those direct links from CFPH, replace their `url` values and change `direct` to `true`.

## GitHub → Vercel

Edit `data/news.json`, commit, and push to the GitHub branch connected to Vercel. Vercel will redeploy from that commit.
