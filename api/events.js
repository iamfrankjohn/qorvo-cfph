const crypto = require('crypto');
const localFallback = require('../data/events.json');

const FILE_PATH = 'data/events.json';

function githubConfig() {
  return {
    token: process.env.GITHUB_CONTENT_TOKEN,
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    branch: process.env.GITHUB_REPO_BRANCH || 'main'
  };
}
function configured(cfg) { return Boolean(cfg.token && cfg.owner && cfg.repo); }
function safeEqual(a,b){ const l=Buffer.from(String(a||'')); const r=Buffer.from(String(b||'')); return l.length===r.length && crypto.timingSafeEqual(l,r); }
function cleanText(v,max=100){ return String(v||'').trim().slice(0,max); }
function cleanUrl(v){
  const s=String(v||'').trim(); if(!s) return '';
  try { const u=new URL(s); return /^https?:$/.test(u.protocol) ? u.toString() : ''; } catch { return ''; }
}
async function githubRequest(url, options, token) {
  const response = await fetch(url,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'qorvo-cfph-admin',...(options?.headers||{})}});
  if(!response.ok){ const text=await response.text(); throw new Error(`GitHub API ${response.status}: ${text.slice(0,300)}`); }
  return response.json();
}
async function readFromGithub(cfg){
  const api=`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${FILE_PATH}?ref=${encodeURIComponent(cfg.branch)}`;
  const result=await githubRequest(api,{method:'GET'},cfg.token);
  return {data:JSON.parse(Buffer.from(result.content.replace(/\n/g,''),'base64').toString('utf8')),sha:result.sha};
}
async function writeToGithub(cfg,data,sha){
  const api=`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${FILE_PATH}`;
  return githubRequest(api,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Update QORVO events schedule',content:Buffer.from(`${JSON.stringify(data,null,2)}\n`,'utf8').toString('base64'),sha,branch:cfg.branch})},cfg.token);
}
function normalizeEvent(raw={}){
  const alwaysOpen=Boolean(raw.alwaysOpen);
  const date=cleanText(raw.date,10);
  return {
    id: cleanText(raw.id,80) || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    title: cleanText(raw.title,120),
    category: cleanText(raw.category,30) || 'COMMUNITY',
    badge: cleanText(raw.badge,20) || 'CFPH',
    date: alwaysOpen ? '' : date,
    time: cleanText(raw.time,30),
    url: cleanUrl(raw.url),
    alwaysOpen,
    enabled: raw.enabled !== false
  };
}
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const cfg=githubConfig();
  if(req.method==='GET'){
    try{ if(!configured(cfg)) return res.status(200).json({ok:true,...localFallback,source:'local'}); const current=await readFromGithub(cfg); return res.status(200).json({ok:true,...current.data,source:'github'}); }
    catch(e){ console.error(e); return res.status(200).json({ok:true,...localFallback,source:'fallback',warning:'Could not read GitHub event data.'}); }
  }
  if(req.method!=='POST'){ res.setHeader('Allow','GET, POST'); return res.status(405).json({ok:false,error:'Method not allowed'}); }
  const configuredPin=process.env.QORVO_ADMIN_PIN;
  if(!configuredPin || !/^\d{6}$/.test(configuredPin)) return res.status(500).json({ok:false,error:'QORVO_ADMIN_PIN must be configured in Vercel as exactly 6 digits.'});
  if(!safeEqual(req.body?.pin,configuredPin)) return res.status(401).json({ok:false,error:'Incorrect admin PIN.'});
  if(!configured(cfg)) return res.status(500).json({ok:false,error:'GitHub storage environment variables are not configured.'});
  const incoming=Array.isArray(req.body?.events)?req.body.events:[];
  const events=incoming.map(normalizeEvent).filter(e=>e.title).slice(0,30);
  try{ const current=await readFromGithub(cfg); const next={events,updatedAt:new Date().toISOString()}; await writeToGithub(cfg,next,current.sha); return res.status(200).json({ok:true,...next}); }
  catch(e){ console.error(e); return res.status(500).json({ok:false,error:'Could not save events to GitHub. Check the token/repository settings.'}); }
};
