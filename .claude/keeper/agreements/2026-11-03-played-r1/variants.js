// Played & Favourites, round 1. Each option: css + a builder run inside the live app
// (it reads the app's own state: state.sessionLog, state.favourites, getStoredSessions(),
// levelColor(), LEVEL_LABELS). kind = 'played' | 'favs'; pc = docked layout.
const V = {};

// Shared bits for every option: rows drawn like the new menu (celadon caps name, cream text),
// tools as quiet words in a footer instead of boxed buttons, "playing now" instead of LIVE.
const base = `
 .pX{font-family:'Jost',sans-serif;color:var(--cream)}
 .pX-title{font-family:'Jost',sans-serif;font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);text-align:center;padding:4px 0 6px}
 .pX-head{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--text-helper);margin:14px 0 8px}
 .pX-card{position:relative;padding:10px 14px 12px 16px;border:1px solid var(--dim);border-left:3px solid var(--lvl);margin-bottom:6px}
 .pX-cat{font-family:'Jost',sans-serif;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--lvl)}
 .pX-q{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.12rem;line-height:1.35;color:var(--cream);margin-top:3px}
 .pX-foot{display:flex;justify-content:center;align-items:center;gap:20px;margin:18px 0 6px;flex-wrap:wrap}
 .pX-foot button{background:none;border:none;font-family:'Jost',sans-serif;font-size:.82rem;letter-spacing:.06em;color:var(--celadon);cursor:pointer;padding:8px 2px}
 .pX-foot span{width:4px;height:4px;background:var(--celadon);transform:rotate(45deg);opacity:.5}
 .pX-foot .quiet{color:var(--muted-l)}
 .pX-save{display:flex;align-items:center;gap:14px;padding:12px 14px 12px 16px;border:1px solid var(--dim);border-left:3px solid var(--border-strong);margin-bottom:6px}
 .pX-save.now{border-left-color:var(--celadon)}
 .pX-save-main{flex:1;min-width:0}
 .pX-save-name{font-family:'Cormorant Garamond',serif;font-size:1.12rem;color:var(--cream)}
 .pX-save-meta{font-family:'Federo','Jost',sans-serif;font-size:.8rem;color:var(--muted-l);margin-top:2px}
 .pX-save-now{font-family:'Federo','Jost',sans-serif;font-size:.8rem;color:var(--celadon);margin-left:8px}
 .pX-save-act{display:flex;gap:16px;font-family:'Federo','Jost',sans-serif;font-size:.82rem;color:var(--celadon-soft)}
 .pX-empty{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.05rem;color:var(--muted-l);padding:6px 0 4px}
 .pX-add{display:block;margin:8px auto 0;background:none;border:none;font-family:'Jost',sans-serif;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--celadon);cursor:pointer;padding:10px}
 /* PC: the same left side panel the menu uses */
 .pX-panel{position:fixed;top:0;left:0;bottom:0;width:42%;min-width:520px;z-index:180;background:var(--surface);border-right:1px solid var(--border-strong);padding:0 28px 28px;overflow:auto}
 .pX-panel .pX-title{text-align:left;padding:18px 0 6px}
 .pX-panel .pX-q{font-size:1.18rem}
`;

const H = {
  esc: s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
};

// helper source shared by every builder (stringified into the page)
const helpers = `
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const card = c => '<div class="pX-card" style="--lvl:'+levelColor(c.level)+'"><div class="pX-cat">'+(LEVEL_LABELS[c.level]||esc(c.level))+'</div><div class="pX-q">'+esc(c.question)+'</div></div>';
  const saves = () => getStoredSessions().slice().sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt));
  const when = s => new Date(s.savedAt).toLocaleString(undefined,{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
  const saveRow = s => '<div class="pX-save'+(s.id===state.activeSessionId?' now':'')+'"><div class="pX-save-main"><div class="pX-save-name">'+esc(s.name)+(s.id===state.activeSessionId?'<span class="pX-save-now">playing now</span>':'')+'</div><div class="pX-save-meta">Saved '+when(s)+'</div></div><div class="pX-save-act"><span>Rename</span><span>Delete</span></div></div>';
  const log = [...state.sessionLog].reverse();
`;

