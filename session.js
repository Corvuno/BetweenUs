// ── SESSION ──────────────────────────────────────────────────────────────────
// The session log (addToLog/renderLog), the ephemeral autosave slot, and the
// multi-slot "Sessions" store: separate saved sessions (e.g. one per person/
// pairing you play with) that each keep their own deck/position/settings and
// don't overwrite each other. serializeSession()/restoreSessionData() are the
// single source of truth for what a saved session captures and how it's put
// back, shared by the ephemeral autosave and every named slot.

// ── LOG ───────────────────────────────────────────────────────────────────────
function addToLog(card) {
  if (!card) return;
  if (state.loggedQuestions.has(card.id)) return;   // re-visiting via prev/next must not re-log
  state.loggedQuestions.add(card.id);
  /* Three can set a card already seen this pass beside the unseen ones; if it is
     picked it is already in the history and counted as seen — no second entry */
  if (state.sessionLog.slice(Math.max(state.seenFrom || 0, 0)).some(c => c.id === card.id)) return;
  state.sessionLog.push(entryOf(card));
  if (state.sessionLog.length === 3) spotlightBrightenOnce();
  renderLog();
}

/* Skip takes a card back out of the history list (the card was logged when it
   was shown). Returns what is needed to put it back (undo), or null. seenFrom
   is kept pointing at the same card. */
function removeFromLog(id) {
  let idx = -1;
  for (let i = state.sessionLog.length - 1; i >= 0; i--) if (state.sessionLog[i].id === id) { idx = i; break; }
  state.loggedQuestions.delete(id);
  if (idx < 0) return null;
  const entry = state.sessionLog.splice(idx, 1)[0];
  const movedSeenFrom = idx < state.seenFrom;
  if (movedSeenFrom) state.seenFrom--;
  renderLog();
  return { idx, entry, movedSeenFrom };
}
function restoreToLog(info) {
  if (!info) return;
  const at = Math.min(info.idx, state.sessionLog.length);
  state.sessionLog.splice(at, 0, info.entry);
  if (info.movedSeenFrom) state.seenFrom++;
  state.loggedQuestions.add(info.entry.id);
  renderLog();
}

function renderLog() {
  const el = document.getElementById('logList');
  el.classList.toggle('play-grid', state.sessionLog.length > 0);
  el.innerHTML = state.sessionLog.length === 0
    ? '<div class="play-empty">Nothing drawn yet.</div>'
    : state.sessionLog.map((c, i) => smallCardHTML(c, i)).reverse().join('');
}

/* What a saved evening holds: cards by their question number (deckIds, fullDeckIds, skippedSeen, sitOut), the
   log as {id, level, question}. Saves from before cards had numbers hold the wording (deckQuestions,
   fullDeckQuestions, wording in skippedSeen and sitOut); restoreSessionData reads both. */
function serializeSession() {
  return {
    deckIds: state.visibleDeck.map(c=>c.id),
    fullDeckIds: state.fullDeck.map(c=>c.id),
    position: state.currentIndex, toggles:[...state.activeToggles],
    safeMode: state.safeMode, spiceMode: state.spiceMode, randomMode: state.randomMode, cardLimit: state.cardLimit,
    activePreset: state.activePreset,
    sessionLog: window.LOG_PERSIST ? state.sessionLog : undefined,
    seenFrom: window.LOG_PERSIST ? state.seenFrom : undefined,
    skippedSeen: window.LOG_PERSIST ? [...state.skippedSeen] : undefined,
    handNo: window.LOG_PERSIST ? state.handNo : undefined,
    sitOut: window.LOG_PERSIST ? state.sitOut : undefined,
    savedAt: new Date().toISOString(),
  };
}

/* A saved reference to a card: its number, or (older saves) its wording. The live card's number, or undefined. */
function savedCardId(ref) {
  if (typeof ref === 'number') return ref;
  if (typeof ref === 'string' && /^\d+$/.test(ref)) return +ref;
  return cardByWording(ref)?.id;
}
/* A saved hand's live cards. A card that is retired or no longer matches is left out, and the position moves
   with it so the player lands on the same card they were on. */
