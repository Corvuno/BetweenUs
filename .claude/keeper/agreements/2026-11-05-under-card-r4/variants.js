// Under the card, round 4 (#113). Base: round 3 M (one gold control: Spotlight | Next card |
// Three), Twist on the card, Back as an undo after a draw, coloured line on the card's edge.
// The card keeps a real card's proportions (owner). This round is about where Menu belongs,
// argued from what it holds: "Tonight" (The Deck, Start over) and "Yours" (Played,
// Favourites), plus Ways to play. The Deck is also what Selected deck opens.
const R3 = require('../2026-11-05-under-card-r3/variants.js');
const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt" aria-hidden="true"';
const MENU = `<svg ${SV}><path d="M4 7h16M4 12h11M4 17h6"/></svg>`;
const base = s => { const m = R3.M(s); return { ...m, page: '' }; };
const V = {};

// P · Menu in Selected deck. The top line already opens The Deck, the first thing in the
// menu. Here it opens the whole menu: one door at the top for everything about the
// evening's deck and what you kept from it; the bottom of the screen is only for playing.
V.P = s => { const m = base(s); return { ...m,
  css: m.css + `
  .tok-lbl{display:inline-flex;align-items:center;gap:8px}
  .mkmi{display:inline-flex;width:15px;height:15px;color:var(--celadon)}.mkmi svg{width:15px;height:15px}`,
  pre: `() => { const l = document.querySelector('.tok-lbl'); if (l) l.insertAdjacentHTML('afterbegin', ${JSON.stringify('<span class="mkmi">' + MENU + '</span>')});
    const h = document.getElementById('tokHint'); if (h) h.textContent = ' · deck, played, favourites'; }`
}; };

// Q · Menu with the hand. Played and Favourites are this hand and the ones before it, and
// Start over begins a new one: the menu is about your hands. So it lives in the count: the
// count gets the menu mark and opens the menu, centred on the bar's own axis.
V.Q = s => { const m = base(s); return { ...m,
  css: m.css + `
  .mkct{display:inline-flex;align-items:center;gap:12px}
  .mkct .mi{display:inline-flex;color:var(--celadon)}.mkct .mi svg{width:16px;height:16px}
  .mkct em{display:block}
  .mk .qh{font:italic 400 .88rem 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em;margin-top:-8px}`,
  html: m.html.replace(/<b class="mkct">([^<]*)<\/b>/, `<b class="mkct">$1<span class="mi">${MENU}</span></b><em class="qh">${s.hints ? 'tap for played, favourites and more' : ''}</em>`)
}; };

// R · Menu closes the column. Everything centred hangs on one axis: count, gold bar,
// and under the bar's labels the menu as the axis's quiet end, the way a card's maker's
// mark sits at the foot. Furthest from the thumb's daily path, still on the centre line.
V.R = s => { const m = base(s); return { ...m,
  css: m.css + `
  .mk .mkm{display:flex;align-items:center;gap:9px;color:var(--celadon-soft);font:400 .62rem Federo;letter-spacing:.24em;text-transform:uppercase;margin-top:6px}
  .mk .mkm svg{width:15px;height:15px}
  .mk .mkm-h{font:italic 400 .86rem 'Cormorant Garamond';color:var(--row-hint);min-height:1.1em;margin-top:-10px}`,
  html: m.html.replace(/<\/div>$/, `<div class="mkm">${MENU}Menu</div><em class="mkm-h">${s.hints ? 'deck, played, favourites' : ''}</em></div>`)
}; };

if (typeof module !== 'undefined') module.exports = V;
