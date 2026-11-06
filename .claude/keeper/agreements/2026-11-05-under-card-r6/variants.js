// Under the card, round 6 (#113). Brief agreed in critique.md: draw the controls in the app's own
// Art Deco vocabulary (the logo's stepped hairlines, the start card's nested frame, one centre axis),
// not as stock interface parts; show only what the moment needs, with no empty spots and symmetry kept;
// fewer type voices (Poiret One for count and action, Federo for small labels, italic only for hints);
// every place and word argued. Four designs, each on its own idea; the fourth is a rethink.
// Situational slots, shared logic (each design draws them its own way):
//   start card: left = Ways to play (what a first-timer needs before the first draw), right = Menu
//   a card:     left = Spotlight, right = Menu
//   end of hand: left = Change, right = Save (as today's end-of-hand row)
// Three and Twist are not in this area in any design (owner: "somewhere not that space").
// Back has no button (owner: "remove it, might not miss it"); swiping back stays.
const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter" stroke-linecap="butt" aria-hidden="true"';
const G = {
  spot:`<svg ${SV}><rect x="3" y="3" width="18" height="18"/><rect x="8" y="8" width="8" height="8"/></svg>`,
  menu:`<svg ${SV}><path d="M4 7h16M4 12h11M4 17h6"/></svg>`,
  ways:`<svg ${SV}><rect x="3" y="5" width="9" height="14"/><rect x="12" y="5" width="9" height="14"/><path d="M6 9h3M15 9h3"/></svg>`,
  change:`<svg ${SV}><path d="M3 18A9 9 0 0 1 21 18"/><path d="M6.5 18A5.5 5.5 0 0 1 17.5 18" opacity=".55"/><path d="M3 21H21"/><path d="M12 18 16.5 9.5"/></svg>`,
  save:`<svg ${SV}><path d="M6 4 12 10 18 4M6 9 12 15 18 9"/><path d="M4 20H20"/></svg>`,
};
// what the two side slots hold at this moment, with a hint that says what it does there
const slots = s => s.state === 'start'
  ? [{ g:G.ways, w:'Ways to play', h:'how to play it' }, { g:G.menu, w:'Menu', h:'deck, played, favourites' }]
  : s.state === 'end'
  ? [{ g:G.change, w:'Change', h:'which questions come next' }, { g:G.save, w:'Save', h:'keep this evening' }]
  : [{ g:G.spot, w:'Spotlight', h:'the question fills the screen' }, { g:G.menu, w:'Menu', h:'deck, played, favourites' }];
const action = s => s.label;   // the app's own words, unchanged
const count = s => `${s.cur} / ${s.total}`;
const base = `
  .k6{width:100%;display:flex;flex-direction:column;align-items:center}
  .k6 .lbl{font:400 .7rem 'Federo';letter-spacing:.2em;text-transform:uppercase;color:var(--celadon)}
  .k6 .hint{font:italic 400 .92rem/1.15 'Cormorant Garamond';color:#8a9d92;min-height:1.1em;text-align:center}
  .k6 svg{width:22px;height:22px;color:var(--celadon)}
  .k6 .num{font:400 15px 'Poiret One';letter-spacing:.3em;color:var(--gold);font-weight:400}`;
const V = {};