function liveHand(refs, position) {
  const cards = refs.map(ref => CARDS_BY_ID.get(savedCardId(ref)) ?? null);
  const at = position ?? -1;
  return { cards: cards.filter(Boolean), position: at < 0 ? -1 : cards.slice(0, at).filter(Boolean).length };
}

// Shared by the silent boot-time resume and openStoredSession() — puts a
// serializeSession() snapshot back into state and the DOM.
function restoreSessionData(data) {
  if (!data) return;
  try {
    state.safeMode=data.safeMode||false; state.spiceMode=data.spiceMode||false;
    state.randomMode=data.randomMode||'wild'; state.cardLimit=data.cardLimit;
    shuffleModeIdx=SHUFFLE_MODES.indexOf(state.randomMode); if(shuffleModeIdx<0) shuffleModeIdx=7;
    updateShuffleDisplay();
    // ignore keys that no longer exist (e.g. a retired category like "abyss")
    state.activeToggles=new Set((data.toggles||[]).filter(l => Object.prototype.hasOwnProperty.call(CATEGORIES, l)));
    if (MASTER_SAFE) SAFE_BLOCKED_LEVELS.forEach(l => state.activeToggles.delete(l));
    // restore preset highlight
    state.activePreset = data.activePreset || '';
    showSubtitle(PRESETS[state.activePreset]);
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === state.activePreset));
    // restore session log
    if (window.LOG_PERSIST && Array.isArray(data.sessionLog)) {
      state.sessionLog = data.sessionLog.filter(c => typeof c?.question === 'string' && typeof c?.level === 'string').map(currentEntry);
      state.seenFrom = Math.min(Math.max(+data.seenFrom || 0, 0), state.sessionLog.length);
      state.loggedQuestions = new Set(state.sessionLog.map(c => c.id).filter(Number.isInteger));
      state.skippedSeen = new Set((Array.isArray(data.skippedSeen) ? data.skippedSeen : []).map(savedCardId).filter(Number.isInteger));
      state.handNo = Math.max(+data.handNo || 0, 0);
      state.sitOut = Object.fromEntries(Object.entries(data.sitOut && typeof data.sitOut === 'object' ? data.sitOut : {})
        .map(([ref, handNo]) => [savedCardId(ref), handNo]).filter(([id]) => Number.isInteger(id)));
      renderLog();
    }
    // sync spice glyph
    if (window.syncSpiceGlyph) window.syncSpiceGlyph();
    updateAfterDarkBtn(); applyToggleUI();
    const hand = liveHand(data.deckIds ?? data.deckQuestions ?? [], data.position);
    state.visibleDeck=hand.cards;
    state.fullDeck=liveHand(data.fullDeckIds ?? data.fullDeckQuestions ?? data.deckIds ?? data.deckQuestions ?? []).cards;
    state.currentIndex=hand.position;
    state.reachedIdx=state.currentIndex;
    syncLimitButtons();
    updateDeckInfo(); updateDrawMore(); renderProgress();
    setCardDisplay(state.currentIndex>=0 ? state.visibleDeck[state.currentIndex] : null);
    renderShell();
  } catch(e) { console.error('restoreSessionData:',e); }
}

// ═══════════════════════════════════════════════════════════
// AUTO-SAVE — called from flipToCard on every card advance
// ═══════════════════════════════════════════════════════════
function autoSaveSession() {
  if (state.queryDeckActive) return;   // a ?Q= test deck never touches the real saved session
  if (!state.visibleDeck.length) return;
  try {
    const data = serializeSession();
    localStorage.setItem('bu-session', JSON.stringify(data));
    // Mirror into the bound stored slot, if any, so re-opening it later
    // (Played, under Saved) reflects the cards drawn since it was opened —
    // not just the moment it was stored.
    if (state.activeSessionId) {
      const list = getStoredSessions();
      const entry = list.find(s => s.id === state.activeSessionId);
      if (entry) {
        entry.data = data;
        entry.savedAt = data.savedAt;
        saveStoredSessions(list);
        renderSessionsList();
      } else {
        setActiveSessionId('');   // bound slot was deleted elsewhere
      }
    }
  } catch(e) {}
}

