// Under the card, round 2 (#113). Owner's round-1 verdict: centre and balance; D's thumb idea
// and F's character are the leads, F too heavy; keep the coloured line; no small diamonds
// (After Dark's); no outline around a single control; hints must never break the layout;
// one real rethink. Same harness as round 1 (build.mjs injects into the live app).
const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt" aria-hidden="true"';
const I = {
  back:`<svg ${SV}><path d="M21 12H10"/><path d="M13 6 4 12l9 6z" fill="currentColor"/></svg>`,
  menu:`<svg ${SV}><path d="M4 7h16M4 12h11M4 17h6"/></svg>`,
  three:`<svg ${SV}><rect x="2" y="7" width="5.5" height="13"/><rect x="9.2" y="4" width="5.5" height="16"/><rect x="16.5" y="7" width="5.5" height="13"/></svg>`,
  spot:`<svg ${SV}><rect x="3" y="3" width="18" height="18"/><rect x="8" y="8" width="8" height="8"/></svg>`,
  twist:`<svg ${SV}><rect x="4" y="4" width="16" height="16"/><path d="M12 2 22 12 12 22 2 12z"/></svg>`,
};
const H = { three:'pick one of three', spot:'the question takes the stage', twist:'same question, new angle', back:'the card before', menu:'deck, played, favourites' };
const GOLD = 'background:linear-gradient(135deg,#c9a84c,#a07830);color:var(--bg);font:400 .82rem Jost;letter-spacing:.18em;text-transform:uppercase;';
// The coloured line, laid along the card's bottom edge (round 1 B's idea), one segment per card.
const cardLine = s => `<div class="mkline">${s.ticks.map(t=>`<i class="${t.state}" style="--c:${t.color}"></i>`).join('')}</div>`;
const lineCss = `
  .mkline{position:absolute;left:0;right:0;bottom:0;height:4px;display:flex;gap:2px;z-index:4}
  .mkline i{flex:1;background:rgba(201,168,76,.10)}.mkline i.seen{background:var(--c);opacity:.5}.mkline i.current{background:var(--c)}`;
const count = s => `<b class="mkct">${s.cur} / ${s.total}</b>`;
const countCss = `.mkct{font:400 14px 'Poiret One';letter-spacing:.3em;color:var(--gold);font-weight:400;white-space:nowrap}`;
const V = {};

// G · Spotlight's own layout, brought to the main screen. Spotlight is already the layout you
// liked (Back and Next in the bottom corners, gold in the middle, small items at the top).
// Here: right under the card Three · count · Twist, like Spotlight's top row; Spotlight
// centred under them; at the bottom of the screen Back and Menu in the corners and the gold
// Next card between them, under the thumb. One centre column: count, Spotlight, Next.
V.G = s => ({
  css: lineCss + countCss + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:22px;margin-top:6px}
  .mk .top{display:grid;grid-template-columns:1fr auto 1fr;align-items:start;width:100%}
  .mk .it{display:flex;flex-direction:column;gap:4px;color:var(--celadon)}
  .mk .it span{display:flex;align-items:center;gap:8px;font:400 .66rem Federo;letter-spacing:.22em;text-transform:uppercase}
  .mk .it svg{width:16px;height:16px}.mk .it.l{align-items:flex-start;padding-left:4px}.mk .it.r{align-items:flex-end;padding-right:4px}
  .mk em{font:italic 400 .9rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em}
  .mk .sp{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--celadon)}
  .mk .sp span{display:flex;align-items:center;gap:11px;font:400 .86rem Federo;letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:20px;height:20px}
  .mkbar{position:fixed;left:0;right:0;bottom:0;padding:0 18px 26px;display:grid;grid-template-columns:56px 1fr 56px;align-items:center;gap:14px;z-index:20}
  .mkbar .ic{height:54px;display:grid;place-items:center;color:var(--celadon)}.mkbar .ic svg{width:22px;height:22px}
  .mkbar .go{height:54px;display:grid;place-items:center;${GOLD}}`,
  html:`<div class="mk"><div class="top"><div class="it l"><span>${I.three}Three</span><em>${s.hints?H.three:''}</em></div>${count(s)}<div class="it r"><span>Twist${I.twist}</span><em>${s.hints?H.twist:''}</em></div></div>
  <div class="sp"><span>${I.spot}Spotlight</span><em>${s.hints?H.spot:''}</em></div></div>
  <div class="mkbar"><div class="ic">${I.back}</div><div class="go">Next card</div><div class="ic">${I.menu}</div></div>`,
  card: cardLine(s)
});

// H · F, lighter. F's symmetry and its stepped gold Next stay; everything heavy goes. No
// plaque, no diamond buttons, no brackets around Spotlight (corner lines belong to the card).
// Back and Menu are bare icons either side of Next. Spotlight sits centred under Next, with
// Three and Twist as its two wings on the line below. The coloured line runs along the card.
V.H = s => ({
  css: lineCss + countCss + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:18px;margin-top:4px}
  .mk .row{display:grid;grid-template-columns:56px 1fr 56px;align-items:center;gap:10px;width:100%}
  .mk .ic{height:54px;display:grid;place-items:center;color:var(--celadon)}.mk .ic svg{width:22px;height:22px}
  .mk .go{height:54px;display:grid;place-items:center;${GOLD}
    clip-path:polygon(10px 0,calc(100% - 10px) 0,calc(100% - 10px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 10px) calc(100% - 8px),calc(100% - 10px) 100%,10px 100%,10px calc(100% - 8px),0 calc(100% - 8px),0 8px,10px 8px)}
  .mk .sp{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--celadon)}
  .mk .sp span{display:flex;align-items:center;gap:11px;font:400 .84rem Federo;letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:19px;height:19px}
  .mk .wings{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:-4px}
  .mk .w{display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--celadon-soft)}
  .mk .w span{display:flex;align-items:center;gap:7px;font:400 .64rem Federo;letter-spacing:.22em;text-transform:uppercase}.mk .w svg{width:14px;height:14px}
  .mk em{font:italic 400 .88rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em;text-align:center}`,
  html:`<div class="mk">${count(s)}<div class="row"><div class="ic">${I.back}</div><div class="go">Next card</div><div class="ic">${I.menu}</div></div>
  <div class="sp"><span>${I.spot}Spotlight</span><em>${s.hints?H.spot:''}</em></div>
  <div class="wings"><div class="w"><span>${I.three}Three</span><em>${s.hints?H.three:''}</em></div><div class="w"><span>${I.twist}Twist</span><em>${s.hints?H.twist:''}</em></div></div></div>`,
  card: cardLine(s)
});

