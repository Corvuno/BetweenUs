// Renders the real app (served from the repo) and injects the wildcard at screenshot time only.
import http from 'node:http'; import {readFile,readdir} from 'node:fs/promises'; import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const ROOT='/home/user/BetweenUs', OUT=path.join(ROOT,'.claude/keeper/agreements/2026-11-03-wildcard-r1');
const CSS=await readFile(path.join(OUT,'variants.css'),'utf8');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(q,r)=>{try{const p=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,p==='/'?'/between-us.html':p);r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(await readFile(f));}catch{r.writeHead(404);r.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/between-us.html`;
const b=await chromium.launch({args:['--disable-gpu','--use-gl=swiftshader']});
const TEXT='Ask anyone here the question you’ve been saving.';
const RAIL={a:['#6b4f12','#8a6a1f','#a8842a'],b:['#8a6a1f','#c9a84c','#e8c97a'],c:['#8a6a1f','#c9a84c','#e8c97a']};

// swaps the drawn card's face for the wildcard (or back to the real card); runs in the page
function apply(v,text){
  const card=document.getElementById('card'), ov=document.getElementById('partyOverlay');
  for(const el of [card,ov]) el.classList.remove('wc-a','wc-b','wc-c');
  for(const x of document.querySelectorAll('.wc-extra')) x.remove();
  const sets=[[document.getElementById('card-level'),document.getElementById('card-question'),document.getElementById('c-accent'),card],
              [document.getElementById('party-level'),document.getElementById('party-question'),document.getElementById('party-accent'),ov]];
  window.__orig??=sets.map(([l,q,a])=>({l:l.textContent,lc:l.style.color,q:q.textContent,a:a.getAttribute('style')}));
  sets.forEach(([l,q,a,host],i)=>{
    const o=window.__orig[i];
    if(v==='cur'){l.textContent=o.l;l.style.color=o.lc;q.textContent=o.q;a.setAttribute('style',o.a);return;}
    l.textContent='Wildcard';l.style.color='';q.textContent=text;
    const r=window.__RAIL[v];a.style.setProperty('--rail-d',r[0]);a.style.setProperty('--rail-m',r[1]);a.style.setProperty('--rail-l',r[2]);
    host.classList.add('wc-'+v);
    const x=document.createElement('span');x.className='wc-extra';x.setAttribute('aria-hidden','true');x.textContent=v==='b'?'?':'';
    (i===0?card:document.querySelector('.party-card')).prepend(x);
  });
}
async function session(name,w,h,shots){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:w<600});
  const pg=await ctx.newPage();
  await pg.addInitScript(()=>{let s=7;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};});
  await pg.goto(url);await pg.waitForTimeout(900);
  for(let i=0;i<3;i++){await pg.locator('#btn-next').click();await pg.waitForTimeout(2600);}   // card 3: a wildcard is never first
  await pg.addStyleTag({content:CSS});
  await pg.evaluate(R=>{window.__RAIL=R},RAIL);
  await shots(pg,name);
  await ctx.close();
}
const V=['cur','a','b','c'];
// make apply() visible to the page
const applySrc=apply.toString();
async function prep(pg){await pg.evaluate(src=>{window.apply=new Function('return '+src)()},applySrc);}
const run=async(prefix,w,h)=>session(prefix,w,h,async(pg)=>{
  await prep(pg);
  for(const v of V){await pg.evaluate(([v,t])=>window.apply(v,t),[v,TEXT]);await pg.waitForTimeout(700);await pg.screenshot({path:`${OUT}/img/${prefix}-main-${v}.png`});}
  await pg.evaluate(()=>window.apply('cur',''));
  await pg.locator('#btnParty').click();await pg.waitForTimeout(1500);
  for(const v of V){await pg.evaluate(([v,t])=>window.apply(v,t),[v,TEXT]);await pg.waitForTimeout(700);await pg.screenshot({path:`${OUT}/img/${prefix}-spot-${v}.png`});}
});
await run('phone',390,844);
await run('pc',1440,900);
// ---- the Deck sheet with a Wildcards row (phone) ----
await session('sheet',390,844,async(pg)=>{
  await pg.locator('#btn-menu').click();await pg.waitForTimeout(700);
  await pg.locator('#d-cats').click();await pg.waitForTimeout(1000);
  const shot=async(name)=>{await pg.evaluate(()=>document.querySelectorAll('#cat-area *').forEach(e=>{if(e.scrollHeight>e.clientHeight+20&&getComputedStyle(e).overflowY!='visible')e.scrollTop=1e5}));await pg.waitForTimeout(500);await pg.screenshot({path:`${OUT}/img/sheet-${name}.png`});};
  await shot('cur');
  await pg.evaluate(()=>{
    const fixed=document.querySelector('.chapter-group--fixed');
    const row=fixed.cloneNode(false);row.classList.remove('chapter-group--fixed');row.dataset.group='wildcards';
    row.innerHTML='<button type="button" class="ch-fold ch-fold--row" id="wcToggle" aria-pressed="true"><span class="ch-name">Wildcards</span><span class="ch-desc">Ask your own question</span><span class="wc-state"><i></i>On</span></button>';
    fixed.after(row);
    const st=document.createElement('style');
    st.textContent='.wc-state{display:inline-flex;align-items:center;gap:8px;margin-inline-start:auto;padding-inline:14px 6px;font:400 .8rem/1 Jost,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--celadon)}.wc-state i{width:6px;height:6px;border-radius:50%;background:currentColor}';
    document.head.append(st);
  });
  await shot('new');
});
await b.close();server.close();
console.log((await readdir(path.join(OUT,'img'))).join('\n'));
