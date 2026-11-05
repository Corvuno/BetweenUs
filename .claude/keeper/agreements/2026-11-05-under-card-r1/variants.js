// Under the card, round 1 (#113): six options injected into the live app on a 412 x 915 phone.
// Each option is a function of the hand's state: ticks (colour + seen/current), the count, and
// whether the first-visit hints still show. It returns css, the html that replaces everything
// under the card, and optionally html placed on the card itself.
const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt" aria-hidden="true"';
const I = {
  back:`<svg ${SV}><path d="M21 12H10"/><path d="M13 6 4 12l9 6z" fill="currentColor"/></svg>`,
  next:`<svg ${SV}><path d="M3 12H14"/><path d="M11 6 20 12l-9 6z" fill="currentColor"/></svg>`,
  menu:`<svg ${SV}><path d="M4 7h16M4 12h11M4 17h6"/></svg>`,
  three:`<svg ${SV}><rect x="2" y="7" width="5.5" height="13"/><rect x="9.2" y="4" width="5.5" height="16"/><rect x="16.5" y="7" width="5.5" height="13"/></svg>`,
  spot:`<svg ${SV}><rect x="3" y="3" width="18" height="18"/><rect x="8" y="8" width="8" height="8"/></svg>`,
  twist:`<svg ${SV}><rect x="4" y="4" width="16" height="16"/><path d="M12 2 22 12 12 22 2 12z"/></svg>`,
};
const H = { three:'pick one of three', spot:'the question takes the stage', twist:'same question, new angle' };
const ticks = (s, cls) => s.ticks.map(t => `<i class="${cls} ${t.state}" style="--c:${t.color}"></i>`).join('');
const V = {};

// A · Same parts, one language. Everything stays where it is, but drawn with one line
// (the gold hairline box), one control colour (celadon) and square corners. The three
// play-styles become one framed strip in the same box language as Back and Menu.
V.A = s => ({
  css:`
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:12px}
  .mk .tk{display:flex;gap:4px;width:100%;align-items:center}
  .mk .tk i{flex:1;height:4px;background:var(--border)}
  .mk .tk i.seen{background:var(--c);opacity:.45}.mk .tk i.current{background:var(--c);height:6px}
  .mk .tk b{font:400 13px 'Jost';letter-spacing:.18em;color:var(--gold);margin-left:10px;white-space:nowrap}
  .mk .nav{display:flex;gap:10px;width:100%}
  .mk .sq{width:52px;height:52px;border:1px solid var(--border);display:grid;place-items:center;color:var(--celadon);flex:none}
  .mk .sq svg{width:20px;height:20px}
  .mk .go{flex:1;background:linear-gradient(135deg,#c9a84c,#a07830);color:var(--bg);font:400 .82rem 'Jost';letter-spacing:.16em;text-transform:uppercase;display:grid;place-items:center}
  .mk .strip{display:flex;width:100%;border:1px solid var(--border)}
  .mk .strip > div{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;padding:13px 4px;color:var(--celadon)}
  .mk .strip > div + div{border-left:1px solid var(--border)}
  .mk .strip span{display:flex;gap:8px;align-items:center;font:400 .7rem 'Federo';letter-spacing:.2em;text-transform:uppercase}
  .mk .strip svg{width:16px;height:16px}
  .mk .strip em{font:italic 400 .9rem/1.1 'Cormorant Garamond';color:var(--row-hint);text-align:center;max-width:110px}`,
  html:`<div class="mk"><div class="tk">${ticks(s,'')}<b>${s.cur} / ${s.total}</b></div>
  <div class="nav"><div class="sq">${I.back}</div><div class="go">Next card</div><div class="sq">${I.menu}</div></div>
  <div class="strip">${[['three','Three'],['spot','Spotlight'],['twist','Twist']].map(([k,l])=>`<div><span>${I[k]}${l}</span>${s.hints?`<em>${H[k]}</em>`:''}</div>`).join('')}</div></div>`
});

