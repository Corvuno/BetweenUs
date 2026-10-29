// ── LIBRARY ──────────────────────────────────────────────────────────────────
// The favourites collection: load from localStorage and render its drawer
// list. (Starring/unstarring the current card lives
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