// I · D, made hint-proof. The bar stays under the thumb, in pairs around the gold centre:
// Back and Menu outside, Three and Twist inside, Next card in the middle. Every label has
// room for two lines all the time, so a hint only fills space that is already there and
// nothing moves. Spotlight leaves the bar and stands alone under the card with the count,
// close to the question it puts on stage.
V.I = s => ({
  css: lineCss + countCss + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:16px;margin-top:10px}
  .mk .sp{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--celadon)}
  .mk .sp span{display:flex;align-items:center;gap:11px;font:400 .86rem Federo;letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:20px;height:20px}
  .mk em{font:italic 400 .9rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em}
  .mkbar{position:fixed;left:0;right:0;bottom:0;padding:14px 12px 22px;border-top:1px solid var(--dim);background:var(--bg);display:grid;grid-template-columns:1fr 1fr 112px 1fr 1fr;column-gap:8px;align-items:start;z-index:20}
  .mkbar .s{display:flex;flex-direction:column;align-items:center;gap:7px;color:var(--celadon);text-align:center}
  .mkbar .s svg{width:21px;height:21px}
  .mkbar .s b{font:400 .56rem Federo;letter-spacing:.16em;text-transform:uppercase;font-weight:400;min-height:2.3em;line-height:1.15;max-width:70px}
  .mkbar .s b i{display:block;font:italic 400 .8rem 'Cormorant Garamond';letter-spacing:0;text-transform:none;color:var(--row-hint)}
  .mkbar .go{height:52px;display:grid;place-items:center;${GOLD}font-size:.74rem;letter-spacing:.14em;margin-top:-2px}`,
  html:`<div class="mk">${count(s)}<div class="sp"><span>${I.spot}Spotlight</span><em>${s.hints?H.spot:''}</em></div></div>
  <div class="mkbar">${[['back','Back'],['three','Three']].map(([k,l])=>`<div class="s">${I[k]}<b>${l}${s.hints&&k==='three'?`<i>${H.three}</i>`:''}</b></div>`).join('')}
  <div class="go">Next card</div>
  ${[['twist','Twist'],['menu','Menu']].map(([k,l])=>`<div class="s">${I[k]}<b>${l}${s.hints&&k==='twist'?`<i>${H.twist}</i>`:''}</b></div>`).join('')}</div>`,
  card: cardLine(s)
});

// J · Rethink: the deck in your hand. No row of controls. Under the card lies the rest of the
// hand as a real stack, edge on edge, the way a deck looks on a table: one edge for every
// card still to come (blank, so nothing about them shows), at most eight, with the number
// left on the front edge. Tap the stack to draw. The coloured line stays on the card. Spotlight is centred under the stack;
// Back and Menu sit in the bottom corners of the screen; Three and Twist go into the menu.
V.J = s => {
  const left = Math.max(0, +s.total - +s.cur), n = Math.min(left, 8);
  return {
  css: lineCss + countCss + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;margin-top:-12px}
  .mk .stack{position:relative;width:100%;height:${n*10+58}px}
  .mk .edge{position:absolute;left:var(--x);right:var(--x);top:var(--y);height:14px;background:color-mix(in srgb,var(--card-bg) 80%,var(--bg));border:1px solid var(--border-strong);border-top:none}
  .mk .front{position:absolute;left:var(--x);right:var(--x);top:var(--y);height:46px;background:var(--card-bg);border:1px solid var(--border-strong);border-top:none;
    display:flex;align-items:center;justify-content:center;gap:14px;color:var(--gold-l);font:400 .78rem Jost;letter-spacing:.2em;text-transform:uppercase}
  .mk .front b{font:400 15px 'Poiret One';letter-spacing:.2em;color:var(--gold);font-weight:400}
  .mk .sp{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--celadon);margin-top:20px}
  .mk .sp span{display:flex;align-items:center;gap:11px;font:400 .86rem Federo;letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:20px;height:20px}
  .mk em{font:italic 400 .9rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em}
  .mk .tip{font:italic 400 .95rem 'Cormorant Garamond';color:var(--row-hint);margin-top:8px;min-height:1.2em}
  .mkcor{position:fixed;bottom:24px;color:var(--celadon);display:flex;flex-direction:column;align-items:center;gap:6px;z-index:20;font:400 .56rem Federo;letter-spacing:.18em;text-transform:uppercase}
  .mkcor svg{width:22px;height:22px}.mkcor.l{left:26px}.mkcor.r{right:26px}`,
  html:`<div class="mk"><div class="stack">${Array.from({length:n},(_,k)=>`<div class="edge" style="--x:${(k+1)*6}px;--y:${k*10}px"></div>`).reverse().join('')}
  <div class="front" style="--x:${(n+1)*6}px;--y:${n*10}px">Draw <b>${left} left</b></div>
</div>
  <div class="tip">${s.hints?'tap the deck to draw the next card':''}</div>
  <div class="sp"><span>${I.spot}Spotlight</span><em>${s.hints?H.spot:''}</em></div></div>
  <div class="mkcor l">${I.back}Back</div><div class="mkcor r">${I.menu}Menu</div>`,
  card: cardLine(s)
  };
};

