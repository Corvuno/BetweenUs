// Under the card, round 5 (#113). Owner after round 4: "don't only give me gold bar options…
// Gold bar is an option. Not the way." Settled and shared by all: Twist on the card (across
// from the star), Back as an undo after a draw, the coloured line on the card's bottom edge,
// the card's real proportions, Menu placed by what it holds (with the deck at the top, or
// with the hand at the count). Five different ways to draw and show, one a rethink.
const R3 = require('../2026-11-05-under-card-r3/variants.js');
const R4 = require('../2026-11-05-under-card-r4/variants.js');
const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt" aria-hidden="true"';
const I = {
  back:`<svg ${SV}><path d="M21 12H10"/><path d="M13 6 4 12l9 6z" fill="currentColor"/></svg>`,
  menu:`<svg ${SV}><path d="M4 7h16M4 12h11M4 17h6"/></svg>`,
  three:`<svg ${SV}><rect x="2" y="7" width="5.5" height="13"/><rect x="9.2" y="4" width="5.5" height="16"/><rect x="16.5" y="7" width="5.5" height="13"/></svg>`,
  spot:`<svg ${SV}><rect x="3" y="3" width="18" height="18"/><rect x="8" y="8" width="8" height="8"/></svg>`,
  twist:`<svg ${SV}><rect x="4" y="4" width="16" height="16"/><path d="M12 2 22 12 12 22 2 12z"/></svg>`,
};
const H = { three:'every draw offers three', spot:'the question takes the stage', twist:'same question, new angle' };
const GOLD = 'background:linear-gradient(135deg,#c9a84c,#a07830);color:var(--bg);font:400 .82rem Jost;letter-spacing:.18em;text-transform:uppercase;';
// pieces shared with rounds 3–4
const line = s => `<div class="mkline">${s.ticks.map(t=>`<i class="${t.state}" style="--c:${t.color}"></i>`).join('')}</div>`;
const twist = s => `<div class="mktw">${I.twist}Twist${s.hints?` <em>· ${H.twist}</em>`:''}</div>`;
const undo = `<div class="mkundo">${I.back}Back</div>`;
const countMenu = s => `<b class="mkct">${s.cur} / ${s.total}<span class="mi">${I.menu}</span></b><em class="h">${s.hints?'tap for played, favourites and more':''}</em>`;
const shared = `
  .mkline{position:absolute;left:0;right:0;bottom:0;height:4px;display:flex;gap:2px;z-index:4}
  .mkline i{flex:1;background:rgba(201,168,76,.10)}.mkline i.seen{background:var(--c);opacity:.5}.mkline i.current{background:var(--c)}
  .mkct{font:400 14px 'Poiret One';letter-spacing:.3em;color:var(--gold);white-space:nowrap;display:inline-flex;align-items:center;gap:12px;font-weight:400}
  .mkct .mi{display:inline-flex;color:var(--celadon)}.mkct .mi svg{width:16px;height:16px}
  .mktw{position:absolute;left:16px;bottom:14px;display:flex;align-items:center;gap:7px;color:var(--celadon);font:400 .62rem Federo;letter-spacing:.2em;text-transform:uppercase;z-index:5}
  .mktw svg{width:16px;height:16px}.mktw em{font:italic 400 .82rem 'Cormorant Garamond';letter-spacing:0;text-transform:none;color:var(--row-hint)}
  .mkundo{display:flex;align-items:center;gap:8px;color:var(--celadon-soft);font:400 .62rem Federo;letter-spacing:.2em;text-transform:uppercase;height:18px}.mkundo svg{width:14px;height:14px}
  .tok-lbl{display:inline-flex;align-items:center;gap:8px}
  .mkmi{display:inline-flex;width:15px;height:15px;color:var(--celadon)}.mkmi svg{width:15px;height:15px}
  .mk em.h{font:italic 400 .88rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em;text-align:center}`;
const V = {};

// S · The gold bar (round 3 M) with Menu in the count (round 4 Q). One gold object holds
// everything you play with: Spotlight | Next card | Three.
V.S = s => { const v = R4.Q(s); return v; };

// T · A column in the order you use it (round 3 L), Menu with the deck (round 4 P).
// Gold Next card; right under it how you draw (One card | Three, stays as set); Spotlight.
V.T = s => { const v = R3.L(s); return { ...v, page:'', pre: R4.P(s).pre, css: v.css + R4.P(s).css.replace(R3.M(s).css,'') }; };

