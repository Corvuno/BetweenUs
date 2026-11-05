// Round 6 screenshots: every design at three moments (start card, a card, end of hand) + first visit.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const V = require('./variants.js');
const dir = new URL('.', import.meta.url).pathname;
const b = await chromium.launch();
const shots = [['start',0,false],['mid',3,false],['end',6,false],['mid',3,true]];
for (const key of ['current', ...Object.keys(V)]) for (const [state, draws, hints] of shots) {
  const ctx = await b.newContext({ viewport:{width:412,height:915}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  await ctx.addInitScript(h => { Math.random = (() => { let x = 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; })();
    localStorage.setItem('bu.spotBrightened','1'); if (!h) ['bu.tokTaught','bu.hintThreeTaught','bu.hintSpotTaught','bu.hintTwistTaught'].forEach(k=>localStorage.setItem(k,'1')); }, hints);
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/between-us.html'); await p.waitForTimeout(1200);
  for (let i = 0; i < draws; i++) { await p.click('#btn-next'); await p.waitForTimeout(900); }
  await p.waitForTimeout(state === 'end' ? 3000 : 1200);
  if (key !== 'current') {
    const s = await p.evaluate(() => { const [cur, total] = (document.getElementById('progCountNum').textContent.match(/\d+/g) || ['0','5']);
      return { cur, total, label: document.getElementById('btn-next').textContent.trim() }; });
    Object.assign(s, { state, hints });
    const v = V[key](s);
    await p.evaluate(({ css, html, pre }) => {
      if (pre) (0, eval)('(' + pre + ')')();
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      const cw = document.getElementById('controls-wrap'); [...cw.children].forEach(c => c.style.display = 'none');
      cw.insertAdjacentHTML('beforeend', html);
    }, { css: v.css, html: v.html, pre: v.pre || '' });
    await p.waitForTimeout(300);
  }
  await p.screenshot({ path: `${dir}img/${key}-${state}${hints ? '-hints' : ''}.png` });
  await ctx.close();
}
await b.close(); console.log('done');
