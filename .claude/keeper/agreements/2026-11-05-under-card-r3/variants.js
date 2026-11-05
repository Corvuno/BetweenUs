// Under the card, round 3 (#113). Built from functions.md and the owner's answers:
// one person often taps for others (car, rave line, a date over WhatsApp), the phone is
// shown to the table or in the dark (Spotlight), Back is only a mis-tap fix, Three is set
// and left. So every option sorts the parts by what they are:
//   Draw = the turn; Three = how you draw (with Draw); Twist = acts on the card (on the
//   card, with the star); Spotlight = how the card is shown; Back = an undo after a draw;
//   Menu = leaving the game (top, with Selected deck); count = on the card's edge.
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
const cardLine = s => `<div class="mkline">${s.ticks.map(t=>`<i class="${t.state}" style="--c:${t.color}"></i>`).join('')}</div>`;
// Shared by every option: the line on the card's edge, Twist on the card (bottom left,
// opposite the star), Menu top right beside the logo, and Back as an undo under the card
// that shows for a few seconds after each draw (shown here as it looks just after drawing).
const shared = `
  .mkline{position:absolute;left:0;right:0;bottom:0;height:4px;display:flex;gap:2px;z-index:4}
  .mkline i{flex:1;background:rgba(201,168,76,.10)}.mkline i.seen{background:var(--c);opacity:.5}.mkline i.current{background:var(--c)}
  .mkct{font:400 14px 'Poiret One';letter-spacing:.3em;color:var(--gold);white-space:nowrap}
  .mktw{position:absolute;left:16px;bottom:14px;display:flex;align-items:center;gap:7px;color:var(--celadon);font:400 .62rem Federo;letter-spacing:.2em;text-transform:uppercase;z-index:5}
  .mktw svg{width:16px;height:16px}.mktw em{font:italic 400 .82rem 'Cormorant Garamond';letter-spacing:0;text-transform:none;color:var(--row-hint)}
  .mkmenu{position:absolute;top:26px;right:18px;width:44px;height:44px;display:grid;place-items:center;color:var(--celadon);z-index:20}.mkmenu svg{width:22px;height:22px}
  .mkundo{display:flex;align-items:center;gap:8px;color:var(--celadon-soft);font:400 .62rem Federo;letter-spacing:.2em;text-transform:uppercase;height:18px}
  .mkundo svg{width:14px;height:14px}
  .mk em.h{font:italic 400 .9rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em;text-align:center}`;
const twistOnCard = s => `<div class="mktw">${I.twist}Twist${s.hints?` <em>· ${H.twist}</em>`:''}</div>`;
const menuTop = `<div class="mkmenu">${I.menu}</div>`;
const undo = `<div class="mkundo">${I.back}Back</div>`;
const V = {};

// L · Sorted by function. Under the card only what you use each turn: the count, the gold
// Draw with its way of drawing right under it (one card or three, a switch that stays as
// you set it), and Spotlight. Back is an undo that shows briefly after each draw.
V.L = s => ({
  css: shared + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:10px}
  .mk .go{width:78%;height:56px;display:grid;place-items:center;${GOLD}}
  .mk .sw{display:flex;align-items:center;gap:14px;font:400 .66rem Federo;letter-spacing:.22em;text-transform:uppercase;color:var(--celadon-soft);margin-top:-4px}
  .mk .sw span{display:flex;align-items:center;gap:7px;padding-bottom:4px}.mk .sw svg{width:14px;height:14px}
  .mk .sw .on{color:var(--celadon);border-bottom:1px solid var(--celadon)}
  .mk .sw i{width:1px;height:14px;background:var(--border)}
  .mk .sp{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--celadon);margin-top:10px}
  .mk .sp span{display:flex;align-items:center;gap:11px;font:400 .86rem Federo;letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:20px;height:20px}`,
  html:`<div class="mk">${undo}<b class="mkct">${s.cur} / ${s.total}</b><div class="go">Next card</div>
  <div class="sw"><span class="on">One card</span><i></i><span>${I.three}Three</span></div><em class="h">${s.hints?H.three:''}</em>
  <div class="sp"><span>${I.spot}Spotlight</span><em class="h">${s.hints?H.spot:''}</em></div></div>`,
  card: cardLine(s) + twistOnCard(s), page: menuTop
});

// M · One gold control. Everything that plays the game is one object: the gold bar holds
// Next card in the middle, Spotlight at its left end and Three at its right end, each a
// square cut into the bar. One thing to find in the dark, held by whoever reads for the
// others. Three's end stays pressed in while it is on.
V.M = s => ({
  css: shared + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:10px}
  .mk .bar{display:flex;width:100%;height:58px;${GOLD}}
  .mk .bar > div{display:grid;place-items:center}
  .mk .bar .end{width:62px;color:var(--bg)}.mk .bar .end svg{width:22px;height:22px}
  .mk .bar .end.l{border-right:1px solid rgba(14,12,10,.35)}.mk .bar .end.r{border-left:1px solid rgba(14,12,10,.35)}
  .mk .bar .mid{flex:1}
  .mk .lbl{display:flex;width:100%;justify-content:space-between;font:400 .58rem Federo;letter-spacing:.2em;text-transform:uppercase;color:var(--celadon);margin-top:-6px}
  .mk .lbl span{width:62px;text-align:center;display:flex;flex-direction:column;gap:3px;align-items:center}
  .mk .lbl em{min-height:2.2em;font:italic 400 .82rem/1.1 'Cormorant Garamond';letter-spacing:0;text-transform:none;color:var(--row-hint);width:110px}
  .mk .lbl span:last-child em{margin-right:48px}.mk .lbl span:first-child em{margin-left:48px}`,
  html:`<div class="mk">${undo}<b class="mkct">${s.cur} / ${s.total}</b>
  <div class="bar"><div class="end l">${I.spot}</div><div class="mid">Next card</div><div class="end r">${I.three}</div></div>
  <div class="lbl"><span>Spotlight<em>${s.hints?H.spot:''}</em></span><span>Three<em>${s.hints?H.three:''}</em></span></div></div>`,
  card: cardLine(s) + twistOnCard(s), page: menuTop
});

// N · Rethink: the card is the controller. No buttons under the card. The card grows to
// fill the tall screen and is the only thing you touch: tap it to draw, hold it and it
// takes the stage (Spotlight), swipe right to go back. Twist and the star are on it, the
// coloured line is its bottom edge, the count sits under it. Three is set in The Deck,
// where you choose how the evening draws. Hints are engraved into the card's foot on the
// first visit, so they cost no space.
V.N = s => ({
  css: shared + `
  #card{min-height:calc(100dvh - 330px) !important}
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:8px}
  .mkfoot{position:absolute;left:0;right:0;bottom:44px;display:flex;flex-direction:column;align-items:center;gap:8px;z-index:5;color:var(--celadon-soft)}
  .mkfoot span{display:flex;align-items:center;gap:10px;font:400 .62rem Federo;letter-spacing:.24em;text-transform:uppercase}
  .mkfoot i{width:24px;height:1px;background:var(--border-strong)}
  .mkfoot em{font:italic 400 .9rem 'Cormorant Garamond';color:var(--row-hint)}`,
  html:`<div class="mk"><b class="mkct">${s.cur} / ${s.total}</b></div>`,
  card: cardLine(s) + twistOnCard(s) + (s.hints ? `<div class="mkfoot"><span><i></i>Tap to draw · Hold for Spotlight<i></i></span><em>swipe right to go back</em></div>` : ''),
  page: menuTop
});

if (typeof module !== 'undefined') module.exports = V;
