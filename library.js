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


// A drawn or starred card as a small card: its colour line on top, a faint wash of the colour, the name of
// its group, the question, and a small star when it is starred.
function smallCardHTML(c) {
  const colour = levelColor(c.level);
  const star = state.favourites.some(f => f.question === c.question) ? '<span class="play-star" aria-label="Starred">★</span>' : '';
  return `<div class="play-card" style="--lvl:${colour}">${star}<div class="play-cat" style="color:${labelColor(colour)}">${LEVEL_LABELS[c.level] || esc(c.level)}</div><p class="play-q">${esc(c.question)}</p></div>`;
}

function renderFavourites() {
  const el = document.getElementById('favsList');
  el.classList.toggle('play-grid', state.favourites.length > 0);
  el.innerHTML = state.favourites.length === 0
    ? '<div class="play-empty">Nothing starred yet. Tap the star on a card.</div>'
    : state.favourites.map(smallCardHTML).join('');
}
