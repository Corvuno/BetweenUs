import http from 'node:http'; import path from 'node:path'; import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const S = process.argv[2], ROOT = '/home/user/BetweenUs', only = process.argv[3];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 2 });
await p.goto('file://' + S + '/looks.html'); await p.waitForTimeout(1500);
for (const id of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) { const el = p.locator('#' + id); await el.screenshot({ path: `${S}/shots/${id}.png` }); console.log(id, (await el.boundingBox()).height); }
if (only !== 'looks') {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer(async (req, res) => { try { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); const d = await readFile(f); res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); } catch { res.writeHead(404); res.end(); } });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const ctx = await b.newContext({ viewport: { width: 390, height: 2140 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const url = `http://127.0.0.1:${server.address().port}/between-us.html`;
  const shot = async (name, lines, open) => {
    const q = await ctx.newPage(); await q.setViewportSize({ width: 390, height: open ? 2140 : 1640 }); await q.goto(url); await q.evaluate(l => { localStorage.setItem('bu.catLines', l ? '1' : '0'); }, lines); await q.reload(); await q.waitForTimeout(1200);
    await q.click('#tokCats'); await q.waitForTimeout(1200);
    if (open) { await q.locator('#cat-area .chapter-group .ch-fold').nth(2).click(); await q.waitForTimeout(1200); }
    const r = await q.evaluate(() => { const a = document.getElementById('cat-area').getBoundingClientRect(); return { y: a.top, h: a.height }; });
    await q.screenshot({ path: `${S}/shots/${name}.png`, clip: { x: 0, y: r.y - 4, width: 390, height: r.h + 4 } }); console.log(name, r.h); await q.close();
  };
  await shot('now1', false, false); await shot('now2', true, true);
  server.close();
}
await b.close();
