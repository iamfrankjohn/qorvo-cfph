# QORVO Scoreboard WebSocket Relay — WEB v7.73

This replaces PeerJS/WebRTC for the scoreboard only.

## 1. Server files

Copy these two files to the QORVO server, for example `/opt/qorvo-scoreboard`:

- `QORVO_SCOREBOARD_RELAY.js`
- `scoreboard-relay-package.json`

Then:

```bash
sudo mkdir -p /opt/qorvo-scoreboard
cd /opt/qorvo-scoreboard
sudo cp /path/to/QORVO_SCOREBOARD_RELAY.js .
sudo cp /path/to/scoreboard-relay-package.json package.json
sudo npm install --omit=dev
```

Test:

```bash
node QORVO_SCOREBOARD_RELAY.js
```

It should print:

`QORVO scoreboard relay listening on http://127.0.0.1:3010`

In another shell:

```bash
curl http://127.0.0.1:3010/health
```

Expected:

`{"ok":true,"service":"qorvo-scoreboard-relay"}`

## 2. systemd

Create `/etc/systemd/system/qorvo-scoreboard.service`:

```ini
[Unit]
Description=QORVO Scoreboard WebSocket Relay
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/qorvo-scoreboard
ExecStart=/usr/bin/node /opt/qorvo-scoreboard/QORVO_SCOREBOARD_RELAY.js
Restart=always
RestartSec=2
Environment=SCOREBOARD_HOST=127.0.0.1
Environment=SCOREBOARD_PORT=3010

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorvo-scoreboard
sudo systemctl status qorvo-scoreboard --no-pager
```

## 3. Nginx HTTPS/WSS

Use your existing HTTPS QORVO subdomain. Add this location INSIDE its existing `server { listen 443 ssl; ... }` block:

```nginx
location /scoreboard-ws {
    proxy_pass http://127.0.0.1:3010/scoreboard-ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 75s;
    proxy_send_timeout 75s;
}
```

Optional health route:

```nginx
location = /scoreboard-health {
    proxy_pass http://127.0.0.1:3010/health;
    proxy_set_header Host $host;
}
```

Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Website relay URL

In BOTH `scoreboard.html` and `scoreboard-control.html`, find:

`const SCOREBOARD_WS_URL='wss://scoreboard.koufuprinting.com/scoreboard-ws';`

Replace `YOUR-QORVO-SUBDOMAIN` with the HTTPS hostname already pointing to this server.

Example only:

`const SCOREBOARD_WS_URL='wss://example.yourdomain.com/scoreboard-ws';`

Do not use `ws://` from the HTTPS Vercel website; browsers require secure `wss://`.

## 5. Test

Open `scoreboard-control.html`.
It should show `ONLINE • TOKEN`.

Open `scoreboard.html?token=SAME_TOKEN`.
The controller should show `1 scoreboard viewer(s)`.

No TURN, STUN, WebRTC, or PeerJS is used by the scoreboard in v7.73.
