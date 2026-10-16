import http from 'node:http'; import { readFile } from 'node:fs/promises'; import path from 'node:path';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const ROOT='/home/user/BetweenUs', OUT=path.dirname(new URL(import.meta.url).pathname);
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(q,r)=>{try{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));const d=await readFile(p);r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(d);}catch{r.writeHead(404);r.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const APP=`http://127.0.0.1:${server.address().port}/between-us.html`;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

const POIRET=`.limit-row--drawer .limit-btn:not([data-limit="all"]){font-family:'Poiret One',cursive;font-size:15px;letter-spacing:.22em;padding-left:.22em;}`;
const POIRET_ALL=`.limit-row--drawer .limit-btn{font-family:'Poiret One',cursive;font-size:15px;letter-spacing:.22em;text-indent:.22em;}`;
const C_CSS=`
#limitBtnsDrawer{display:none!important}
.cnt-ctl{display:flex;align-items:center;justify-content:center;gap:4px;height:46px}
.cnt-arrow{background:none;border:none;color:var(--btn-quiet);width:30px;height:46px;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.cnt-arrow svg{width:14px;height:14px}
.cnt-mid{display:flex;align-items:center;justify-content:center;gap:7px;flex:1;min-width:0}
.cnt-rule{height:1px;flex:1 1 0;min-width:6px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--gold) 30%,transparent))}
.cnt-rule:last-child{background:linear-gradient(90deg,color-mix(in srgb,var(--gold) 30%,transparent),transparent)}
.cnt-num{font-family:'Poiret One',cursive;font-size:15px;letter-spacing:.22em;margin-right:-.22em;line-height:1;color:var(--gold);white-space:nowrap;min-width:2.6em;text-align:center}`;
const C_JS=()=>{
  const steps=['5','10','20','all']; const box=document.querySelector('#limitBtnsDrawer').parentElement;
  const ar=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const el=document.createElement('div'); el.className='cnt-ctl';
  el.innerHTML=`<button class="cnt-arrow" aria-label="Fewer cards">${ar('M15 5l-7 7 7 7')}</button><div class="cnt-mid"><span class="cnt-rule"></span><span class="cnt-num">10</span><span class="cnt-rule"></span></div><button class="cnt-arrow" aria-label="More cards">${ar('M9 5l7 7-7 7')}</button>`;
  box.appendChild(el);
  let i=1; const num=el.querySelector('.cnt-num');
  const set=n=>{i=(n+4)%4; num.textContent=steps[i]==='all'?'All':steps[i];};
  el.querySelectorAll('.cnt-arrow')[0].onclick=()=>set(i-1);
  el.querySelectorAll('.cnt-arrow')[1].onclick=()=>set(i+1);
};
async function open(p){
  await p.goto(APP); await p.waitForTimeout(900);
  await p.evaluate(()=>{ selectCardLimit('10'); openCats(); });
  await p.waitForTimeout(700);
}
async function round(p){
  await p.evaluate(()=>{const pp=document.getElementById('panePlay'); const l=[...document.querySelectorAll('.sect-lbl')].find(x=>x.textContent.trim()==='Round'); pp.scrollTop=l.offsetTop-200; });
  await p.waitForTimeout(500);
}
const shots={
  current:async p=>{},
  a:async p=>{await p.addStyleTag({content:POIRET});},
  b:async p=>{await p.addStyleTag({content:POIRET_ALL});},
  c:async p=>{await p.addStyleTag({content:C_CSS}); await p.evaluate(C_JS);},
};
for(const [k,fn] of Object.entries(shots)){
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const p=await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',k,e.message));
  await open(p); await fn(p); await round(p);
  await p.screenshot({path:`${OUT}/${k}.png`});
  await ctx.close();
}
{
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const p=await ctx.newPage(); await p.goto(APP); await p.waitForTimeout(900);
  await p.evaluate(()=>selectCardLimit('10')); await p.click('#btn-next'); await p.waitForTimeout(1500);
  await p.screenshot({path:`${OUT}/counter.png`});
  await ctx.close();
}
await b.close(); server.close();
