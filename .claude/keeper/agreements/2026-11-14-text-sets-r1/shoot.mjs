import { chromium, serve, openApp, MOMENTS, settle } from './harness.mjs'; import { SETS, SNAP } from './snap.mjs'; import { mkdir, writeFile } from 'node:fs/promises';
const only = process.argv[2]; await mkdir('shots', { recursive: true });
const server = await serve(); const browser = await chromium.launch(); const meta = {};
const STYLE = () => { const parse = c => { let m = c.match(/-?[\d.]+(e-?\d+)?/g).map(Number); if (c.startsWith('color(')) m = [m[0] * 255, m[1] * 255, m[2] * 255, m[3] ?? 1]; return m; };
  const out = []; for (const el of document.querySelectorAll('body *')) { const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); if (!t || el.closest('svg') || ['SCRIPT','STYLE'].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
    let op = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity); if (op < .05) continue;
    const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); if (top && !(el.contains(top) || top.contains(el))) continue;
    const c = parse(cs.color); const a = (c[3] ?? 1) * op; const hex = '#' + [0, 1, 2].map(i => Math.round(c[i] * a + [18, 16, 13][i] * (1 - a)).toString(16).padStart(2, '0')).join('');
    const fs = parseFloat(cs.fontSize); out.push({ t: t.slice(0, 30), cls: (el.id ? '#' + el.id : '') + '.' + [...el.classList].join('.'), fam: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(), size: Math.round(fs * 100) / 100, w: cs.fontWeight, it: cs.fontStyle === 'italic', ls: cs.letterSpacing === 'normal' ? 0 : Math.round(parseFloat(cs.letterSpacing) / fs * 1000) / 1000, up: cs.textTransform === 'uppercase', hex, ow: el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible' }); }
  return out; };
for (const dev of ['phone', 'wide']) for (const m of MOMENTS) for (const v of ['now', 'tight', 'loose']) {
  if (only && !(`${dev}-${m.key}`.includes(only))) continue;
  const page = await openApp(browser, server.address().port, dev, dev === 'phone' ? 2 : 1);
  try { await m.run(page); await settle(page); if (v !== 'now') { await page.evaluate(SNAP, SETS[v]); await settle(page); }
    meta[`${dev}-${m.key}-${v}`] = await page.evaluate(STYLE);
    await page.screenshot({ path: `shots/${dev}-${m.key}-${v}.jpg`, type: 'jpeg', quality: 82, animations: 'disabled' });
    if (m.key === 'deck' && dev === 'phone') { await page.evaluate(() => { const s = [...document.querySelectorAll('#cat-area, #cat-area *')].find(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (s) s.scrollTop = 560; }); await page.waitForTimeout(300);
      meta[`${dev}-deck2-${v}`] = await page.evaluate(STYLE); await page.screenshot({ path: `shots/${dev}-deck2-${v}.jpg`, type: 'jpeg', quality: 82, animations: 'disabled' }); }
  } catch (e) { console.log('FAIL', dev, m.key, v, e.message.split('\n')[0]); }
  await page.context().close();
}
await browser.close(); server.close(); await writeFile(only ? `meta-${only}.json` : 'meta.json', JSON.stringify(meta));
console.log('done', Object.keys(meta).length);