// A · The mirror. The screen gets two bookends: the logo's ornament at the top, the same ornament
// mirrored at the bottom. The bottom ornament keeps the logo's geometry (one long line that fades
// outward, the stepped half-strength pairs, the short outer frame lines), with the count where the
// logo has its centre. Under its centre, the action in the logo's letter, as large as the tagline is
// small. The two side slots sit at the ornament's two ends, where its lines come from.
V.A = s => { const [L, R] = slots(s); return {
  css: base + `
  .k6{gap:6px;margin-top:14px}
  .k6 .orn{position:relative;width:100%;height:34px}
  .k6 .orn svg.o{position:absolute;inset:0;width:100%;height:100%;color:var(--gold)}
  .k6 .orn .num{position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);padding:0 6px;background:var(--bg)}
  .k6 .act{font:400 1.45rem 'Poiret One';letter-spacing:.24em;color:var(--gold-l);text-transform:uppercase;padding:12px 26px 6px;text-align:center}
  .k6 .row{display:grid;grid-template-columns:1fr 1fr;width:100%;margin-top:-100px;margin-bottom:48px;pointer-events:none}
  .k6 .end{display:flex;flex-direction:column;gap:5px;align-items:center;width:92px}.k6 .end .lbl{white-space:nowrap}
  .k6 .end.r{justify-self:end}.k6 .end svg{width:20px;height:20px}
  .k6 .hrow{display:grid;grid-template-columns:1fr 1fr;width:100%;margin-top:-40px}
  .k6 .hrow .hint{width:110px}.k6 .hrow .hint:last-child{justify-self:end}`,
  html:`<div class="k6"><div class="orn"><svg class="o" viewBox="0 0 376 34" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1">
  <defs><linearGradient id="k6l" x1="0" x2="1"><stop offset="0" stop-color="#c9a84c" stop-opacity="0"/><stop offset="1" stop-color="#c9a84c" stop-opacity=".7"/></linearGradient>
  <linearGradient id="k6r" x1="1" x2="0"><stop offset="0" stop-color="#c9a84c" stop-opacity="0"/><stop offset="1" stop-color="#c9a84c" stop-opacity=".7"/></linearGradient></defs>
  <path d="M96 17H148" stroke="url(#k6l)"/><path d="M228 17H280" stroke="url(#k6r)"/>
  <path d="M118 2H150M226 2H258M118 32H150M226 32H258"/>
  <path d="M104 9H146M230 9H272M104 25H146M230 25H272" opacity=".5"/></svg><span class="num">${count(s)}</span></div>
  <div class="act">${action(s)}</div>
  <div class="row"><div class="end">${L.g}<span class="lbl">${L.w}</span></div><div class="end r">${R.g}<span class="lbl">${R.w}</span></div></div>
  <div class="hrow"><span class="hint">${s.hints?L.h:''}</span><span class="hint">${s.hints?R.h:''}</span></div></div>`
}; };

// B · The frame. The start card's own nested frame (a frame inside a frame, the outer at 55% gold,
// the inner at 28%) becomes the action: one framed plate, centred, narrower than the card, with the
// action in the logo's letter inside it. The count is set into the top edge of the outer frame, like a
// plate number. The two side slots stand outside the frame at its middle, left and right, as glyphs
// with their word under them, no outline of their own.
V.B = s => { const [L, R] = slots(s); return {
  css: base + `
  .k6{margin-top:22px}
  .k6 .stage{display:grid;grid-template-columns:1fr 216px 1fr;align-items:center;width:100%}
  .k6 .plate{position:relative;height:84px;border:1px solid rgba(201,168,76,.55);display:grid;place-items:center}
  .k6 .plate::after{content:'';position:absolute;inset:5px;border:1px solid rgba(201,168,76,.28)}
  .k6 .plate .num{position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:var(--bg);padding:0 10px;font-size:14px;line-height:16px}
  .k6 .plate .act{font:400 1.2rem 'Poiret One';letter-spacing:.24em;color:var(--gold-l);text-transform:uppercase;white-space:nowrap}
  .k6 .side{display:flex;flex-direction:column;align-items:center;gap:6px}
  .k6 .hrow{display:grid;grid-template-columns:1fr 216px 1fr;width:100%;margin-top:10px}`,
  html:`<div class="k6"><div class="stage"><div class="side">${L.g}<span class="lbl">${L.w}</span></div>
  <div class="plate"><span class="num">${count(s)}</span><span class="act">${action(s)}</span></div>
  <div class="side">${R.g}<span class="lbl">${R.w}</span></div></div>
  <div class="hrow"><span class="hint">${s.hints?L.h:''}</span><span></span><span class="hint">${s.hints?R.h:''}</span></div></div>`
}; };

