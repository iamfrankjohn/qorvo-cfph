# Updating the 3 CFPH posts

Edit only `data/news.json`.

Each post uses:

```json
{
  "id": 4724,
  "section": "Event",
  "category": "Event",
  "title": "Post title",
  "summary": "Short preview",
  "date": "2026-08-27",
  "image": "/assets/qorvo-logo.jpg"
}
```

The site builds the direct URL automatically:

- `section: "Event"`, `id: 4724` -> `https://cfph.onstove.com/Event/Detail/4724?category=0&searchText=`
- `section: "News"`, `id: 4723` -> `https://cfph.onstove.com/News/Detail/4723?category=0&searchText=`

Keep the newest post first in the array. The homepage shows the first three items.

`View all official CFPH news` opens `https://cfph.onstove.com/News/`.

After editing, commit and push to the GitHub branch connected to Vercel.
