# Automatic CrossFire PH Latest News

The Server Intel card now uses a two-stage fetch strategy:

1. Directly request `https://cfph.onstove.com/News/List`.
2. If STOVE blocks server-side requests, use Jina Reader (`https://r.jina.ai/`) as a browser-rendered fallback.

The API then finds the newest official news entry, fetches the article when possible, and returns:

- article title
- publication date
- featured image when available
- short article preview
- direct article URL

The response is cached at the Vercel edge for 15 minutes. If both methods fail, the website keeps the QORVO fallback image and links to the official news list instead of showing a blank card.

No API key is required for basic Jina Reader usage. If you later want higher rate limits, Jina supports an optional API key, but the current code does not require one.