// C · The steps. Deco's stepped skyline as the structure: three tiers of hairline, narrowest on top.
// The top tier holds the count; the broad bottom tier is the gold action, the one filled shape, with
// stepped shoulders; the side slots stand on the middle tier's two treads, left and right, so the
// whole group reads as one building rising to the count.
V.C = s => { const [L, R] = slots(s); return {
  css: base + `
  .k6{margin-top:16px;position:relative}
  .k6 .t1{width:128px;height:34px;border:1px solid var(--border-strong);border-bottom:none;display:grid;place-items:center}
  .k6 .t2{width:300px;height:58px;border:1px solid var(--border-strong);border-bottom:none;display:grid;grid-template-columns:1fr 1fr;align-items:center}
  .k6 .t2 .side{display:flex;flex-direction:column;align-items:center;gap:5px}
  .k6 .t3{width:100%;height:58px;display:grid;place-items:center;font:400 .86rem 'Jost';letter-spacing:.2em;text-transform:uppercase;color:#14100a;
    background:linear-gradient(180deg,#d4b45c,#a8823a);clip-path:polygon(0 12px,38px 12px,38px 0,calc(100% - 38px) 0,calc(100% - 38px) 12px,100% 12px,100% 100%,0 100%)}
  .k6 .hrow{display:grid;grid-template-columns:1fr 1fr;width:300px;margin-top:10px}`,
  html:`<div class="k6"><div class="t1"><span class="num">${count(s)}</span></div>
  <div class="t2"><div class="side">${L.g}<span class="lbl">${L.w}</span></div><div class="side">${R.g}<span class="lbl">${R.w}</span></div></div>
  <div class="t3">${action(s)}</div>
  <div class="hrow"><span class="hint">${s.hints?L.h:''}</span><span class="hint">${s.hints?R.h:''}</span></div></div>`
}; };

// D · Rethink: turn it to show it. Spotlight stops being a button: turning the phone on its side puts
// the question on stage, turning it back brings you home (the phone already knows its tilt; Spotlight
// already lies sideways for the table). Menu moves into Selected deck at the top, the door that
// already opens The Deck. So under the card there is only the hand: the count, and the action written
// along one long gold hairline that spans the card's width, like a signature line. Nothing else; the
// card stands alone. At the end of a hand the line carries Change and Save at its two ends.
V.D = s => { const end = s.state === 'end'; const [L, R] = slots(s); return {
  css: base + `
  .k6{margin-top:20px;gap:14px}
  .k6 .line{position:relative;width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--gold) 18%,var(--gold) 82%,transparent)}
  .k6 .act{font:400 1.3rem 'Poiret One';letter-spacing:.28em;color:var(--gold-l);text-transform:uppercase;margin-top:-4px}
  .k6 .ends{display:grid;grid-template-columns:1fr 1fr;width:100%}
  .k6 .ends .side{display:flex;align-items:center;gap:8px}.k6 .ends .side.r{justify-self:end}
  .k6 .turn{display:flex;align-items:center;gap:10px;color:var(--row-hint);font:italic 400 .9rem 'Cormorant Garamond';min-height:1.3em}
  .k6 .turn svg{width:18px;height:18px;color:var(--row-hint)}
  .tok-lbl{display:inline-flex;align-items:center;gap:8px}.k6mi{display:inline-flex;color:var(--celadon)}.k6mi svg{width:15px;height:15px}`,
  html:`<div class="k6"><span class="num">${count(s)}</span><div class="line"></div><div class="act">${action(s)}</div>
  ${end ? `<div class="ends"><div class="side">${L.g}<span class="lbl">${L.w}</span></div><div class="side r"><span class="lbl">${R.w}</span>${R.g}</div></div>` : ''}
  <div class="turn">${s.hints && !end ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="3" width="8" height="14"/><path d="M4 20c3 2 13 2 16-2M17 15l3 3 1-4"/></svg>turn the phone on its side to put the question on stage` : ''}</div></div>`,
  pre: `() => { const l = document.querySelector('.tok-lbl'); if (l) l.insertAdjacentHTML('afterbegin', ${JSON.stringify('<span class="k6mi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h11M4 17h6"/></svg></span>')}); const h = document.getElementById('tokHint'); if (h) h.textContent = ' · deck, played, favourites'; }`
}; };

if (typeof module !== 'undefined') module.exports = V;