// B · The plinth. Card and controls become one object: a framed base joined to the bottom
// of the card, like the stand of a boxed deck. The progress is the plinth's top edge.
// Inside: Back, the count over the gold Next, Menu. Spotlight runs along the bottom of the
// plinth, with Three and Twist as its two ends.
V.B = s => ({
  css:`
  .mk{width:100%;border:1px solid var(--border);border-top:none;margin-top:-12px;background:var(--card-bg)}
  .mk .tk{display:flex;gap:2px}.mk .tk i{flex:1;height:3px;background:var(--dim)}
  .mk .tk i.seen{background:var(--c);opacity:.5}.mk .tk i.current{background:var(--c)}
  .mk .mid{display:flex;align-items:stretch;gap:0;padding:14px 14px 12px}
  .mk .sq{width:48px;display:grid;place-items:center;color:var(--celadon)}.mk .sq svg{width:21px;height:21px}
  .mk .col{flex:1;display:flex;flex-direction:column;align-items:center;gap:9px}
  .mk .ct{font:400 14px 'Poiret One';letter-spacing:.3em;color:var(--gold)}
  .mk .go{width:100%;padding:15px 0;background:linear-gradient(135deg,#c9a84c,#a07830);color:var(--bg);font:400 .82rem 'Jost';letter-spacing:.16em;text-transform:uppercase;text-align:center}
  .mk .base{display:flex;border-top:1px solid var(--border)}
  .mk .base > div{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:12px 6px;color:var(--celadon)}
  .mk .base .end{width:64px}.mk .base .end svg{width:18px;height:18px}
  .mk .base .sp{flex:1;border-left:1px solid var(--border);border-right:1px solid var(--border)}
  .mk .base .sp span{display:flex;gap:10px;align-items:center;font:400 .76rem 'Federo';letter-spacing:.26em;text-transform:uppercase}.mk .base .sp svg{width:17px;height:17px}
  .mk .base small{font:400 .56rem 'Federo';letter-spacing:.16em;text-transform:uppercase;color:var(--row-hint)}
  .mk .base em{font:italic 400 .9rem/1.1 'Cormorant Garamond';color:var(--row-hint);text-align:center}`,
  html:`<div class="mk"><div class="tk">${ticks(s,'')}</div>
  <div class="mid"><div class="sq">${I.back}</div><div class="col"><div class="ct">${s.cur} / ${s.total}</div><div class="go">Next card</div></div><div class="sq">${I.menu}</div></div>
  <div class="base"><div class="end">${I.three}<small>Three</small></div>
  <div class="sp"><span>${I.spot}Spotlight</span>${s.hints?`<em>${H.spot}</em>`:''}</div>
  <div class="end">${I.twist}<small>Twist</small></div></div></div>`
});

// C · Two equals. Next card and Spotlight are the two things you do, so they get the
// two buttons, side by side, the same size: gold filled and gold outlined. Back and Menu
// become quiet icons beside the count. Three and Twist move onto the card, into its two
// bottom corners, as part of the card itself.
V.C = s => ({
  css:`
  .mk{width:100%;display:flex;flex-direction:column;gap:14px}
  .mk .top{display:flex;align-items:center;justify-content:space-between}
  .mk .ic{width:44px;height:44px;display:grid;place-items:center;color:var(--celadon)}.mk .ic svg{width:21px;height:21px}
  .mk .ct{display:flex;align-items:center;gap:10px;font:400 15px 'Poiret One';letter-spacing:.3em;color:var(--gold)}
  .mk .ct i{display:block;width:34px;height:1px;background:var(--border)}
  .mk .two{display:flex;gap:10px}
  .mk .two > div{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
  .mk .b{width:100%;height:54px;display:flex;align-items:center;justify-content:center;gap:10px;font:400 .8rem 'Jost';letter-spacing:.16em;text-transform:uppercase}
  .mk .b svg{width:18px;height:18px}
  .mk .gold{background:linear-gradient(135deg,#c9a84c,#a07830);color:var(--bg)}
  .mk .line{border:1px solid var(--gold);color:var(--gold-l)}
  .mk em{font:italic 400 .92rem/1.1 'Cormorant Garamond';color:var(--row-hint)}
  .mkc{position:absolute;bottom:14px;display:flex;align-items:center;gap:7px;color:var(--celadon);font:400 .62rem 'Federo';letter-spacing:.2em;text-transform:uppercase;z-index:5}
  .mkc svg{width:15px;height:15px}.mkc.l{left:20px}.mkc.r{right:20px}
  #card::after{opacity:0}`,
  html:`<div class="mk"><div class="top"><div class="ic">${I.back}</div><div class="ct"><i></i>${s.cur} / ${s.total}<i></i></div><div class="ic">${I.menu}</div></div>
  <div class="two"><div><div class="b gold">Next card</div></div><div><div class="b line">${I.spot}Spotlight</div>${s.hints?`<em>${H.spot}</em>`:''}</div></div></div>`,
  card:`<div class="mkc l">${I.three}Three</div><div class="mkc r">Twist${I.twist}</div>`
});

