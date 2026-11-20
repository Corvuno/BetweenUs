// Lays each round-2 drawing over the live start card on a phone (412 x 915, an Android-sized Chrome)
// and saves a still and a recording of the arrival. Run from the BetweenUs repo root:
//   node /mnt/project-files/opening-streams/round6/render.js <outdir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const gen = require('./backs.js');
const out = process.argv[2] || 'out';
fs.mkdirSync(out, { recursive: true });
const app = 'file://' + path.resolve('between-us.html');

// Arrival: the lines draw in from the frame toward the door, outer ones first (60ms apart), with the
// app's own entering curve; the coloured areas fade in once the lines are mostly there. The logo keeps
// its own draw and breathing. Under reduced motion everything is simply there.
const CSS = `
.cb-streams svg .d{stroke-dasharray:1;stroke-dashoffset:1;animation:r2draw 1.3s calc((10 - var(--i)) * 60ms + .1s) var(--ease-out) forwards;}
.cb-streams svg .a{opacity:0;animation:r2fade .8s calc(.8s + (10 - var(--i)) * 30ms) var(--ease-out) forwards;}
@keyframes r2draw{to{stroke-dashoffset:0}}
@keyframes r2fade{to{opacity:1}}
.r2still .cb-streams svg .d{animation:none;stroke-dasharray:none;stroke-dashoffset:0}
.r2still .cb-streams svg .a{animation:none;opacity:1}
@media (prefers-reduced-motion:reduce){.cb-streams svg .d{animation:none;stroke-dasharray:none}.cb-streams svg .a{animation:none;opacity:1}}`;

const inject = (svgText, still) => `
  (() => {
    const go = () => {
      const s = document.createElement('style'); s.textContent = ${JSON.stringify(CSS)}; document.head.appendChild(s);
      const span = document.querySelector('.cb-streams'); if (!span) return setTimeout(go, 5);
      span.innerHTML = ${JSON.stringify(svgText)};
      ${still ? "document.documentElement.classList.add('r2still');" : ''}
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  })();`;

(async () => {
  const b = await chromium.launch();
  const only = process.argv[3]; const all = Object.keys(gen); const names = all;
  // today's card, for comparison
  if (!only) {
    const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
    await p.goto(app); await p.waitForTimeout(3200);
    const box = await (await p.$('#card')).boundingBox();
    await p.screenshot({ path: `${out}/0-today.png`, clip: { x: 0, y: box.y - 230, width: 412, height: box.height + 380 } });
    await p.close();
  }
  for (const [n, name] of names.entries()) {
    if (only && name !== only) continue;
    const art = gen[name](true);
    // still
    const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
    await p.addInitScript(inject(art, true));
    await p.goto(app); await p.waitForTimeout(3200);
    const box = await (await p.$('#card')).boundingBox();
    const clip = { x: 0, y: Math.round(box.y - 230), width: 412, height: Math.round(box.height + 380) };
    await p.screenshot({ path: `${out}/${n + 1}-${name}.png`, clip });
    await p.close();
    // arrival: every animation on the page is paused and stepped, so each frame is exact at 2x
    const v = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
    await v.addInitScript(inject(art, false));
    await v.goto(app); await v.waitForTimeout(150);
    fs.mkdirSync(`${out}/frames/${n + 1}`, { recursive: true });
    const cardClip = { x: 0, y: Math.round(box.y - 12), width: 412, height: Math.round(box.height + 24) };
    for (let fr = 0; fr < 110; fr++) {
      await v.evaluate(t => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }, fr * 40);
      await v.screenshot({ path: `${out}/frames/${n + 1}/${String(fr).padStart(3, '0')}.png`, clip: cardClip });
    }
    await v.close();
    fs.writeFileSync(`${out}/clip.json`, JSON.stringify(clip));
  }
  await b.close();
})();
