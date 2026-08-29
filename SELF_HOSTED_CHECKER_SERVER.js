import express from "express";
import { TikTokLiveConnection } from "tiktok-live-connector";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.QORVO_API_KEY || "";
const CACHE_TIME = 2 * 60 * 1000;

app.use(express.json({ limit: "64kb" }));

const caches = new Map();
const inFlight = new Map();

function cleanMembers(input) {
  const seen = new Set();
  return (Array.isArray(input) ? input : [])
    .map(member => ({
      name: String(member?.name || member?.username || "").trim().slice(0, 80),
      username: String(member?.username || "").replace(/^@+/, "").trim().replace(/[^A-Za-z0-9._-]/g, "").slice(0, 50),
      enabled: member?.enabled !== false
    }))
    .filter(member => member.enabled && member.username)
    .filter(member => {
      const key = member.username.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function memberSetKey(members) {
  return members.map(member => member.username.toLowerCase()).sort().join("|");
}

function authorize(req, res, next) {
  if (!API_KEY) return res.status(500).json({ ok: false, error: "QORVO_API_KEY is not configured" });
  if (req.headers["x-qorvo-key"] !== API_KEY) return res.status(401).json({ ok: false, error: "Unauthorized" });
  next();
}

async function checkMember(member) {
  console.log(`Checking @${member.username}...`);
  try {
    const connection = new TikTokLiveConnection(member.username, { processInitialData: false });
    const isLive = await connection.fetchIsLive();
    console.log(`@${member.username} LIVE: ${Boolean(isLive)}`);
    return {
      name: member.name || member.username,
      username: member.username,
      live: Boolean(isLive),
      url: `https://www.tiktok.com/@${member.username}/live`,
      checkedAt: new Date().toISOString(),
      status: "ok"
    };
  } catch (error) {
    console.error(`Failed checking @${member.username}:`, error?.message || error);
    return {
      name: member.name || member.username,
      username: member.username,
      live: false,
      status: "unknown",
      error: true,
      checkedAt: new Date().toISOString()
    };
  }
}

async function performCheck(members, key) {
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      console.log("");
      console.log("========================================");
      console.log(" Fresh TikTok LIVE check");
      console.log(` ${new Date().toISOString()}`);
      console.log(` Members: ${members.length}`);
      console.log("========================================");

      const results = [];
      for (const member of members) {
        results.push(await checkMember(member));
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const entry = {
        checkedAt: new Date().toISOString(),
        timestamp: Date.now(),
        members: results
      };
      caches.set(key, entry);
      console.log(`LIVE members: ${results.filter(member => member.live).length}`);
      console.log("Cache updated.\n");
      return entry;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

async function getLivePayload(members) {
  const key = memberSetKey(members);
  let entry = caches.get(key);
  let source = "cache";

  if (!entry || Date.now() - entry.timestamp >= CACHE_TIME) {
    console.log("Cache expired - checking TikTok.");
    entry = await performCheck(members, key);
    source = "tiktok";
  } else {
    console.log(`Using cache (${Math.round((Date.now() - entry.timestamp) / 1000)} seconds old)`);
  }

  const liveMembers = entry.members.filter(member => member.live);
  return {
    ok: true,
    source,
    checkedAt: entry.checkedAt,
    cacheAgeSeconds: Math.round((Date.now() - entry.timestamp) / 1000),
    liveCount: liveMembers.length,
    live: liveMembers,
    members: entry.members
  };
}

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "QORVO TikTok LIVE Checker", mode: "visitor-triggered", cacheMinutes: 2 });
});

// Website/Vercel route. The member list is supplied by QORVO Control/GitHub.
app.post("/api/live", authorize, async (req, res) => {
  try {
    const members = cleanMembers(req.body?.members);
    if (!members.length) return res.json({ ok: true, source: "no-members", checkedAt: null, cacheAgeSeconds: 0, liveCount: 0, live: [], members: [] });
    return res.json(await getLivePayload(members));
  } catch (error) {
    console.error("LIVE API error:", error?.message || error);
    return res.status(500).json({ ok: false, error: "Unable to check TikTok LIVE status" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("========================================");
  console.log(" QORVO TikTok LIVE Checker");
  console.log("========================================");
  console.log(` Port: ${PORT}`);
  console.log(" Mode: Visitor-triggered");
  console.log(" Cache: 2 minutes");
  console.log(" Waiting for website requests...");
  console.log("========================================\n");
});