// Silent, automatic — no button to notice, no "Continue?" step. Called once
// at boot; if nothing was ever saved this is a no-op and the default preset
// draw from ui.js's init block stands.
function autoResumeSession() {
  try { state.activeSessionId = localStorage.getItem('bu-active-session-id') || ''; }
  catch(e) { state.activeSessionId = ''; }
  try {
    const v = localStorage.getItem('bu-session');
    if (!v) return;
    restoreSessionData(JSON.parse(v));
  } catch(e) { console.error('autoResumeSession:',e); }
}

// ═══════════════════════════════════════════════════════════
// NAMED SESSIONS — multiple independent saved slots (bu-sessions), so
// playing with one person doesn't overwrite where you left off with another.
// ═══════════════════════════════════════════════════════════
function getStoredSessions() {
  try { return JSON.parse(localStorage.getItem('bu-sessions') || '[]'); }
  catch(e) { return []; }
}
function saveStoredSessions(list) {
  try { localStorage.setItem('bu-sessions', JSON.stringify(list)); } catch(e) {}
}
function setActiveSessionId(id) {
  state.activeSessionId = id || '';
  try {
    if (id) localStorage.setItem('bu-active-session-id', id);
    else localStorage.removeItem('bu-active-session-id');
  } catch(e) {}
}
function presetDisplayName(preset) {
  if (preset === 'colbertmode') return 'Colbert';
  const btn = document.querySelector('.mode-btn[data-mode="' + preset + '"]');
  return btn ? btn.textContent.trim() : (preset || 'Custom');
}
// The evening's name: the saved one it is playing, or the name Save for later would give it.
function eveningName() {
  const saved = state.activeSessionId && getStoredSessions().find(s => s.id === state.activeSessionId);
  return saved ? saved.name : autoSessionName();
}
function autoSessionName() {
  const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return presetDisplayName(state.activePreset) + ' · ' + dateStr;
}

// Stores what's currently live as a named slot. If a slot is already bound
// (state.activeSessionId), updates that same slot in place rather than
// creating a duplicate — matches "open it, keep playing, it stays live".
function storeCurrentSession(customName) {
  if (!state.visibleDeck.length) return null;
  const list = getStoredSessions();
  const data = serializeSession();
  const existing = state.activeSessionId ? list.find(s => s.id === state.activeSessionId) : null;
  let id;
  if (existing) {
    existing.data = data;
    existing.savedAt = data.savedAt;
    if (customName) existing.name = customName;
    id = existing.id;
  } else {
    id = 'sess-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    list.push({ id, name: customName || autoSessionName(), savedAt: data.savedAt, data });
    setActiveSessionId(id);
  }
  saveStoredSessions(list);
  renderSessionsList();
  return id;
}

function renameStoredSession(id, name) {
  if (!name || !name.trim()) return;
  const list = getStoredSessions();
  const entry = list.find(s => s.id === id);
  if (!entry) return;
  entry.name = name.trim();
  saveStoredSessions(list);
  renderSessionsList();
}

function deleteStoredSession(id) {
  const list = getStoredSessions().filter(s => s.id !== id);
  saveStoredSessions(list);
  if (state.activeSessionId === id) setActiveSessionId('');
  renderSessionsList();
}

// Loads a stored slot into the live view and binds it as active — from here
// on, autoSaveSession() keeps writing new cards back into this same slot.
function openStoredSession(id) {
  const list = getStoredSessions();
  const entry = list.find(s => s.id === id);
  if (!entry) return;
  restoreSessionData(entry.data);
  setActiveSessionId(id);
  renderSessionsList();
}

function renderSessionsList() {
  const el = document.getElementById('sessionsList');
  if (!el) return;
  const list = getStoredSessions().slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  el.innerHTML = list.length === 0
    ? '<div class="play-empty">Nothing saved yet.</div>'
    : list.map(s => {
        const isActive = s.id === state.activeSessionId;
        const when = new Date(s.savedAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
        return `<div class="play-save${isActive ? ' now' : ''}" data-id="${esc(s.id)}">
          <button type="button" class="play-save-main" data-action="open">
            <span class="play-save-name">${esc(s.name)}${isActive ? '<span class="play-save-now">playing now</span>' : ''}</span>
            <span class="play-save-meta">Saved ${when}</span>
          </button>
          <div class="play-save-act"><button type="button" data-action="rename">Rename</button><button type="button" data-action="delete">Delete</button></div>
        </div>`;
      }).join('');
}