// D · Under the thumb. One bar at the very bottom of the screen, where the thumb rests,
// like a phone's own bottom bar but drawn in the deck's line: five slots, Next as a gold
// diamond in the middle. The count sits as a thin rule over the bar. The space between
// card and bar stays empty, for the question. Twist moves onto the card.
V.D = s => ({
  css:`
  .mk{position:fixed;left:0;right:0;bottom:0;padding:0 18px 22px;background:linear-gradient(transparent,var(--bg) 22px);z-index:20}
  .mk .tk{display:flex;align-items:center;gap:10px;margin:0 6px 30px}
  .mk .tk .r{flex:1;display:flex;gap:3px}.mk .tk i{flex:1;height:2px;background:var(--border)}
  .mk .tk i.seen{background:var(--c);opacity:.5}.mk .tk i.current{background:var(--c);height:3px}
  .mk .tk b{font:400 13px 'Poiret One';letter-spacing:.24em;color:var(--gold)}
  .mk .bar{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:12px}
  .mk .slot{width:62px;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--celadon);font:400 .56rem 'Federo';letter-spacing:.16em;text-transform:uppercase}
  .mk .slot svg{width:21px;height:21px}
  .mk .dia{width:66px;height:66px;display:grid;place-items:center;margin-top:-30px}
  .mk .dia i{width:48px;height:48px;transform:rotate(45deg);background:linear-gradient(135deg,#e8c97a,#a07830);display:grid;place-items:center;box-shadow:0 0 0 5px var(--bg),0 0 0 6px var(--border)}
  .mk .dia svg{transform:rotate(-45deg);width:22px;height:22px;color:var(--bg)}
  .mk .hint{text-align:center;font:italic 400 .98rem 'Cormorant Garamond';color:var(--row-hint);margin:0 0 10px}
  .mkc{position:absolute;bottom:14px;left:20px;display:flex;align-items:center;gap:7px;color:var(--celadon);font:400 .62rem 'Federo';letter-spacing:.2em;text-transform:uppercase;z-index:5}.mkc svg{width:15px;height:15px}
`,
  html:`<div class="mk">${s.hints?`<div class="hint">Spotlight gives the question the whole screen</div>`:''}<div class="tk"><div class="r">${ticks(s,'')}</div><b>${s.cur}/${s.total}</b></div>
  <div class="bar"><div class="slot">${I.back}Back</div><div class="slot">${I.three}Three</div><div class="dia"><i>${I.next}</i></div><div class="slot">${I.spot}Spotlight</div><div class="slot">${I.menu}Menu</div></div></div>`,
  card:`<div class="mkc">${I.twist}Twist</div>`
});

// E · The count is the control. No gold slab: the count itself, set large in the logo's
// letter, with an arrow either side, is how you move. Spotlight and Menu are two words on
// one line under it. Three and Twist move into the menu. The calmest option; the card
// does almost all the talking.
V.E = s => ({
  css:`
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:18px;margin-top:8px}
  .mk .tk{display:flex;gap:6px}.mk .tk i{width:7px;height:7px;transform:rotate(45deg);border:1px solid var(--border)}
  .mk .tk i.seen{background:var(--c);border-color:var(--c);opacity:.5}.mk .tk i.current{background:var(--c);border-color:var(--c);width:9px;height:9px}
  .mk .ctl{display:flex;align-items:center;width:100%;justify-content:space-between}
  .mk .ar{width:72px;height:72px;display:grid;place-items:center;color:var(--celadon);border:1px solid var(--border)}
  .mk .ar.n{background:linear-gradient(135deg,#c9a84c,#a07830);color:var(--bg);border:none}
  .mk .ar svg{width:26px;height:26px}
  .mk .ct{display:flex;flex-direction:column;align-items:center;gap:4px}
  .mk .ct b{font:400 34px 'Poiret One';letter-spacing:.14em;color:var(--gold-l);font-weight:400}
  .mk .ct small{font:400 .6rem 'Federo';letter-spacing:.22em;text-transform:uppercase;color:var(--muted-l)}
  .mk .words{display:flex;align-items:center;gap:22px;color:var(--celadon);font:400 .74rem 'Federo';letter-spacing:.26em;text-transform:uppercase}
  .mk .words span{display:flex;align-items:center;gap:9px}.mk .words svg{width:17px;height:17px}
  .mk .words i{width:1px;height:18px;background:var(--border)}
  .mk em{font:italic 400 .95rem 'Cormorant Garamond';color:var(--row-hint);margin-top:-10px}`,
  html:`<div class="mk"><div class="tk">${ticks(s,'')}</div>
  <div class="ctl"><div class="ar">${I.back}</div><div class="ct"><b>${s.cur} / ${s.total}</b><small>next card →</small></div><div class="ar n">${I.next}</div></div>
  <div class="words"><span>${I.spot}Spotlight</span><i></i><span>${I.menu}Menu</span></div>${s.hints?`<em>${H.spot}</em>`:''}</div>`
});

