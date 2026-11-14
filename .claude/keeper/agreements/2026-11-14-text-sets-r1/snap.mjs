// The set, applied to the live page by rule. Runs inside the page. Returns what it changed, for counting.
export const SETS = {
  tight: { sizes: [12, 13, 15, 17, 19, 21], caps: [.1, .16, .24], sent: [.03], serifTrack: 0,
    tones: ['#f0e8d8', '#d2c9b8', '#b5a892', '#9c8f7e', '#8c8071'], gold: ['#e8c97a'], greenHint: 'neutral' },
  loose: { sizes: [12, 12.8, 13.6, 14.4, 15.2, 16.2, 17, 18.4, 19, 20.8], caps: [.09, .14, .16, .22, .26], sent: [.02, .05], serifTrack: 0,
    tones: ['#f0e8d8', '#e5ddce', '#c3bcaf', '#b3a590', '#ab9e8a', '#9c8f7e', '#8c8071'], gold: ['#e8c97a', '#c9a84c'], greenHint: '#7f968a' },
};
export const SNAP = (cfg) => {
  const parse = c => { let m = c.match(/-?[\d.]+(e-?\d+)?/g).map(Number); if (c.startsWith('color(')) m = [m[0] * 255, m[1] * 255, m[2] * 255, m[3] ?? 1]; return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
  const hex2 = h => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const hsl = c => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return { h, s: d }; };
  const BG = { r: 18, g: 16, b: 13 };
  const SKIP = '.title,#card-level,.card-level,.party-level,.cb-caption,.end-msg,.im-word,.wc-mark,.card-question,.party-question,.pick-opt-q,.cb-text,#cardBackText,svg *';
  const QUIET_FEDERO = '.tok-lbl,.tok-hint,.ch-desc,.cat-line,.menu-act,.play-save-meta,.play-save-now,.play-save-act button,.menu-foot button';
  const ceil = (arr, v) => arr.find(x => x >= v - .05) ?? arr[arr.length - 1];
  const near = (arr, v) => arr.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
  const log = [];
  const els = [...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName) && !el.matches(SKIP) && !el.closest('svg'));
  const plan = els.map(el => {
    const cs = getComputedStyle(el); const fam = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(); const fs = parseFloat(cs.fontSize);
    const txt = el.textContent.trim(); const symbol = /^[★☆✕✦←→·•◆▾▸⌄ⓘ+\-–—\s]+$/.test(txt);
    const p = { el, set: {} };
    if (symbol || fam === 'Bodoni Moda') return p;
    // face
    let face = fam; if (fam === 'Arial' || fam === 'system-ui' || (fam === 'Federo' && el.matches(QUIET_FEDERO))) { face = 'Jost'; p.set.fontFamily = "'Jost',sans-serif"; }
    // size
    const ns = ceil(cfg.sizes, fs); if (Math.abs(ns - fs) > .01) p.set.fontSize = ns + 'px';
    // tracking
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / fs; const upper = cs.textTransform === 'uppercase';
    let nl; if (face === 'Cormorant Garamond') nl = cfg.serifTrack; else if (face === 'Poiret One') nl = ls; else nl = upper ? near(cfg.caps, ls) : near(cfg.sent, ls);
    if (Math.abs(nl - ls) > .002 || p.set.fontSize) p.set.letterSpacing = nl + 'em';
    if (parseInt(cs.fontWeight) > 600) p.set.fontWeight = '500';
    // tone
    const c = parse(cs.color); if (c.a < .05) return p;
    if (el.closest('[disabled],[aria-disabled="true"],.btn-draw,.cat-go-btn')) return p;
    const eff = { r: c.r * c.a + BG.r * (1 - c.a), g: c.g * c.a + BG.g * (1 - c.a), b: c.b * c.a + BG.b * (1 - c.a) }; const k = hsl(eff), L = lum(eff);
    let to = null;
    if (k.s < .2 && k.h >= 18 && k.h <= 62) { to = [...cfg.tones].reverse().find(t => lum(hex2(t)) >= L - .004) ?? cfg.tones[0]; }               // creams and browns: never darker
    else if (k.s >= .3 && k.h >= 36 && k.h <= 52 && L > .2) { to = [...cfg.gold].reverse().find(t => lum(hex2(t)) >= L - .01) ?? cfg.gold[0]; }   // gold on text
    else if (k.s < .2 && k.h > 120 && k.h < 175) { to = L > .42 ? '#a9c7b6' : (cfg.greenHint === 'neutral' ? cfg.tones[cfg.tones.length - 2] : cfg.greenHint); } // the greens
    if (to) { const t = hex2(to); if (Math.abs(t.r - eff.r) + Math.abs(t.g - eff.g) + Math.abs(t.b - eff.b) > 3) p.set.color = to; }
    return p;
  });
  for (const p of plan) { for (const [k, v] of Object.entries(p.set)) p.el.style.setProperty(k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), v, 'important'); if (Object.keys(p.set).length) log.push(Object.keys(p.set).join(',')); }
  // the faint symbols: the close cross and the unstarred star become readable
  for (const el of document.querySelectorAll('.cat-close,.side-close,.drawer-close')) el.style.setProperty('color', cfg.tones[cfg.tones.length - 2], 'important');
  for (const el of document.querySelectorAll('#cardStar:not(.on):not(.starred),#partyStar:not(.on):not(.starred)')) { el.style.setProperty('color', cfg.tones[cfg.tones.length - 1], 'important'); el.style.setProperty('opacity', '1', 'important'); }
  return log.length;
};
