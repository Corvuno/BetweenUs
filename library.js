// ── LIBRARY ──────────────────────────────────────────────────────────────────
// The favourites and custom-cards collections: load/persist to localStorage
// and render their drawer lists. (Starring/unstarring the current card lives
// in card.js — this file owns the saved collections, not the per-card toggle.)


/* Saved list from localStorage, or [] when nothing usable is stored: missing,
   unreadable, not JSON, not a list. Entries without a level and question are dropped. */
function readSavedCards(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved)
      ? saved.filter(c => typeof c?.question === 'string' && typeof c?.level === 'string')
      : [];
  } catch (error) {
    console.warn(`Ignoring unreadable saved data "${key}":`, error);
    return [];
  }
}

function loadFavourites() {
  state.favourites = readSavedCards('bu-favourites');
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


// ── CUSTOM CARDS ──────────────────────────────────────────────────────────────
function loadCustomCards() {
  state.customCards = readSavedCards('bu-custom-cards');
  state.customCards.forEach(c => {
    if (!ALL_CARDS.some(a => a.question === c.question))
      ALL_CARDS.push({ level: c.level, question: c.question, custom: true });
  });
  renderCustomList();
}

/* Common tail of every custom-card edit: persist, re-render the drawer list,
   refresh the grid's per-category counts, and reshuffle the deck to reflect
   the new ALL_CARDS. */
function persistCustomCards() {
  try {
    localStorage.setItem('bu-custom-cards', JSON.stringify(state.customCards));
  } catch (error) {
    // Storage full or blocked (private mode): the card stays for this session only.
    console.warn('Custom cards could not be saved:', error);
  }
  renderCustomList();
  updateCatCounts();
  initDeck();
}


function addCustomCard() {
  const text   = document.getElementById('customText').value.trim();
  const level  = document.getElementById('customLevel').value;
  if (!text) return;
  const card = { level, question: text, custom: true };
  state.customCards.push(card);
  ALL_CARDS.push(card);
  document.getElementById('customText').value = '';
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