// F · Deco, out loud. The bold one: everything symmetric around a centre line, in shapes
// from the logo. Next is a gold bar with stepped ends; Back and Menu are rotated squares
// either side, like the logo's twin diamonds. The count sits in a small framed plaque
// above. Spotlight is set between the card's own corner brackets, Three and Twist under
// it as its two wings.
V.F = s => ({
  css:`
  .mk{width:100%;display:flex;flex-direction:column;align-items:center;gap:16px}
  .mk .pl{display:flex;align-items:center;gap:12px;color:var(--gold)}
  .mk .pl i{width:60px;height:1px;background:linear-gradient(90deg,transparent,var(--border-strong))}.mk .pl i:last-child{transform:scaleX(-1)}
  .mk .pl b{font:400 14px 'Poiret One';letter-spacing:.3em;border:1px solid var(--border-strong);padding:5px 10px 5px 14px;font-weight:400}
  .mk .row{display:flex;align-items:center;justify-content:center;gap:18px;width:100%}
  .mk .dm{width:42px;height:42px;transform:rotate(45deg);border:1px solid var(--border-strong);display:grid;place-items:center;color:var(--celadon);flex:none}
  .mk .dm svg{transform:rotate(-45deg);width:19px;height:19px}
  .mk .go{flex:1;max-width:236px;height:54px;display:grid;place-items:center;color:var(--bg);font:400 .82rem 'Jost';letter-spacing:.18em;text-transform:uppercase;
    background:linear-gradient(135deg,#c9a84c,#a07830);clip-path:polygon(10px 0,calc(100% - 10px) 0,calc(100% - 10px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 10px) calc(100% - 8px),calc(100% - 10px) 100%,10px 100%,10px calc(100% - 8px),0 calc(100% - 8px),0 8px,10px 8px)}
  .mk .sp{position:relative;padding:14px 34px 12px;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--celadon)}
  .mk .sp::before,.mk .sp::after{content:'';position:absolute;width:16px;height:16px;border:1px solid var(--gold);opacity:.7}
  .mk .sp::before{left:0;top:0;border-right:none;border-bottom:none}.mk .sp::after{right:0;bottom:0;border-left:none;border-top:none}
  .mk .sp span{display:flex;gap:10px;align-items:center;font:400 .8rem 'Federo';letter-spacing:.3em;text-transform:uppercase}.mk .sp svg{width:18px;height:18px}
  .mk .wings{display:flex;align-items:center;gap:14px;color:var(--celadon-soft);font:400 .62rem 'Federo';letter-spacing:.22em;text-transform:uppercase;margin-top:-8px}
  .mk .wings span{display:flex;align-items:center;gap:7px}.mk .wings svg{width:14px;height:14px}
  .mk .wings i{width:4px;height:4px;background:var(--gold);transform:rotate(45deg);opacity:.6}
  .mk em{font:italic 400 .92rem 'Cormorant Garamond';color:var(--row-hint)}`,
  html:`<div class="mk"><div class="pl"><i></i><b>${s.cur} / ${s.total}</b><i></i></div>
  <div class="row"><div class="dm">${I.back}</div><div class="go">Next card</div><div class="dm">${I.menu}</div></div>
  <div class="sp"><span>${I.spot}Spotlight</span>${s.hints?`<em>${H.spot}</em>`:''}</div>
  <div class="wings"><span>${I.three}Three</span><i></i><span>${I.twist}Twist</span></div></div>`
});

if (typeof module !== 'undefined') module.exports = V;