// K · Small things up top. Spotlight's rule (small items in the top corners) applied to the
// whole screen: Three and Twist move to the top corners, either side of the logo, where
// Spotlight keeps them too. Under the card only one centred column is left: the count,
// Spotlight, and the gold Next card with Back and Menu bare at its sides.
V.K = s => ({
  css: lineCss + countCss + `
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:20px;margin-top:10px}
  .mk .sp{display:flex;flex-direction:column;align-items:center;gap:5px;color:var(--celadon)}
  .mk .sp span{display:flex;align-items:center;gap:11px;font:400 .86rem Federo;letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:20px;height:20px}
  .mk em,.mktop em{font:italic 400 .88rem/1.1 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em}
  .mk .row{display:grid;grid-template-columns:56px 1fr 56px;align-items:center;gap:10px;width:100%}
  .mk .ic{height:54px;display:grid;place-items:center;color:var(--celadon)}.mk .ic svg{width:22px;height:22px}
  .mk .go{height:54px;display:grid;place-items:center;${GOLD}}
  .mktop{position:absolute;top:22px;display:flex;flex-direction:column;gap:4px;color:var(--celadon);z-index:20;max-width:84px}
  .mktop span{display:flex;align-items:center;gap:7px;font:400 .62rem Federo;letter-spacing:.2em;text-transform:uppercase}.mktop svg{width:15px;height:15px}
  .mktop.l{left:18px;align-items:flex-start}.mktop.r{right:18px;align-items:flex-end;text-align:right}`,
  html:`<div class="mk">${count(s)}<div class="sp"><span>${I.spot}Spotlight</span><em>${s.hints?H.spot:''}</em></div>
  <div class="row"><div class="ic">${I.back}</div><div class="go">Next card</div><div class="ic">${I.menu}</div></div></div>`,
  card: cardLine(s),
  page:`<div class="mktop l"><span>${I.three}Three</span><em>${s.hints?H.three:''}</em></div><div class="mktop r"><span>Twist${I.twist}</span><em>${s.hints?H.twist:''}</em></div>`
});

if (typeof module !== 'undefined') module.exports = V;
