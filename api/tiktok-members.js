const crypto = require('crypto');
const localFallback = require('../data/tiktok-members.json');

const FILE_PATH = 'data/tiktok-members.json';

function githubConfig() {
  return {
    token: process.env.GITHUB_CONTENT_TOKEN,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    branch: process.env.GITHUB_REPO_BRANCH || 'main'
  };
}
function configured(c){ return Boolean(c.token && c.owner && c.repo); }
function safeEqual(a,b){ const l=Buffer.from(String(a||'')); const r=Buffer.from(String(b||'')); return l.length===r.length && crypto.timingSafeEqual(l,r); }
function cleanText(v,max=80){ return String(v||'').trim().slice(0,max); }
function cleanUsername(v){ return cleanText(v,50).replace(/^@+/, '').replace(/[^A-Za-z0-9._-]/g,''); }
async function gh(url, options, token){
  const r=await fetch(url,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'qorvo-cfph-admin',...(options?.headers||{})}});
  if(!r.ok){ const t=await r.text(); throw new Error(`GitHub API ${r.status}: ${t.slice(0,240)}`); }
  return r.json();
}
async function readGithub(c){
  const url=`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${FILE_PATH}?ref=${encodeURIComponent(c.branch)}`;
  const x=await gh(url,{method:'GET'},c.token);
  return {data:JSON.parse(Buffer.from(x.content.replace(/\n/g,''),'base64').toString('utf8')),sha:x.sha};
}
async function writeGithub(c,data,sha){
  const url=`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${FILE_PATH}`;
  return gh(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Update QORVO TikTok live members',content:Buffer.from(`${JSON.stringify(data,null,2)}\n`).toString('base64'),sha,branch:c.branch})},c.token);
}
function normalize(raw={}){
  const username=cleanUsername(raw.username);
  return {
    id: cleanText(raw.id,80) || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    name: cleanText(raw.name,80) || username,
    username,
    enabled: raw.enabled !== false
  };
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const cfg=githubConfig();
  if(req.method==='GET'){
    try{
      if(!configured(cfg)) return res.status(200).json({ok:true,...localFallback,source:'local'});
      const current=await readGithub(cfg); return res.status(200).json({ok:true,...current.data,source:'github'});
    }catch(e){ console.error(e); return res.status(200).json({ok:true,...localFallback,source:'fallback',warning:'Could not read TikTok members from GitHub.'}); }
  }
  if(req.method!=='POST'){ res.setHeader('Allow','GET, POST'); return res.status(405).json({ok:false,error:'Method not allowed'}); }
  if(!safeEqual(req.body?.password,process.env.QORVO_ADMIN_PASSWORD)) return res.status(401).json({ok:false,error:'Incorrect admin password.'});
  if(!configured(cfg)) return res.status(500).json({ok:false,error:'GitHub storage environment variables are not configured.'});
  const seen=new Set();
  const members=(Array.isArray(req.body?.members)?req.body.members:[]).map(normalize).filter(m=>m.username && !seen.has(m.username.toLowerCase()) && seen.add(m.username.toLowerCase())).slice(0,12);
  try{
    const current=await readGithub(cfg);
    const next={members,updatedAt:new Date().toISOString()};
    await writeGithub(cfg,next,current.sha);
    return res.status(200).json({ok:true,...next});
  }catch(e){ console.error(e); return res.status(500).json({ok:false,error:'Could not save TikTok members to GitHub.'}); }
};
