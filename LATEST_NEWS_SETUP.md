# Latest CrossFire Philippines News Card

The **Server Intel** card now calls `/api/crossfire-update` and tries to read the official CrossFire Philippines STOVE news listing automatically.

When successful it displays:
- featured image
- newest article title
- publish date (when provided by STOVE)
- a short official description/article excerpt
- direct **Read full update →** link

## Vercel
No extra package is required. Deploy the project normally.

Optional environment variable:

```text
CROSSFIRE_NEWS_URL=https://cfph.onstove.com/News/List
```

You can omit it because this is already the built-in default.

## Important fallback behavior
STOVE sometimes rejects automated/server-side requests at its CDN edge. When that happens, the card intentionally shows a local fallback image and links to the official News page. It will try again on later requests. This prevents a blank card or broken homepage.
