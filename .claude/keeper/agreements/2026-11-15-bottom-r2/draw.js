const { chromium } = require('playwright');
const out = process.argv[2]; const which=(process.argv[3]||'a,b').split(',');
const BASE = `
body{justify-content:flex-start!important;padding-bottom:0!important;min-height:100dvh!important}
.app{min-height:100dvh;padding-top:26px;padding-bottom:30px}
.nav-lines,.prog-count,.row-hint,#screenRow{display:none!important}
.card-wrap{margin-top:auto!important;margin-bottom:auto!important}
.controls-wrap{display:flex!important;flex-direction:column;align-items:stretch;row-gap:0!important;gap:0!important;margin-top:0!important;padding-top:18px;flex:none}
.progress{height:8px!important;margin:0!important;padding:0 16px!important;box-sizing:border-box!important;justify-content:center!important}
.progress-tick{height:8px!important;border-radius:1.5px}
.progress-tick.end{position:absolute;right:0;margin:0!important}
.progress{position:relative}
.sk-bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:46px;width:100%;margin-top:11px}
.sk-bar>*{grid-row:1!important}
.sk-bar .sk-end.l{grid-column:1}.sk-end.r{grid-column:3}
.sk-bar #btn-next{grid-column:2!important;width:min(13.6em,51cqw)!important;height:46px!important;font-size:min(.86rem,3.95cqw);font-weight:500;
  clip-path:polygon(20px 0,calc(100% - 20px) 0,100% 50%,calc(100% - 20px) 100%,20px 100%,0 50%)}
.sk-end{display:flex;align-items:center;justify-content:center;min-width:0;height:100%}
.sk-end #btn-menu{grid-column:auto!important;grid-row:auto!important;justify-self:auto}
.sk-end .quiet-word{display:flex!important;align-items:center!important;justify-content:center;width:100%;height:100%;padding:0 2px!important;min-width:0;
  font-size:clamp(10px,3.15cqw,12.5px);font-weight:500;letter-spacing:.17em;text-align:center;line-height:1.45;color:color-mix(in srgb,var(--gold-l) 82%,var(--cream))}
.sk-end .quiet-word[hidden]{display:none!important}
`;
const V = {
  a: BASE + `.sk-foot{height:2px;margin-top:11px;background:var(--metal)}`,
  b: BASE + `.sk-foot{display:none}`,
};
async function restructure(p){
  await p.evaluate(()=>{
    const prog=document.getElementById('progress');
    const bar=document.createElement('div'); bar.className='sk-bar';
    const l=document.createElement('div'); l.className='sk-end l'; const r=document.createElement('div'); r.className='sk-end r';
    const vis=e=>getComputedStyle(e).display!=='none';
    const cands=['btnWays','btnParty','btnSave'].map(i=>document.getElementById(i));
    const shown=cands.filter(vis);
    cands.forEach(e=>{ if(!shown.includes(e)) e.hidden=true; l.appendChild(e); });
    r.appendChild(document.getElementById('btn-menu'));
    bar.append(l,document.getElementById('btn-next'),r);
    const ft=document.createElement('div'); ft.className='sk-foot';
    prog.after(bar); bar.after(ft);
  });
}
(async () => {
  const b = await chromium.launch();
  const sizes={s:[360,640],m:[412,780],t:[412,915]};
  const jobs=[]; for (const v of which) { for (const z of ['m','s','t']) jobs.push([v,z,'card']); for (const k of ['start','end','long']) jobs.push([v,'m',k]); }
  for (const [v,z,k] of jobs) {
    const [w,h]=sizes[z];
    const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:true, isMobile:true, deviceScaleFactor:2 });
    const p = await ctx.newPage();
    await p.goto('http://localhost:8765/between-us.html'); await p.waitForTimeout(1400);
    const next=async(n)=>{ for(let i=0;i<n;i++){ await p.click('#btn-next'); await p.waitForTimeout(1250);} };
    if (k==='card') await next(3);
    if (k==='long') { await p.click('#tokLine'); await p.waitForTimeout(900); await p.click('#limitBtnsDrawer [data-limit="20"]'); await p.waitForTimeout(300); await p.click('#catGoBtn'); await p.waitForTimeout(1800); await next(7); }
    if (k==='end') { await next(6); await p.waitForTimeout(2500); }
    await restructure(p); await p.addStyleTag({content:V[v]});
    if (k==='end') await p.evaluate(()=>{document.getElementById('btn-next').textContent='Next hand'});
    await p.evaluate(()=>window.dispatchEvent(new Event('resize'))); await p.waitForTimeout(700);
    await p.screenshot({path:`${out}/${v}-${z}-${k}.png`});
    await ctx.close();
  }
  await b.close();
})();
