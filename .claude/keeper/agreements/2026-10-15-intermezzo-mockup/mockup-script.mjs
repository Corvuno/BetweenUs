import http from 'node:http'; import { readFile } from 'node:fs/promises'; import path from 'node:path';
import { chromium } from '/home/user/BetweenUs/tests/node_modules/playwright/index.mjs';
const ROOT='/home/user/BetweenUs', OUT=process.argv[2]+'/r2', ONLY=process.argv[3];
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(q,r)=>{try{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));const d=await readFile(p);r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(d);}catch{r.writeHead(404);r.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const URL=`http://127.0.0.1:${server.address().port}/between-us.html`;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

const HOLD_CSS=`.btn-draw.hold-mode{background:linear-gradient(135deg,#d24a7c 0%,#9c2853 100%)!important;color:#1c0d13!important;}`;
const FERMATA=`<svg class="cb-mark iz-fermata" viewBox="0 0 200 110" fill="none" stroke="currentColor"><path class="a1" pathLength="1" stroke-width="2.2" d="M40 96A60 60 0 0 1 160 96"/><path class="a2" pathLength="1" stroke-width="1.2" opacity=".55" d="M56 96A44 44 0 0 1 144 96"/><path class="dm" d="M100 70L112 82L100 94L88 82Z" fill="#c6396d" style="fill:#c6396d" stroke="none"/><g class="fl" stroke-width="1.2" opacity=".6"><path d="M4 96H34M166 96H196"/></g></svg>`;
const FERM_CSS=`.iz-fermata{width:calc(var(--d)*.62)!important}
.iz-cap{font-family:'Federo',sans-serif;font-style:normal;font-size:calc(var(--d)*.075);letter-spacing:.32em;text-transform:uppercase;color:var(--muted-l);margin-top:calc(var(--d)*.02)}
.anim .a1,.anim .a2{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.4s .5s ease-out forwards}
.anim .a2{animation-delay:.8s}
.anim .dm{opacity:0;animation:fade .6s 1.7s ease-out forwards, breathe 3.2s 2.4s ease-in-out infinite}
.anim .fl{opacity:0;animation:fade .8s 1.9s forwards}
@keyframes draw{to{stroke-dashoffset:0}} @keyframes fade{to{opacity:.9}}
@keyframes breathe{0%,100%{opacity:.9}50%{opacity:.45}}`;

const HAND5=['life','self','wish','connect','uslove'];
const HAND20=['culture','life','home','work','unwind','world','self','mind','body','values','wish','family','spirit','connect','friends','date','attract','us','usfriend','uslove'];

async function setup(p, hand){
  await p.goto(URL); await p.waitForTimeout(900);
  await p.evaluate((hand)=>{
    const used=new Set();
    const pick=k=>{const c=ALL_CARDS.find(c=>c.level===k&&!used.has(c.question)); used.add(c.question); return c;};
    const h=hand.map(pick);
    state.visibleDeck=h; state.fullDeck=h.slice(); state.currentIndex=h.length;
    state.handStarred=new Set([h[2].question, h[9] && h[9].question].filter(Boolean));
    document.getElementById('card').classList.remove('is-start');
    showHandSummary(); if(typeof updateDrawMore==='function') updateDrawMore();
  }, hand);
  await p.waitForTimeout(700);
  await p.addStyleTag({content:HOLD_CSS+FERM_CSS});
}
async function back(p,{caption='',label=null,anim=false}={}){
  await p.evaluate(({FERMATA,caption,label,anim})=>{
    const card=document.getElementById('card');
    const m=document.querySelector('.cb-mark'); m.insertAdjacentHTML('afterend',FERMATA); m.remove();
    const t=document.getElementById('cardBackText'); t.textContent=caption; t.className=caption?'cb-text iz-cap':'cb-text'; if(!caption) t.style.display='none';
    document.querySelector('.cb-rule').style.background='linear-gradient(90deg,transparent,#c6396d,transparent)';
    if(label){ const n=document.getElementById('btn-next'); n.childNodes.forEach(x=>{}); n.querySelector('span')?n.querySelector('span').textContent=label:n.textContent=label; }
    if(anim) card.classList.add('anim');
    card.classList.add('is-start');
  },{FERMATA,caption,label,anim});
}
async function handList(p,{scrollTo=0}={}){
  await p.evaluate((scrollTo)=>{
    document.getElementById('card-level').textContent='';
    const star=document.querySelector('.card-star'); if(star) star.style.display='none';
    const rows=state.visibleDeck.map(c=>{const col=CATEGORIES[c.level].color; const s=state.handStarred.has(c.question);
      return `<li><span class="hd-d" style="background:${col}"></span><span class="hd-q">${c.question}</span><span class="hd-s ${s?'on':''}">${s?'★':'☆'}</span></li>`}).join('');
    document.getElementById('card-question').innerHTML=`<div class="hd-box"><ol class="hd-list">${rows}</ol><span class="hd-track"><i class="hd-thumb"></i></span></div>`;
    const s=document.createElement('style'); s.textContent=`
      body.showing-hand-summary .card-question{width:100%;align-self:stretch}
      .hd-list{list-style:none;margin:0;padding:0 6px 0 0;display:flex;flex-direction:column;gap:10px;width:100%;text-align:left;max-height:172px;overflow-y:auto;box-sizing:border-box;width:calc(100% - 18px);padding:8px 8px 14px 0;-webkit-mask-image:linear-gradient(transparent,#000 10px,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(transparent,#000 10px,#000 calc(100% - 22px),transparent)}
      .hd-box{position:relative;width:100%}.hd-list{scrollbar-width:none}.hd-track{position:absolute;right:4px;top:10px;bottom:10px;width:1px;background:rgba(201,168,76,.18)}.hd-thumb{position:absolute;left:-1px;width:3px;background:rgba(232,201,122,.7)}.hd-list::-webkit-scrollbar{width:0}.hd-list::-webkit-scrollbar-track{background:rgba(201,168,76,.10)}.hd-list::-webkit-scrollbar-thumb{background:rgba(201,168,76,.6)}
      .hd-list li{display:grid;grid-template-columns:8px 1fr 18px;gap:10px;align-items:baseline}
      .hd-d{width:6px;height:6px;transform:rotate(45deg) translateY(-2px);display:block}
      .hd-q{font-family:'Bodoni Moda',serif;font-style:italic;font-size:.8rem;line-height:1.35;color:var(--cream)}
      .hd-s{color:var(--muted);font-size:.85rem;text-align:center;font-style:normal}.hd-s.on{color:var(--gold-l)}`;
    document.head.appendChild(s);
    const L=document.querySelector('.hd-list'); L.scrollTop=scrollTo;
    const tr=document.querySelector('.hd-track'), th=document.querySelector('.hd-thumb');
    if(L.scrollHeight<=L.clientHeight+2){tr.style.display='none';}
    else{const H=tr.clientHeight; const h=Math.max(18,H*L.clientHeight/L.scrollHeight); th.style.height=h+'px'; th.style.top=((H-h)*L.scrollTop/(L.scrollHeight-L.clientHeight))+'px';}
  },scrollTo);
}
const shots={
  'b1':async p=>{await setup(p,HAND5); await back(p,{caption:'Intermezzo'});},
  'b2':async p=>{await setup(p,HAND5); await back(p,{label:'Hold for the next hand'});},
  'h5':async p=>{await setup(p,HAND5); await handList(p);},
  'h20':async p=>{await setup(p,HAND20); await handList(p);},
  'h20s':async p=>{await setup(p,HAND20); await handList(p,{scrollTo:360});},
};
for(const [k,fn] of Object.entries(shots)){
  if(ONLY && ONLY!==k) continue;
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const p=await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',k,e.message));
  await fn(p); await p.waitForTimeout(900);
  await p.screenshot({path:`${OUT}/${k}.png`,clip:{x:0,y:0,width:390,height:620}});
  await ctx.close();
}
// motion: B3
if(!ONLY || ONLY==='b3'){
  const ctx=await b.newContext({viewport:{width:390,height:620},deviceScaleFactor:1,recordVideo:{dir:OUT+'/vid',size:{width:390,height:620}}});
  const p=await ctx.newPage();
  await p.goto(URL); await p.waitForTimeout(900);
  await p.evaluate(()=>{const pick=k=>ALL_CARDS.find(c=>c.level===k);const h=['life','self','wish','connect','uslove'].map(pick);
    state.visibleDeck=h;state.fullDeck=h.slice();state.currentIndex=4;document.getElementById('card').classList.remove('is-start');setCardDisplay(h[4]);if(typeof updateDrawMore==='function')updateDrawMore();if(typeof renderProgress==='function')renderProgress(5);});
  await p.addStyleTag({content:HOLD_CSS+FERM_CSS});
  await p.waitForTimeout(1800);
  await p.evaluate(()=>{state.currentIndex=5;showHandSummary();if(typeof updateDrawMore==='function')updateDrawMore();});
  await back(p,{anim:true});
  await p.waitForTimeout(6500);
  await ctx.close();
}
await b.close(); server.close();
