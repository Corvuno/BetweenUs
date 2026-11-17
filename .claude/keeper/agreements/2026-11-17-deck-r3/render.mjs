import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const S = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1800 }, deviceScaleFactor: 2 });
await p.goto('file://' + S + '/looks.html'); await p.waitForTimeout(1500);
for (const id of ['l1', 'l2', 's1', 's2']) { const el = p.locator('#' + id); await el.screenshot({ path: `${S}/shots/${id}.png` }); console.log(id, (await el.boundingBox()).height); }
await b.close();
