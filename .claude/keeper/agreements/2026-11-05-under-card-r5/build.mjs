// Screenshots for round 1: node build.mjs (app served on :8765 from the repo root).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const V = require('./variants.js');
const dir = new URL('.', import.meta.url).pathname;
const W = +(process.argv[2] || 412), Hh = +(process.argv[3] || 915), tag = process.argv[4] || '';
const b = await chromium.launch();
for (const hints of [false, true]) {
  for (const key of ['current', ...Object.keys(V)]) {
    const ctx = await b.newContext({ viewport:{width:W,height:Hh}, deviceScaleFactor:2, isMobile:true, hasTouch:true });
    await ctx.addInitScript(h => { Math.random = (() => { let x = 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; })(); localStorage.setItem('bu.spotBrightened','1'); localStorage.setItem('bu.seed-test','1');
      if (!h) ['bu.tokTaught','bu.hintThreeTaught','bu.hintSpotTaught','bu.hintTwistTaught'].forEach(k=>localStorage.setItem(k,'1')); }, hints);
    const p = await ctx.newPage();
    await p.goto('http://localhost:8765/between-us.html'); await p.waitForTimeout(1000);
    for (let i = 0; i < 3; i++) { await p.click('#btn-next'); await p.waitForTimeout(i < 2 ? 900 : 1600); }
    if (key !== 'current') {
      const s = await p.evaluate(() => {
        const ticks = [...document.querySelectorAll('#progress .progress-tick:not(.end)')].map(t => ({
          color: t.style.getPropertyValue('--tick-color') || 'var(--gold)',
          state: t.classList.contains('current') ? 'current' : t.classList.contains('seen') ? 'seen' : '' }));
        const [cur, total] = (document.getElementById('progCountNum').textContent.match(/\d+/g) || ['3','5']);
        return { ticks, cur, total };
      });
      s.hints = hints;
      const v = V[key](s); const pre = v.pre ? v.pre.toString() : '';
      await p.evaluate(({ css, html, card, page, pre }) => {
        if (pre) (0, eval)('(' + pre + ')')();
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
        const cw = document.getElementById('controls-wrap');
        [...cw.children].forEach(c => c.style.display = 'none');
        cw.insertAdjacentHTML('beforeend', html);
        if (page) document.body.insertAdjacentHTML("beforeend", page);
        if (card) document.getElementById('card').insertAdjacentHTML('beforeend', card);
      }, { ...v, pre });
      await p.waitForTimeout(300);
    }
    await p.screenshot({ path: `${dir}img/${tag}${key}${hints ? '-hints' : ''}.png` });
    await ctx.close();
  }
}
await b.close();
console.log('done');
