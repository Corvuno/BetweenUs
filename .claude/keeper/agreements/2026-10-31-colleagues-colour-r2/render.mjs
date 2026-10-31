import { chromium } from 'playwright';
import http from 'node:http'; import { readFile } from 'node:fs/promises'; import path from 'node:path';
const ROOT = '/home/user/BetweenUs';
const OUT = ROOT + '/.claude/keeper/agreements/2026-10-31-colleagues-colour/img';
const COLS = {current:null, a:'#e6c79c', b:'#c4a3c8', c:'#bfa0a3'};
let colour = null;
const server = http.createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(req.url.split('?')[0]);
    let data = await readFile(path.join(ROOT, p === '/' ? '/between-us.html' : p), 'utf8').catch(()=>null);
    if (data === null) { data = await readFile(path.join(ROOT, p)); res.end(data); return; }
    if (colour && p.endsWith('/categories.js')) data = data.replace(/(uslove:\s*\{[^}]*\},)/, `$1\n  uscolleague: { label:"Us: Colleagues", color:"${colour}", band:4, focus:1, desc:"About working together, directly", chapter:"aboutus", bucket:"usb" },`);
    if (colour && p.endsWith('/questions.js')) data = data.replace('  // ─── USFRIEND ───', Array.from({length:12},(_,i)=>`  { level: "uscolleague", question: "Mock ${i}" },`).join('\n') + '\n  // ─── USFRIEND ───');
    if (colour && p.endsWith("/config.js")) data = data.replaceAll(`"uslove"`, `"uslove","uscolleague"`);
    const ext = path.extname(p); res.writeHead(200, {'Content-Type': ext==='.js'?'text/javascript':ext==='.css'?'text/css':'text/html'}); res.end(data);
  } catch (e) { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/between-us.html`;
const browser = await chromium.launch();
for (const [k, c] of Object.entries(COLS)) {
  colour = c;
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(url); await page.waitForTimeout(800);
  await page.locator('#tokCats').click(); await page.waitForTimeout(700);
  const row = page.locator('.chapter[data-chapter="aboutus"]');
  await row.scrollIntoViewIfNeeded();
  await row.locator('.ch-fold').click(); await page.waitForTimeout(700);
  const panel = page.locator('.chapter-panel[data-chapter="aboutus"]');
  await row.scrollIntoViewIfNeeded();
  const b1 = await row.boundingBox(), b2 = await panel.boundingBox();
  const y = Math.max(0, b1.y - 8), h = (b2.y + b2.height) - y + 12;
  await page.screenshot({ path: `${OUT}/${k}.png`, clip: { x: 0, y, width: 390, height: Math.min(h, 844 - y) } });
  console.log(k, Math.round(h));
  await page.close();
}
await browser.close(); server.close();
