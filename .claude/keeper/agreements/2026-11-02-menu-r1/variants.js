// Menu round 1: three options injected into the live app's menu drawer.
const I = {
  deck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt"><rect x="3" y="8" width="13" height="13"/><path d="M8 8V3h13v13h-5"/></svg>',
  ways:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt"><rect x="8.5" y="8.5" width="7" height="7"/><path d="M12 1.5v3.5M12 19v3.5M1.5 12H5M19 12h3.5"/></svg>',
  start:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt"><path d="M20 10V4H4v16h16v-5"/><path d="M14.5 10H20"/></svg>',
  evening:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt"><rect x="3" y="3" width="18" height="18"/><path d="M12 7v5h5"/></svg>',
  fav:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" stroke-linecap="butt"><path d="m12 2.5 2.9 6.3 6.6.6-5 4.6 1.5 6.7L12 17.3l-6 3.4 1.5-6.7-5-4.6 6.6-.6Z"/></svg>',
};
const item = (k, label, sub) => `<button class="d-item"><div class="d-icon">${I[k]}</div><div class="d-text"><span class="d-label">${label}</span><span class="d-sub">${sub}</span></div></button>`;
const SUB = {
  deck:'Who it’s for, and what’s in it',
  ways:'Seven ways round the table',
  start:'Every card back in, freshly shuffled',
  evening:'What you drew, saved evenings, export',
  fav:'Cards you’ve starred',
};
const V = {};

// A — the same list, sorted into two groups
V.A = {
  css:`
  #menuDrawer .mA-head{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--text-helper);padding:14px 26px 2px;}
  #menuDrawer .mA-foot{display:block;margin:18px auto 4px;background:none;border:none;font-family:'Federo','Jost',sans-serif;font-size:.8rem;letter-spacing:.05em;color:var(--celadon-hint);cursor:pointer;padding:10px;}
  #menuDrawer .d-icon{color:var(--celadon);opacity:.8}
  #menuDrawer .d-icon svg{width:18px;height:18px}
  `,
  html:`<div class="mA-head">Play</div>${item('deck','The Deck',SUB.deck)}${item('ways','Ways to play',SUB.ways)}${item('start','Start over',SUB.start)}
  <div class="d-divider" style="margin:10px 26px"></div>
  <div class="mA-head">Yours</div>${item('evening','Your evening',SUB.evening)}${item('fav','Favourites',SUB.fav)}
  <button class="mA-foot">Show hints again</button>`
};

// B — the look of the Three / Spotlight / Twist row, centred and symmetric
const tile = (k, label, hint, wide) => `<button class="mB-tile${wide?' wide':''}"><span class="mB-top">${I[k]}<span class="mB-lbl">${label}</span></span><span class="mB-hint">${hint}</span></button>`;
V.B = {
  css:`
  #menuDrawer .mB{display:flex;flex-direction:column;align-items:center;padding:6px 20px 4px;}
  #menuDrawer .mB-row{display:flex;align-items:flex-start;justify-content:center;width:100%;max-width:420px;}
  #menuDrawer .mB-tile{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 8px 16px;background:none;border:none;cursor:pointer;color:var(--celadon);}
  #menuDrawer .mB-top{display:flex;align-items:center;gap:9px;white-space:nowrap}
  #menuDrawer .mB-top svg{width:18px;height:18px}
  #menuDrawer .mB-lbl{font-family:'Jost',sans-serif;font-size:.78rem;font-weight:400;letter-spacing:.22em;text-transform:uppercase}
  #menuDrawer .mB-hint{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;line-height:1.2;color:var(--row-hint);max-width:150px;text-align:center}
  #menuDrawer .mB-tile.wide .mB-hint{max-width:240px}
  #menuDrawer .mB-sep{width:4px;height:4px;background:var(--celadon);transform:rotate(45deg);opacity:.5;flex:0 0 auto;margin-top:27px}
  #menuDrawer .mB-rule{width:100%;max-width:420px;height:1px;background:var(--dim);margin:6px 0}
  #menuDrawer .mB-foot{margin:14px 0 0;background:none;border:none;font-family:'Federo','Jost',sans-serif;font-size:.8rem;letter-spacing:.05em;color:var(--celadon-hint);cursor:pointer;padding:10px}
  `,
  html:`<div class="mB">
  <div class="mB-row">${tile('deck','The Deck','who it’s for, and what’s in it',true)}</div>
  <div class="mB-rule"></div>
  <div class="mB-row">${tile('ways','Ways to play','seven ways round the table')}<span class="mB-sep"></span>${tile('start','Start over','every card back in')}</div>
  <div class="mB-rule"></div>
  <div class="mB-row">${tile('evening','Your evening','what you drew tonight')}<span class="mB-sep"></span>${tile('fav','Favourites','cards you’ve starred')}</div>
  <button class="mB-foot">Show hints again</button></div>`
};

// C — rethink: each line shows where you are now instead of describing itself
const live = (k, label, state, act) => `<button class="mC-item"><span class="mC-icon">${I[k]}</span><span class="mC-lbl">${label}</span><span class="mC-state">${state}</span>${act?`<span class="mC-act">${act}</span>`:''}</button>`;
V.C = {
  css:`
  #menuDrawer .mC{padding:4px 0 4px}
  #menuDrawer .mC-head{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--text-helper);padding:10px 26px 4px;}
  #menuDrawer .mC-item{display:grid;grid-template-columns:20px 1fr auto;grid-template-rows:auto auto;column-gap:16px;row-gap:3px;align-items:center;width:100%;padding:14px 26px;background:none;border:none;text-align:left;cursor:pointer;}
  #menuDrawer .mC-icon{grid-row:1/3;color:var(--celadon);opacity:.8;display:flex}
  #menuDrawer .mC-icon svg{width:18px;height:18px}
  #menuDrawer .mC-lbl{font-family:'Jost',sans-serif;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--celadon)}
  #menuDrawer .mC-state{grid-column:2;font-family:'Cormorant Garamond',serif;font-size:1.12rem;color:var(--cream);opacity:.85}
  #menuDrawer .mC-state b{font-weight:400;color:var(--preset);letter-spacing:.04em}
  #menuDrawer .mC-act{grid-column:3;grid-row:1/3;font-family:'Federo','Jost',sans-serif;font-size:.8rem;letter-spacing:.05em;color:var(--celadon-hint)}
  #menuDrawer .mC-foot{display:flex;justify-content:center;align-items:center;gap:22px;margin:16px 0 2px}
  #menuDrawer .mC-foot button{background:none;border:none;font-family:'Federo','Jost',sans-serif;font-size:.82rem;letter-spacing:.05em;color:var(--celadon-hint);cursor:pointer;padding:10px 2px}
  #menuDrawer .mC-foot span{width:4px;height:4px;background:var(--celadon);transform:rotate(45deg);opacity:.4}
  `,
  html:`<div class="mC">
  <div class="mC-head">Tonight</div>
  ${live('deck','The Deck','<b>Balanced</b>, five cards','Change')}
  ${live('start','Start over','2 of 5 drawn','Shuffle')}
  <div class="d-divider" style="margin:10px 26px"></div>
  <div class="mC-head">Yours</div>
  ${live('evening','Your evening','2 cards drawn, 1 saved evening','Open')}
  ${live('fav','Favourites','3 starred','Open')}
  <div class="mC-foot"><button>Ways to play</button><span></span><button>Show hints again</button></div></div>`
};
module.exports = V;
