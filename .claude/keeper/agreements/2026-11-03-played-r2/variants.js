// Played & Favourites, round 2: option C (owner's pick, 2026-11-03) with the small cards
// drawn like the real card. Reuses round 1's shared rows/footer; only the card changes.
const R1 = require('../2026-11-03-played-r1/variants.js');
const V = {};
V.C1 = R1.C;   // round 1's C, for comparison
V.C2 = {
  css: R1.C.css + `
 .pX-grid .pX-card{position:relative;margin:0;background:var(--card-bg);border:1px solid var(--border);
   border-top:2px solid var(--lvl);border-left-width:1px;box-shadow:0 4px 18px rgba(0,0,0,.4);
   padding:20px 14px 18px;min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center}
 .pX-grid .pX-card::before,.pX-grid .pX-card::after{content:'';position:absolute;width:12px;height:12px;border-style:solid;border-color:var(--gold);opacity:.35}
 .pX-grid .pX-card::before{top:9px;left:9px;border-width:1px 0 0 1px}
 .pX-grid .pX-card::after{bottom:9px;right:9px;border-width:0 1px 1px 0}
 .pX-grid .pX-cat{font-family:'Jost',sans-serif;font-weight:600;font-size:.62rem;letter-spacing:.16em;opacity:.95}
 .pX-grid .pX-q{font-family:'Bodoni Moda','Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size-adjust:.36;font-size:1.02rem;line-height:1.4;text-wrap:balance;margin:0}
 .pX-grid .pX-star{position:absolute;top:7px;right:10px;color:var(--gold);font-size:.8rem;opacity:.85}
 .pX-panel .pX-grid .pX-card{min-height:170px}`,
  build: R1.C.build
    .replace("const card = c =>", "const favQ = new Set((state.favourites||[]).map(f=>f.question)); const card = c =>")
    .replace(`+'"><div class="pX-cat">'`, `+'">'+(favQ.has(c.question)?'<span class="pX-star">\u2605</span>':'')+'<div class="pX-cat">'`)
    .replace("<button>Export</button><span></span><button>Import</button>", "<button>Download the list</button><span></span><button>Open a list</button>"),
};
module.exports = V;
