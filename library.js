// ── LIBRARY ──────────────────────────────────────────────────────────────────
// The favourites collection: load from localStorage and render its drawer
// list. (Starring/unstarring the current card lives
// in card.js — this file owns the saved collections, not the per-card toggle.)


/* Saved list from localStorage, or [] when nothing usable is stored: missing,
   unreadable, not JSON, not a list. Entries without a level and question are dropped. Each entry comes
   back as {id, level, question}: by its id, or (saved before cards had numbers) by its wording once;
   a card since retired keeps the wording it was saved with. Two entries for one card become one. A list
   with entries from before cards had numbers is written back at once with their numbers (saved wording kept),
   so the wording match happens only once. */
function readSavedCards(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(saved)) return [];
    const valid = saved.filter(c => typeof c?.question === 'string' && typeof c?.level === 'string');
    const seen = new Set();
    const kept = valid.map(c => ({ saved: c, entry: currentEntry(c) }))
      .filter(({ entry }) => { const k = entry.id ?? `q:${entry.question}`; return !seen.has(k) && seen.add(k); });
    if (kept.length !== valid.length || valid.some(c => !('id' in c))) {
      try { localStorage.setItem(key, JSON.stringify(kept.map(({ saved: c, entry }) => ({ ...c, id: entry.id })))); }
      catch (error) { console.warn(`Could not write "${key}" with card numbers:`, error); }
    }
    return kept.map(({ entry }) => entry);
  } catch (error) {
    console.warn(`Ignoring unreadable saved data "${key}":`, error);
    return [];
  }
}

/* Where a card (or a log entry) sits in the favourites, or -1. Entries are matched by id; an old entry no card
   matched has none, so it is matched by its saved wording. */
function favouriteIndex(c) {
  if (!c) return -1;
  return state.favourites.findIndex(f => Number.isInteger(c.id) ? f.id === c.id : (!Number.isInteger(f.id) && f.question === c.question));
}
function isFavouriteCard(c) { return favouriteIndex(c) >= 0; }

function loadFavourites() {
  state.favourites = readSavedCards('bu-favourites');
  updateStarUI();
}


// A drawn or starred card as a small card: its colour line on top, a faint wash of the colour, the name of
// its group, the question, and a small star when it is starred. A tap brings the card back onto the card screen
// (presentation.js); i is its place in the list it came from.
function smallCardHTML(c, i) {
  const colour = levelColor(c.level);
  const star = isFavouriteCard(c) ? '<span class="play-star" aria-label="Starred">★</span>' : '';
  return `<button type="button" class="play-card" data-i="${i}" style="--lvl:${colour}">${star}<span class="play-cat" style="color:${labelColor(colour)}">${LEVEL_LABELS[c.level] || esc(c.level)}</span><span class="play-q">${esc(c.question)}</span></button>`;
}

function renderFavourites() {
  const el = document.getElementById('favsList');
  el.classList.toggle('play-grid', state.favourites.length > 0);
  el.innerHTML = state.favourites.length === 0
    ? '<div class="play-empty">Nothing starred yet. Tap the star on a card.</div>'
    : state.favourites.map(smallCardHTML).join('');
}
