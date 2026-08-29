# Automatic CFPH Latest 3 News

This version does **not** require you to edit `data/news.json` when CFPH publishes a new post.

## How it works

1. GitHub Actions runs every 30 minutes.
2. The updater reads the newest known CFPH numeric content ID.
3. It assumes the observed sequence continues (4722, 4723, 4724, 4725, ...).
4. It searches for the next IDs under both:
   - `https://cfph.onstove.com/News/Detail/{ID}`
   - `https://cfph.onstove.com/Event/Detail/{ID}`
5. When a new indexed post is found, it updates `data/news.json` automatically.
6. GitHub Actions commits the JSON file back to your repository.
7. Because Vercel is connected to GitHub, that commit triggers a new Vercel deployment.
8. Your Server Intel card then shows the newest 3 IDs automatically.

## Important limitation

STOVE blocks GitHub/Vercel server requests with HTTP 567, so this updater uses a public search index instead of scraping STOVE directly. That means a brand-new CFPH article may take some time to appear on your website until the search engine indexes it. The updater checks every 30 minutes, but indexing itself can take longer.

## One-time GitHub setup

Normally the workflow file's `permissions: contents: write` is enough. If the workflow says it cannot push:

1. Open your GitHub repository.
2. Settings -> Actions -> General.
3. Find **Workflow permissions**.
4. Select **Read and write permissions**.
5. Save.

You can test it immediately from GitHub:

Actions -> **Update CFPH latest news** -> **Run workflow**.

No API key or Vercel environment variable is required.
