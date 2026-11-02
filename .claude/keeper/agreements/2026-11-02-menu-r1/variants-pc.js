// Menu round 1, PC: the menu as a side panel built like The Deck's chapter rows, sliding in from the left.
const row = (name, desc, right) => `<div class="chapter"><div class="ch-main"><div class="ch-title"><button type="button" class="ch-hit"><span class="ch-name">${name}</span></button></div><span class="ch-desc">${desc}</span></div>${right !== undefined ? `<div class="ch-fold"><span class="ch-ct">${right}</span></div>` : ''}</div>`;
const head = `<div class="mP-head"><span class="mP-title">Menu</span><span class="mP-x">&#10005;</span></div>`;
const base = `
 .mP{position:fixed;top:0;left:0;bottom:0;width:42%;min-width:520px;z-index:180;background:var(--surface);border-right:1px solid var(--border-strong);padding:0 28px 28px;overflow:auto;font-family:'Jost',sans-serif}
 .mP-head{display:flex;align-items:center;justify-content:space-between;padding:18px 0 6px}
 .mP-title{font-family:'Jost',sans-serif;font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
 .mP-x{color:var(--muted);font-size:1rem;padding:4px}
 .mP .mP-sect{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--text-helper);margin:16px 0 8px}
 .mP .chapter{display:flex;align-items:stretch;border:1px solid var(--dim);border-left:3px solid var(--dim);margin-bottom:6px;cursor:pointer;background:none}
 .mP .ch-main{flex:1;padding:10px 14px;display:flex;flex-direction:column;gap:4px}
 .mP .ch-hit{background:none;border:none;padding:0;cursor:pointer;text-align:left}
 .mP .ch-name{font-family:'Jost',sans-serif;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--celadon)}
 .mP .ch-desc{font-family:'Federo','Jost',sans-serif;font-size:.82rem;color:var(--cream);opacity:.8}
 .mP .ch-fold{display:flex;align-items:center;justify-content:center;min-width:110px;padding:0 16px;margin:8px 0;border-left:1px solid var(--border)}
 .mP .ch-ct{font-family:'Jost',sans-serif;font-size:.85rem;letter-spacing:.1em;color:var(--cream)}
 .mP-foot{display:flex;gap:22px;align-items:center;margin-top:22px;padding-top:14px;border-top:1px solid var(--dim)}
 .mP-foot button{background:none;border:none;font-family:'Federo','Jost',sans-serif;font-size:.85rem;color:var(--celadon-hint);cursor:pointer;padding:6px 0}
 .mP-foot span{width:4px;height:4px;background:var(--celadon);transform:rotate(45deg);opacity:.4}
`;
const V = {};
V.A = { css: base, html: `<div class="mP">${head}
 <div class="mP-sect">Play</div>
 ${row('The Deck', 'Who it’s for, and what’s in it')}
 ${row('Ways to play', 'Seven ways round the table')}
 ${row('Start over', 'Every card back in, freshly shuffled')}
 <div class="mP-sect">Yours</div>
 ${row('Your evening', 'What you drew, saved evenings, export')}
 ${row('Favourites', 'Cards you’ve starred')}
 <div class="mP-foot"><button>Show hints again</button></div></div>` };
V.B = { css: base + `
 .mP-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
 .mP-grid .chapter{margin:0}
 .mP-grid .wide{grid-column:1/3}`, html: `<div class="mP">${head}
 <div class="mP-sect">Play</div>
 <div class="mP-grid"><div class="wide">${row('The Deck', 'Who it’s for, and what’s in it')}</div>
 ${row('Ways to play', 'Seven ways round the table')}${row('Start over', 'Every card back in')}</div>
 <div class="mP-sect">Yours</div>
 <div class="mP-grid">${row('Your evening', 'What you drew tonight')}${row('Favourites', 'Cards you’ve starred')}</div>
 <div class="mP-foot"><button>Show hints again</button></div></div>` };
V.C = { css: base + `.mP .ch-ct b{font-weight:400;color:var(--preset);letter-spacing:.14em;text-transform:uppercase;font-size:.78rem}`, html: `<div class="mP">${head}
 <div class="mP-sect">Tonight</div>
 ${row('The Deck', 'Change who it’s for, and what’s in it', '<b>Balanced</b>')}
 ${row('Start over', 'Every card back in, freshly shuffled', '2 / 5')}
 <div class="mP-sect">Yours</div>
 ${row('Your evening', 'What you drew, saved evenings, export', '2 drawn')}
 ${row('Favourites', 'Cards you’ve starred', '3')}
 <div class="mP-foot"><button>Ways to play</button><span></span><button>Show hints again</button></div></div>` };
module.exports = V;
