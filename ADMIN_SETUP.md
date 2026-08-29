# QORVO Control Panel Setup

The public website has no visible Admin button. Click the QORVO brand/logo in the footer **3 times quickly** to open `/qorvo-control`.

## Required Vercel Environment Variables

Add these in Vercel → Project → Settings → Environment Variables, then redeploy once:

- `QORVO_ADMIN_PASSWORD` = the private password you want to use
- `GITHUB_CONTENT_TOKEN` = a GitHub fine-grained personal access token with **Contents: Read and write** permission for only this repository
- `GITHUB_REPO_OWNER` = your GitHub username or organization name
- `GITHUB_REPO_NAME` = your repository name
- `GITHUB_REPO_BRANCH` = `main` (or your production branch)

## GitHub token recommendation

Create a fine-grained Personal Access Token and give it access only to the QORVO website repository. Under Repository permissions, set **Contents → Read and write**. Do not put this token in GitHub files or frontend JavaScript.

## Using the control panel

1. Open the public website.
2. Scroll to the footer.
3. Click the QORVO logo/brand 3 times quickly.
4. Enter your admin password.
5. Paste the Facebook post permalink you want to feature.
6. Optionally edit the card label and title.
7. Click **Save Featured Post**.

The API writes `data/featured-post.json` to GitHub. The homepage API also reads the newest value directly from GitHub, so the featured card can update before the next Vercel deployment finishes.

## Security note

The 3-click shortcut is only a convenience feature; it is not the security layer. The admin password is checked on the server and the GitHub token remains in Vercel environment variables.

## Events & Live Schedule Manager
The same control panel now manages the public **Events & Live Nights** section.

- Add a title, category, badge, date, optional time/note, and optional link.
- Use **Always open** for ongoing items such as clip submissions.
- Click **Add Event**, then **Save Schedule** to publish.
- Dated events automatically disappear from the public website after the event date.
- The data is stored in `data/events.json` through the same GitHub token already used by Featured Post Manager.

## TikTok LIVE members (self-hosted)

The control panel includes **TIKTOK LIVE MEMBERS**. Add a member display name and TikTok username, then save. The public Events & Live Nights section asks your self-hosted checker whether configured members are live.

Add these Vercel Production environment variables:

- `TIKTOK_CHECKER_URL`
- `TIKTOK_CHECKER_SECRET`

See `TIKTOK_LIVE_SETUP.md` and `SELF_HOSTED_CHECKER_UPDATE.md`.
