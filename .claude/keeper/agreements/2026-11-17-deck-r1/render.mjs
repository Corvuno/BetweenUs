import http from 'node:http'; import path from 'node:path'; import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const S = process.argv[2], ROOT = '/home/user/BetweenUs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 2 });
p.on('requestfailed', r => console.log('FAILED', r.url().slice(0, 80)));
await p.goto('file://' + S + '/sketches.html'); await p.waitForTimeout(1500);
console.log('fonts', await p.evaluate(() => [document.fonts.check('14px Jost'), document.fonts.check('14px Federo')].join()));
for (const id of ['s1', 's2', 's3a', 's3b', 's3c']) { const el = p.locator('#' + id); await el.screenshot({ path: `${S}/shots/${id}.png` }); console.log(id, JSON.stringify(await el.boundingBox())); }
// current, full length, cropped to the sheet
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer(async (req, res) => { try { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); const d = await readFile(f); res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(d); } catch { res.writeHead(404); res.end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const q = await b.newPage({ viewport: { width: 390, height: 1560 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await q.goto(`http://127.0.0.1:${server.address().port}/between-us.html`); await q.waitForTimeout(1200);
await q.evaluate(() => { const h = new Date(); }); await q.click('#tokCats'); await q.waitForTimeout(1200);
const r = await q.evaluate(() => { const a = document.getElementById('cat-area').getBoundingClientRect(); return { y: a.top, h: a.height }; });
await q.screenshot({ path: `${S}/shots/current.png`, clip: { x: 0, y: r.y - 4, width: 390, height: r.h + 4 } });
console.log('current', JSON.stringify(r));
await b.close(); server.close();