// U · Split by what it acts on. Everything that acts on this card sits on the card: star,
// Twist and Spotlight. Under the card only drawing is left: the gold Next card with its
// way of drawing beside it: Back on its left, Three on its right. Menu in the count.
V.U = s => ({
  css: shared + `
  .mksp{position:absolute;right:56px;bottom:14px;display:flex;align-items:center;gap:7px;color:var(--celadon);font:400 .62rem Federo;letter-spacing:.2em;text-transform:uppercase;z-index:5}
  .mksp svg{width:16px;height:16px}.mksp em{font:italic 400 .82rem 'Cormorant Garamond';letter-spacing:0;text-transform:none;color:var(--row-hint)}
  #card .mktw em,#card .mksp em{display:none}
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:10px}
  .mk .row{display:grid;grid-template-columns:72px 1fr 72px;align-items:center;gap:12px;width:100%}
  .mk .go{height:58px;display:grid;place-items:center;${GOLD}}
  .mk .th{display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--celadon);font:400 .58rem Federo;letter-spacing:.2em;text-transform:uppercase}
  .mk .th svg{width:22px;height:22px}.mk .th.on{color:var(--gold-l)}
  .mk .hrow{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:20px}`,
  html:`<div class="mk"><span class="mkundo"></span>${countMenu(s)}<div class="row"><div class="th">${I.back}Back</div><div class="go">Next card</div><div class="th">${I.three}Three</div></div>
  <div class="hrow"><em class="h">${s.hints?'Twist and Spotlight are on the card':''}</em><em class="h">${s.hints?H.three:''}</em></div></div>`,
  card: line(s) + twist(s) + `<div class="mksp">${I.spot}Spotlight</div>`
});

// V · Set in type. No filled button: the controls are engraved lettering, like the title
// card of a programme. NEXT CARD in large gold capitals between two solid gold rules with
// stepped ends; Spotlight and Three as smaller words on the same line either side. Menu
// with the deck.
V.V = s => ({
  css: shared + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:10px}
  .mk .row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;width:100%}
  .mk .side{display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--celadon);font:400 .64rem Federo;letter-spacing:.24em;text-transform:uppercase}
  .mk .side svg{width:18px;height:18px}
  .mk .nx{position:relative;padding:16px 6px;font:400 1.15rem 'Poiret One';letter-spacing:.32em;color:var(--gold-l);text-transform:uppercase;white-space:nowrap}
  .mk .nx::before,.mk .nx::after{content:'';position:absolute;left:0;right:0;height:5px;border:solid var(--gold);border-width:2px 0 1px}
  .mk .nx::before{top:0}.mk .nx::after{bottom:0;border-width:1px 0 2px}
  .mk .hrow{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:20px}`,
  html:`<div class="mk">${undo}<b class="mkct">${s.cur} / ${s.total}</b>
  <div class="row"><div class="side">${I.spot}Spotlight</div><div class="nx">Next card</div><div class="side">${I.three}Three</div></div>
  <div class="hrow"><em class="h">${s.hints?H.spot:''}</em><em class="h">${s.hints?H.three:''}</em></div></div>`,
  card: line(s) + twist(s),
  pre: R4.P(s).pre
});

// W · Rethink: the ribbon. A deck box has a ribbon to pull the cards out; here a gold
// ribbon hangs from the middle of the card's bottom edge, with the count on it. Pull it
// down, or tap it, to draw the next card; it springs back. Spotlight and Three sit on the
// card's edge either side of where the ribbon hangs. No button under the card at all:
// used differently (pull), looks different, made of the deck's own gold. Menu with the deck.
V.W = s => ({
  css: shared + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;margin-top:-6px;position:relative}
  .mk .rib{width:64px;height:150px;${GOLD}clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - 22px),0 100%);
    display:flex;flex-direction:column;align-items:center;padding-top:22px;gap:12px}
  .mk .rib b{font:400 16px 'Jost';letter-spacing:.08em;color:#1a140c;font-weight:400;writing-mode:horizontal-tb}
  .mk .rib i{display:block;width:30px;height:1px;background:rgba(14,12,10,.4)}
  .mk .rib span{font:400 .6rem Jost;letter-spacing:.22em;color:#1a140c}
  .mk .side{position:absolute;top:22px;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--celadon);font:400 .64rem Federo;letter-spacing:.24em;text-transform:uppercase}
  .mk .side svg{width:18px;height:18px}.mk .side.l{right:calc(50% + 62px)}.mk .side.r{left:calc(50% + 62px)}
  .mk .side em{font:italic 400 .84rem/1.1 'Cormorant Garamond';letter-spacing:0;text-transform:none;color:var(--row-hint);min-height:2.2em;width:120px;text-align:center}
  .mk .tip{font:italic 400 .9rem 'Cormorant Garamond';color:var(--row-hint);min-height:1.2em;margin-top:10px}`,
  html:`<div class="mk"><div class="side l">${I.spot}Spotlight<em>${s.hints?H.spot:''}</em></div>
  <div class="rib"><b>${s.cur}/${s.total}</b><i></i><span>PULL</span></div>
  <div class="side r">${I.three}Three<em>${s.hints?H.three:''}</em></div>
  <div class="tip">${s.hints?'pull the ribbon, or tap it, for the next card':''}</div>${undo}</div>`,
  card: line(s) + twist(s),
  pre: R4.P(s).pre
});

if (typeof module !== 'undefined') module.exports = V;
