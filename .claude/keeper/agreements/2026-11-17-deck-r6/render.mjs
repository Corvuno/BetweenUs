import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const S = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1800 }, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + S + '/looks.html'); await p.waitForTimeout(1500);
for (const id of ['p1', 'p2']) { const el = p.locator('#' + id); const bb = await el.boundingBox(); const g = await p.locator('#' + id + ' .g').nth(6).boundingBox();
  await p.screenshot({ path: `${S}/shots/${id}.png`, clip: { x: bb.x, y: g.y, width: bb.width, height: bb.y + bb.height - g.y } }); console.log(id, Math.round(bb.y + bb.height - g.y)); }
await b.close();
