# QORVO TURN Server Setup — WEB v7.43

Use a small Debian/Ubuntu VM/CT with a public IPv4 address or a router port-forward to it.

## 1. DNS
Create a DNS record such as `turn.example.com` pointing to the public IP of the TURN server.

## 2. Install
```bash
sudo apt update
sudo apt install -y coturn
```

## 3. Certificate
Use a valid TLS certificate for the TURN hostname. If you use Certbot, point Coturn `cert=` and `pkey=` at the resulting fullchain/key files.

## 4. `/etc/turnserver.conf`
Replace the placeholders before using:
```ini
listening-port=3478
tls-listening-port=5349
fingerprint
use-auth-secret
static-auth-secret=GENERATE_A_LONG_RANDOM_SECRET
realm=turn.example.com
server-name=turn.example.com

# If this server is behind NAT, set:
# external-ip=PUBLIC_IP/PRIVATE_IP

min-port=49160
max-port=49200

cert=/etc/letsencrypt/live/turn.example.com/fullchain.pem
pkey=/etc/letsencrypt/live/turn.example.com/privkey.pem

no-multicast-peers
no-loopback-peers
stale-nonce=600
```

Generate a secret:
```bash
openssl rand -hex 32
```

Do not put this secret in HTML or commit it to Git.

## 5. Firewall / Router
Allow/forward:
- UDP 3478
- TCP 3478
- TCP 5349
- UDP 49160-49200

If the TURN server itself has a public IP, allow those ports in its firewall/security group.
If it is behind a router, forward those ports to the TURN server's private IP.

## 6. Enable and restart
```bash
sudo systemctl enable coturn
sudo systemctl restart coturn
sudo systemctl status coturn
```

## 7. Vercel environment variables
Add these in the Vercel project settings:
- `TURN_HOST` = your TURN DNS hostname, e.g. `turn.example.com`
- `TURN_AUTH_SECRET` = exactly the same secret as `static-auth-secret`
- `TURN_CREDENTIAL_TTL` = `3600` (optional)

Redeploy Vercel after adding them.

The website calls `/api/admin-auth?mode=turn`. It creates temporary HMAC credentials on the server, so the permanent TURN secret never appears in the browser source code.

## 8. Test
Start the host stream, then open the private viewer link from a phone on mobile data or a PC on a different Internet connection.
