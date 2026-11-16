const { chromium } = require('playwright');
const out = process.argv[2];
const BASE = `
body{justify-content:flex-start!important;padding-bottom:0!important;min-height:100dvh!important}
.app{min-height:100dvh;padding-top:26px;padding-bottom:28px}
.nav-lines,.prog-count,.row-hint,#screenRow{display:none!important}
.controls-wrap{display:flex!important;flex-direction:column;align-items:stretch;row-gap:0!important;gap:0!important;margin-top:0!important}
.progress{height:10px!important}
.progress-tick{height:10px!important;border-radius:2px}
.sk-bar{display:grid;grid-template-columns:1fr 2fr 1fr;height:46px;width:100%}
.sk-bar>*{grid-row:1!important}.sk-bar .sk-end.l{grid-column:1}.sk-bar #btn-next{grid-column:2!important;width:auto!important;height:46px!important;font-size:.86rem}
.sk-end{display:flex;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--gold) 55%,transparent);min-width:0}
.sk-end.l{border-right:none}.sk-end.r{border-left:none;grid-column:3}
.sk-end #btn-menu{grid-column:auto!important;grid-row:auto!important;justify-self:auto}
.sk-end .quiet-word{display:flex!important;align-items:center!important;justify-content:center;width:100%;height:100%;padding:0 4px!important;min-width:0;font-size:10.5px;letter-spacing:.18em;text-align:center;line-height:1.5;color:#cdbfa6}
.sk-end .quiet-word[hidden]{display:none!important}
`;
const V = {
  now: null,
  one: BASE + `.controls-wrap{flex:1}.progress{margin-top:14px!important;margin-bottom:0!important}.sk-space{flex:1;min-height:22px}`,
  two: BASE + `.card-wrap{margin-top:auto!important;margin-bottom:auto!important}.controls-wrap{padding-top:16px}.controls-wrap{flex:none}.progress{margin:0 0 12px!important;padding:0!important}.sk-space{display:none}`,
};
async function restructure(p){
  await p.evaluate(()=>{
    const cw=document.getElementById('controls-wrap'), prog=document.getElementById('progress');
    const bar=document.createElement('div'); bar.className='sk-bar';
    const l=document.createElement('div'); l.className='sk-end l'; const r=document.createElement('div'); r.className='sk-end r';
    const vis=e=>getComputedStyle(e).display!=='none';
    const cands=['btnWays','btnParty','btnSave'].map(i=>document.getElementById(i));
    const shown=cands.filter(vis);
    cands.forEach(e=>{ if(!shown.includes(e)) e.hidden=true; l.appendChild(e); });
    r.appendChild(document.getElementById('btn-menu'));
    bar.append(l,document.getElementById('btn-next'),r);
    const sp=document.createElement('div'); sp.className='sk-space';
    prog.after(sp); sp.after(bar);
  });
}
(async () => {
  const b = await chromium.launch();
  const sizes={s:[360,640],m:[412,780],t:[412,915]};
  const jobs=[]; for (const v of ['two']) { for (const z of ['m','s','t']) jobs.push([v,z,'card']); for (const k of ['start','end','long']) jobs.push([v,'m',k]); }
  for (const [v,z,k] of jobs) {
    const [w,h]=sizes[z];
    const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:true, isMobile:true, deviceScaleFactor:2 });
    const p = await ctx.newPage();
    await p.goto('http://localhost:8765/between-us.html'); await p.waitForTimeout(1400);
    const next=async(n)=>{ for(let i=0;i<n;i++){ await p.click('#btn-next'); await p.waitForTimeout(1250);} };
    if (k==='card') await next(3);
    if (k==='long') { await p.click('#tokLine'); await p.waitForTimeout(900); await p.click('#limitBtnsDrawer [data-limit="20"]'); await p.waitForTimeout(300); await p.click('#catGoBtn'); await p.waitForTimeout(1800); await next(7); }
    if (k==='end') { await next(6); await p.waitForTimeout(2500); }
    if (V[v]) { await restructure(p); await p.addStyleTag({content:V[v]});
      if (k==='end') await p.evaluate(()=>{document.getElementById('btn-next').textContent='Next hand'});
      await p.evaluate(()=>window.dispatchEvent(new Event('resize'))); await p.waitForTimeout(700); }
    await p.screenshot({path:`${out}/${v}-${z}-${k}.png`});
    console.log(v,z,k, await p.textContent('#btn-next'));
    await ctx.close();
  }
  await b.close();
})();
