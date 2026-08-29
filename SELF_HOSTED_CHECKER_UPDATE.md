# Required checker update for website v17

The website now sends the current TikTok member list from QORVO Control to your checker. This avoids maintaining a second member list on the Proxmox CT.

On the CT:

```bash
cd /opt/qorvo-tiktok
cp server.js server.js.backup
```

Replace `/opt/qorvo-tiktok/server.js` with the contents of `SELF_HOSTED_CHECKER_SERVER.js` from this package.

Then verify and restart:

```bash
node --check /opt/qorvo-tiktok/server.js
systemctl restart qorvo-tiktok
systemctl status qorvo-tiktok
```

Test health:

```bash
curl http://127.0.0.1:3000/health
```

Expected mode: `visitor-triggered` and cacheMinutes: `2`.