// A: the cards first, the tools quiet at the bottom
V.A = {
  css: base,
  build: helpers + `
  if (kind==='favs') return '<div class="pX-title">Favourites</div>' + (state.favourites.map(card).join('')||'<div class="pX-empty">Nothing starred yet. Tap the star on a card.</div>');
  return '<div class="pX-title">Played</div>'
    + '<div class="pX-head">Drawn so far</div>' + log.map(card).join('')
    + '<div class="pX-foot"><button>Export</button><span></span><button>Import</button><span></span><button class="quiet">Clear the list</button></div>'
    + '<div class="pX-head">Saved</div>' + saves().map(saveRow).join('')
    + '<button class="pX-add">Save for later</button>';`
};

// B: two sides, picked at the top like The Deck's "Start from"; one list at a time
V.B = {
  css: base + `
 .pX-tabs{display:flex;justify-content:center;gap:34px;margin:10px 0 14px}
 .pX-tab{font-family:'Jost',sans-serif;font-size:.8rem;letter-spacing:.18em;text-transform:uppercase;color:var(--btn-quiet);padding:6px 0;border-bottom:1px solid transparent}
 .pX-tab.on{color:var(--celadon);border-bottom-color:var(--celadon)}
 .pX-tab b{font-weight:300;color:var(--muted-l);margin-left:6px;letter-spacing:.06em}
 .pX-panel .pX-tabs{justify-content:flex-start}`,
  build: helpers + `
  const tabs = '<div class="pX-tabs"><span class="pX-tab on">Drawn<b>'+state.sessionLog.length+'</b></span><span class="pX-tab">Saved<b>'+saves().length+'</b></span><span class="pX-tab">Starred<b>'+state.favourites.length+'</b></span></div>';
  if (kind==='favs') return '<div class="pX-title">Played</div>' + tabs.replace('pX-tab on','pX-tab').replace('<span class="pX-tab">Starred','<span class="pX-tab on">Starred') + state.favourites.map(card).join('');
  return '<div class="pX-title">Played</div>' + tabs + log.map(card).join('')
    + '<div class="pX-foot"><button>Export</button><span></span><button>Import</button><span></span><button class="quiet">Clear the list</button><span></span><button>Save for later</button></div>';`
};

// C (rethink): the cards as a spread of small cards, two across, like a hand laid on the table
V.C = {
  css: base + `
 .pX-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 .pX-grid .pX-card{margin:0;border:1px solid color-mix(in srgb,var(--lvl) 45%,transparent);border-top:3px solid var(--lvl);border-left-width:1px;padding:10px 11px 12px;background:linear-gradient(180deg,color-mix(in srgb,var(--lvl) 9%,transparent),transparent 70%);min-height:118px}
 .pX-grid .pX-q{font-size:1.02rem;line-height:1.3}
 .pX-panel .pX-grid{grid-template-columns:1fr 1fr 1fr}
 .pX-shelf{display:flex;flex-direction:column;gap:6px}`,
  build: helpers + `
  if (kind==='favs') return '<div class="pX-title">Favourites</div><div class="pX-grid">' + state.favourites.map(card).join('') + '</div>';
  return '<div class="pX-title">Played</div>'
    + '<div class="pX-head">Drawn so far</div><div class="pX-grid">' + log.map(card).join('') + '</div>'
    + '<div class="pX-foot"><button>Export</button><span></span><button>Import</button><span></span><button class="quiet">Clear the list</button></div>'
    + '<div class="pX-head">Saved</div><div class="pX-shelf">' + saves().map(saveRow).join('') + '</div>'
    + '<button class="pX-add">Save for later</button>';`
};

module.exports = V;
