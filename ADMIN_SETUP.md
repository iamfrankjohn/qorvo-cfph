# QORVO Control — WEB v6.4 Admin PIN Setup

The QORVO Control Panel now uses a 6-digit server-side PIN.

## Vercel environment variable

Add this variable to the Vercel project:

- Name: `QORVO_ADMIN_PIN`
- Value: exactly 6 digits, for example `482731`
- Environments: Production, Preview, and Development if you use all three

Do not put the PIN in `qorvo-control.html`, `script.js`, GitHub, or any public file.

After saving the environment variable, redeploy the latest production deployment so the new value is available to the serverless API.

## Old variable

WEB v6.4 no longer uses `QORVO_ADMIN_PASSWORD` for the QORVO Control write APIs. After WEB v6.4 is deployed and the new PIN is confirmed working, the old `QORVO_ADMIN_PASSWORD` variable may be removed from Vercel if no other private service uses it.

## Lock-screen behavior

- Six separate PIN boxes
- Numeric keyboard on mobile
- Automatic next-box focus
- Backspace navigation
- Pasting a 6-digit PIN is supported
- Enter unlocks when all 6 digits are entered
- Five failed authentication attempts trigger a 30-second cooldown

Note: the cooldown is best-effort in a serverless environment because individual Vercel function instances can restart. A 6-digit PIN is also inherently weaker than a long password, so keep the control-panel URL private and choose a non-obvious PIN.
