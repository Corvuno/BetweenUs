import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const S = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + S + '/foot.html'); await p.waitForTimeout(1500);
for (const id of ['fa', 'fb', 'fc']) { const el = p.locator('#' + id); await el.screenshot({ path: `${S}/shots/${id}.png` }); console.log(id, (await el.boundingBox()).height); }
await b.close();
