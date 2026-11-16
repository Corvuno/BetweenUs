// Round 3 of the phone's bottom (#160): four ornaments laid over the live app.
const { chromium } = require('playwright');
const out = process.argv[2]; const which = (process.argv[3] || 'fan,window,pendant,frame').split(',');
const DSF = +(process.argv[4] || 2);

const BASE = `
body{justify-content:flex-start!important;padding-bottom:0!important;min-height:100dvh!important}
.app{min-height:100dvh;padding-top:26px;padding-bottom:22px}
.controls-wrap{display:none!important}
.card-wrap{margin-top:auto!important;margin-bottom:auto!important}
.mk{position:relative;width:100%;max-width:var(--card-max,none);container-type:inline-size;flex:none}
.mk svg{display:block;width:100%;height:auto;overflow:visible}
.mk-btn{position:absolute;display:flex;align-items:center;justify-content:center;color:var(--bg);
  font:400 var(--fs-2)/1 'Federo','Jost',sans-serif;letter-spacing:var(--track-2);text-transform:uppercase;white-space:nowrap}
.mk-w{position:absolute;transform:translate(-50%,-50%);color:var(--stone);white-space:nowrap;
  font:500 var(--fs-1)/1.35 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;text-align:center}
`;

function build(opt) {
  // runs in the page
  const G = '#c9a84c', GL = '#e8c97a';
  const ticks = [...document.querySelectorAll('#progress .progress-tick:not(.end)')].map(t => ({
    c: getComputedStyle(t).backgroundColor, s: t.classList.contains('current') ? 'cur' : t.classList.contains('seen') ? 'seen' : 'up' }));
  const endEl = document.querySelector('#progress .progress-tick.end');
  const endOn = !!(endEl && endEl.classList.contains('current'));
  const btn = document.getElementById('btn-next');
  const label = btn.textContent.trim();
  const bg = getComputedStyle(btn).backgroundImage;
  const vis = e => e && getComputedStyle(e).display !== 'none';
  const leftEl = ['btnWays', 'btnParty', 'btnSave'].map(i => document.getElementById(i)).find(vis);
  const left = leftEl ? leftEl.querySelector('.row-lbl').textContent.trim() : '';
  const W = 376, cx = 188;
  const u = n => `${(n / 3.76).toFixed(3)}cqw`;
  const op = t => t.s === 'cur' ? 1 : t.s === 'seen' ? .5 : .55;
  const col = t => t.s === 'up' ? '#4a4030' : t.c;
  let H, svg = '', bx, by, bw, bh, clip = '', wl, wr, wy, leftHtml = left.replace(' to ', ' to<br>');

  const tickRow = (y, h, x0, x1) => {
    const n = ticks.length, dia = endEl ? 16 : 0, gap = n > 12 ? 3 : 4;
    const w = (x1 - x0 - dia - gap * (n - 1)) / n; let s = '';
    ticks.forEach((t, i) => { const hh = t.s === 'cur' ? h + 3 : h;
      s += `<rect x="${(x0 + i * (w + gap)).toFixed(2)}" y="${y - (hh - h) / 2}" width="${w.toFixed(2)}" height="${hh}" rx="1.5" fill="${col(t)}" opacity="${op(t)}"/>`; });
    if (endEl) { const dx = x1 - 6, dy = y + h / 2;
      s += `<path d="M${dx} ${dy - 5}L${dx + 5} ${dy}L${dx} ${dy + 5}L${dx - 5} ${dy}Z" fill="${endOn ? GL : 'none'}" stroke="${endOn ? GL : G}" stroke-width="1"/>`; }
    return s;
  };
  const defs = `<defs>
    <linearGradient id="mkH" gradientUnits="userSpaceOnUse" x1="-18" y1="0" x2="394" y2="0">
      <stop offset="0" stop-color="${G}" stop-opacity=".1"/><stop offset=".22" stop-color="${G}"/><stop offset=".5" stop-color="${GL}"/><stop offset=".78" stop-color="${G}"/><stop offset="1" stop-color="${G}" stop-opacity=".1"/></linearGradient>
    <linearGradient id="mkV" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G}"/><stop offset="1" stop-color="${G}"/></linearGradient>
  </defs>`;

  if (opt === 'fan') {
    H = 176; const fy = 116, a = 178, b = 100, ai = 58, bi = 33;
    const n = ticks.length, a0 = 176, a1 = 4, span = a0 - a1, gapA = n > 30 ? .5 : n > 12 ? 1 : 1.6;
    const P = (A, B, deg) => { const r = deg * Math.PI / 180; return `${(cx + A * Math.cos(r)).toFixed(2)} ${(fy - B * Math.sin(r)).toFixed(2)}`; };
    const gA = n > 30 ? .5 : n > 12 ? 1.2 : 2.6;
    ticks.forEach((t, i) => {
      const d0 = a0 - span * i / n - (i ? gA / 2 : 0), d1 = a0 - span * (i + 1) / n + (i < n - 1 ? gA / 2 : 0), dm = (d0 + d1) / 2;
      const e = t.s === 'cur' ? 1.09 : 1, tip = n > 30 ? 1 : 1.06;
      const d = `M${P(ai, bi, d0)}L${P(a * e, b * e, d0)}L${P(a * e * tip, b * e * tip, dm)}L${P(a * e, b * e, d1)}L${P(ai, bi, d1)}Z`;
      if (t.s === 'cur') svg += `<path d="${d}" fill="${t.c}"/>`;
      else if (t.s === 'seen') svg += `<path d="${d}" fill="${t.c}" fill-opacity=".3" stroke="${t.c}" stroke-opacity=".85" stroke-width="1"/>`;
      else svg += `<path d="${d}" fill="${G}" fill-opacity=".03" stroke="${G}" stroke-opacity=".3" stroke-width="1"/>`;
    });
    // the hub: a fine double rim, the end of the hand as its heart
    const arc = (A, B) => `M${cx - A} ${fy}A${A} ${B} 0 0 1 ${cx + A} ${fy}`;
    svg += `<path d="${arc(ai - 5, bi - 3.5)}" fill="none" stroke="${G}" stroke-width="1" opacity=".8"/>`;
    svg += `<path d="${arc(ai - 10, bi - 7)}" fill="none" stroke="${G}" stroke-width="1" opacity=".4"/>`;
    const dy = fy - 11;
    svg += `<path d="M${cx} ${dy - 6}L${cx + 6} ${dy}L${cx} ${dy + 6}L${cx - 6} ${dy}Z" fill="${endOn ? GL : 'none'}" stroke="${endOn ? GL : G}" stroke-width="1"/>`;
    // the ground the fan stands on
    svg += `<path d="M-18 ${fy + 3.5}H394" stroke="url(#mkH)" stroke-width="1"/>`;
    bw = 172; bh = 40; bx = cx - bw / 2; by = fy + 10; wl = 51; wr = 325; wy = by + bh / 2;
  }
  if (opt === 'window') {
    H = 170; const y0 = 84, hh = 22, sh = 17;
    svg += tickRow(0, 7, 0, W);
    const line = (d, dir) => { const s = dir, Y = v => (y0 + s * (v + d)).toFixed(1);
      return `M-18 ${Y(sh)}H${100 - sh - 1}L100 ${Y(0)}L${100 + hh} ${Y(hh)}H${276 - hh}L276 ${Y(0)}L${276 + sh + 1} ${Y(sh)}H394`; };
    [[7, .95], [13, .6], [19, .38]].forEach(([d, o]) => { svg += `<path d="${line(d, -1)}" fill="none" stroke="url(#mkH)" stroke-width="1" opacity="${o}"/>`; });
    [[7, .95], [13, .6], [19, .42], [25, .3], [31, .22], [37, .15], [43, .1]].forEach(([d, o]) => { svg += `<path d="${line(d, 1)}" fill="none" stroke="url(#mkH)" stroke-width="1" opacity="${o}"/>`; });
    bw = 176; bh = 44; bx = 100; by = y0 - hh; wl = 44; wr = 332; wy = y0;
    clip = `clip-path:polygon(${hh / bw * 100}% 0,${100 - hh / bw * 100}% 0,100% 50%,${100 - hh / bw * 100}% 100%,${hh / bw * 100}% 100%,0 50%);`;
    leftHtml = left.replace(' to ', ' to<br>');
  }
  if (opt === 'pendant') {
    H = 160;
    svg += tickRow(0, 7, 0, W);
    bw = 200; bh = 40; bx = cx - bw / 2; by = 24; wl = 56; wr = 320; wy = 101;
    svg += `<path d="M-18 80.5H394" stroke="url(#mkH)" stroke-width="1"/>`;
    [[70, 56, 1], [54, 43, .62], [38, 30, .4]].forEach(([w, d, o]) => { svg += `<path d="M${cx - w} 80.5L${cx} ${80.5 + d}L${cx + w} 80.5" fill="none" stroke="${GL}" stroke-width="1" opacity="${o}"/>`; });
    [-18, -9, 0, 9, 18].forEach(x => { svg += `<path d="M${cx} 106L${cx + x} 80.5" stroke="${G}" stroke-width="1" opacity=".38"/>`; });
    svg += `<path d="M${cx} 140V150" stroke="${G}" stroke-width="1" opacity=".7"/><circle cx="${cx}" cy="153.5" r="1.7" fill="${G}"/>`;
  }
  if (opt === 'frame') {
    H = 126; const B = H - .5;
    svg += tickRow(0, 7, 0, W);
    svg += `<defs><linearGradient id="mkF" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="84"><stop offset="0" stop-color="${G}" stop-opacity="0"/><stop offset="1" stop-color="${G}"/></linearGradient></defs>`;
    svg += `<path d="M.5 20V${B}H375.5V20" fill="none" stroke="url(#mkF)" stroke-width="1" opacity=".75"/>`;
    svg += `<path d="M5.5 20V${B - 21}H21.5V${B - 5}H354.5V${B - 21}H370.5V20" fill="none" stroke="url(#mkF)" stroke-width="1" opacity=".5"/>`;
    svg += `<rect x=".5" y="${B - 11}" width="11" height="11" fill="#0e0c0a" stroke="${G}" stroke-width="1" opacity=".9"/><rect x="364.5" y="${B - 11}" width="11" height="11" fill="#0e0c0a" stroke="${G}" stroke-width="1" opacity=".9"/>`;
    bw = 176; bh = 40; bx = cx - bw / 2; by = 54; wl = 53; wr = 323; wy = by + bh / 2;
  }
  const foot = document.createElement('div'); foot.className = 'mk mk-' + opt;
  foot.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${defs}${svg}</svg>
    <div class="mk-btn" style="left:${u(bx)};top:${u(by)};width:${u(bw)};height:${u(bh)};background-image:${bg.replace(/"/g, "'")};${clip}">${label}</div>
    <div class="mk-w" style="left:${u(wl)};top:${u(wy)}">${leftHtml}</div>
    <div class="mk-w" style="left:${u(wr)};top:${u(wy)}">Menu</div>`;
  document.getElementById('controls-wrap').after(foot);
}

(async () => {
  const b = await chromium.launch();
  const sizes = { s: [360, 640], m: [412, 780], t: [412, 915] };
  const jobs = [];
  for (const v of which) { for (const z of (process.env.Q ? ['m'] : ['m', 's', 't'])) jobs.push([v, z, 'card']); for (const k of (process.env.Q ? ['long'] : ['start', 'end', 'long'])) jobs.push([v, 'm', k]); }
  for (const [v, z, k] of jobs) {
    const [w, h] = sizes[z];
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: DSF });
    const p = await ctx.newPage();
    await p.goto('http://localhost:8765/between-us.html'); await p.waitForTimeout(1400);
    const next = async (n) => { for (let i = 0; i < n; i++) { await p.click('#btn-next'); await p.waitForTimeout(1250); } };
    if (k === 'card') await next(3);
    if (k === 'long') { await p.click('#tokLine'); await p.waitForTimeout(1600); await p.click('#limitBtnsDrawer [data-limit="20"]'); await p.waitForTimeout(800); await p.click('#catGoBtn'); await p.waitForTimeout(1800); await next(7); }
    if (k === 'end') { await next(6); await p.waitForTimeout(2500); }
    if (v !== 'today') {
      await p.addStyleTag({ content: BASE });
      if (k === 'end') await p.evaluate(() => { document.getElementById('btn-next').textContent = 'Next hand'; });
      await p.evaluate(build, v);
      await p.evaluate(() => window.dispatchEvent(new Event('resize'))); await p.waitForTimeout(700);
    }
    await p.screenshot({ path: `${out}/${v}-${z}-${k}.png` });
    await ctx.close();
  }
  await b.close();
})();
