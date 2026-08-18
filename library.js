// ── LIBRARY ──────────────────────────────────────────────────────────────────
// The favourites and custom-cards collections: load/persist to localStorage
// and render their drawer lists. (Starring/unstarring the current card lives
// in card.js — this file owns the saved collections, not the per-card toggle.)


function loadFavourites() {
  try { const v = localStorage.getItem('bu-favourites'); if (v) state.favourites = JSON.parse(v); }
  catch(e) { state.favourites = []; }
  updateStarUI();
}


function renderFavourites() {
  const el = document.getElementById('favsList');
  el.innerHTML = state.favourites.length === 0
    ? '<div class="drawer-empty">No favourites yet. Tap ★ on a card.</div>'
    : state.favourites.map(c =>
        `<div class="drawer-item drawer-item--lvl" style="--lvl:${levelColor(c.level)}">
          <div class="drawer-item-meta">${LEVEL_LABELS[c.level] || esc(c.level)}</div>
          ${esc(c.question)}
        </div>`
      ).join('');
}


// ── SESSION SAVE ──────────────────────────────────────────────────────────────
// ── PARTY MODE ────────────────────────────────────────────────────────────────
// ── CUSTOM CARDS ──────────────────────────────────────────────────────────────
function loadCustomCards() {
  try {
    const v = localStorage.getItem('bu-custom-cards');
    if (v) {
      state.customCards = JSON.parse(v);
      state.customCards.forEach(c => {
        if (!ALL_CARDS.find(a => a.question === c.question))
          ALL_CARDS.push({ level: c.level, question: c.question, nl: c.nl||undefined, custom: true });
      });
    }
  } catch(e) { state.customCards = []; }
  renderCustomList();
}

/* Common tail of every custom-card edit: persist, re-render the drawer list,
   refresh the grid's per-category counts, and reshuffle the deck to reflect
   the new ALL_CARDS. */
function persistCustomCards() {
  try { localStorage.setItem('bu-custom-cards', JSON.stringify(state.customCards)); } catch(e) {}
  renderCustomList();
  if (typeof updateCatCounts === 'function') updateCatCounts();
  initDeck();
}


function addCustomCard() {
  const text   = document.getElementById('customText').value.trim();
  const textNl = (document.getElementById('customTextNl')?.value||'').trim();
  const level  = document.getElementById('customLevel').value;
  if (!text) return;
  const card = { level, question: text, custom: true };
  if (textNl) card.nl = textNl;
  state.customCards.push(card);
  ALL_CARDS.push(card);
  document.getElementById('customText').value = '';
  if (document.getElementById('customTextNl')) document.getElementById('customTextNl').value = '';
  persistCustomCards();
}

function removeCustomCard(question) {
  state.customCards = state.customCards.filter(c => c.question !== question);
  const idx   = ALL_CARDS.findIndex(c => c.question === question && c.custom);
  if (idx >= 0) ALL_CARDS.splice(idx, 1);
  persistCustomCards();
}


function renderCustomList() {
  const el = document.getElementById('customList');
  if (!el) return;
  el.innerHTML = state.customCards.length === 0
    ? '<div class="drawer-empty">No custom cards yet.</div>'
    : state.customCards.map((c, i) =>
        `<div class="drawer-item drawer-item--custom">
          <div>
            <div class="drawer-item-meta">${LEVEL_LABELS[c.level] || esc(c.level)}</div>
            ${esc(c.question)}
          </div>
          <button class="drawer-remove-btn" data-idx="${i}">✕</button>
        </div>`
      ).join('');
}

