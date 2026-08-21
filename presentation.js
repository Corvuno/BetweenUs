// ── PRESENTATION ─────────────────────────────────────────────────────────────
// Rendering that isn't specific to one card or one selection: the mood engine
// (computeMood and its supporting lookup tables), progress dots, the app
// shell's token line, party-mode display, drawers, language switching, and
// the end-of-hand/end-of-round summaries — plus the listeners for the
// controls that directly trigger this domain's own rendering (language
// switch, drawer open/close buttons). (The app's boot sequence lives in ui.js.)


/* ── Mood: the sliders set the energy, the selected chapters set the register ── */
/* Mood lives in a real 3D space, not a 2D grid with a tie-breaker bolted on:

     Intensity   Easy .......................... Intense   (the dial)
     Focus       Self ........................... Us       (the dial)
     Register    Arrive → Surface → Deep → Us → After Dark  (which chapters)

   Register is new: it is not the Playful/Intimate/Reflective trait blend
   from before (that only ever broke ties inside a fixed 2D cell, which is
   why mixing chapters barely moved the result — it wasn't a real axis, it
   was a tiebreaker). Register is the chapters' own position along the
   journey they already sit in on the Play screen, averaged across whatever
   is active. Two selections that land on the same Intensity and Focus but
   come from different chapters now genuinely end up in different places,
   because Register is a full third coordinate, not a fallback.

   There are no bands. A word is not looked up in a grid cell; it is the
   nearest of ~28 fixed points scattered through the cube (Intensity,
   Focus, Register), by plain distance. That is also why "5 steps, not 3"
   stops being a real question — nothing is bucketed into 3 or 5 of
   anything; the coordinates are continuous, so the answer changes exactly
   as smoothly as the dials move. */
/* Which chapter each category belongs to, so mixing chapters of very
   different sizes doesn't let the bigger one drown out the smaller one, and
   a flat average across raw categories can't let one outvote the rest.
   Register stays coarser than the Play screen's chapter list on purpose —
   The Surface and Beneath the Surface are two separate chapters to choose
   from, but one "room" for mood purposes, same as Colbert/The 36/Magical/
   Backup, which have no chapter of their own and fold into whichever room
   they read closest to. Kept in sync with CHAPTERS in the controller
   script below (past/roots moved from here into 'deeper' — a childhood
   history question reads closer to Into the Deep's room than to Beneath
   the Surface's). */
const LEVEL_CHAPTER = {};
[['warmup',['quick','warm','colbert','magic']],
 ['findout',['culture','life','home','work','unwind','world','self','mind','body','values','wish',
             'family','spirit','connect','friends','date','attract','aron','backup']],
 ['deeper',['past','roots','deep','raw','shadow','grief']],
 ['aboutus',['us','usfriend','uslove']],
 ['afterdark',['usintimate','flesh','carnal','bare','kinks','abyss']],
].forEach(([id,ls]) => ls.forEach(l => LEVEL_CHAPTER[l] = id));

// Depth dial → 5 bands: how exposed the conversation gets.
function depthBand(depth01) {
  if (depth01 < .20) return 'light';
  if (depth01 < .40) return 'easy';
  if (depth01 < .60) return 'open';
  if (depth01 < .80) return 'deep';
  return 'raw';
}

// Self/Us dial → 5 bands: who the conversation is about.
function focusBand(focus01) {
  if (focus01 < .20) return 'self';
  if (focus01 < .40) return 'mostlySelf';
  if (focus01 < .60) return 'balanced';
  if (focus01 < .80) return 'mostlyUs';
  return 'us';
}

/* Which room the selected chapters put you in — a rule, not an average, so
   very different combinations of categories can't collapse into the same
   blended number. Pure After Dark is its own room; After Dark mixed with
   anything else is a distinct "charged" room rather than washing out into
   whichever chapter has more categories active. */
function registerState(activeLevels) {
  const chapters = new Set();
  activeLevels.forEach(l => { const ch = LEVEL_CHAPTER[l]; if (ch) chapters.add(ch); });

  const hasWarmup    = chapters.has('warmup');
  const hasFindout   = chapters.has('findout');
  const hasDeeper    = chapters.has('deeper');
  const hasAboutUs   = chapters.has('aboutus');
  const hasAfterDark = chapters.has('afterdark');
  const count = chapters.size;

  if (hasAfterDark && count === 1) return 'afterdark';
  if (hasAfterDark && count > 1)   return 'charged';

  if (hasAboutUs)  return 'betweenus';
  if (hasDeeper)   return 'deepwater';
  if (hasFindout)  return 'surface';
  if (hasWarmup)   return 'arrive';
  return 'arrive';
}

// Token-line colour, reused rather than invented: the Mood token takes the
// same colour as the chapter/room registerState() says the selection is in
// (the exact --ch colours the chapters already wear in the Shape pane), and
// the Shuffle token takes the colour of what its bias actually leans toward
// (Deep -> the same purple as leaning into Into the Deep; Breadth -> the
// teal already used for Connect, since it spans everything at once; Arc ->
// the warm coral of Attract, for its warm-in/warm-out journey). Wild has no
// lean, so it stays uncoloured — the absence of a colour here IS the fact
// about it. Cards is a magnitude, not a kind of anything, so it never gets
// one either; forcing a colour onto it would be exactly the "random, not
// logical" pattern this table exists to avoid.
// The Shape pane's live sentence — a plain-language read of where the round
// actually sits, in the player's own terms (no "depth band"/"focus band"
// talk). Runs through the same blendedBands() as the Mood token, so cranking
// a dial with only light categories selected (Arrive alone, say) can't claim
// "raw" here either — the words follow what could really get drawn, not
// just where the slider happens to sit. Never assumes exactly two people:
// the deck plays from two up to a full table (see the "How to play" tiles),
// so "each other"/"the table" stands in for whoever showed up.
const DEPTH_PHRASE = {
  light: ['A', 'light, easy'], easy: ['An', 'easygoing'], open: ['An', 'honest, open'],
  deep: ['A', 'deep'], raw: ['A', 'raw, no-holds-barred'],
};
const FOCUS_PHRASE = {
  self: 'turned inward, everyone in their own head',
  mostlySelf: 'leaning personal, but out loud',
  balanced: 'split evenly between the personal and the shared',
  mostlyUs: 'leaning toward what connects you',
  us: "entirely about what's between you",
};
function roundSentence(activeLevels, intensity01, focus01) {
  const { depth, focus } = blendedBands(activeLevels, intensity01, focus01);
  const [art, adj] = DEPTH_PHRASE[depth];
  return `${art} ${adj} evening, ${FOCUS_PHRASE[focus]}.`;
}

const REGISTER_COLOR = {
  arrive: '#d9a441', surface: '#45a0b8', deepwater: '#8f74b8',
  betweenus: '#d97a92', afterdark: '#ff2f2f', charged: '#ff4f7a',
};
// Deep leans toward one place (Into the Deep's own purple) so it gets a flat
// colour, a real single lean. Wild has no bias at all, so it stays
// uncoloured. Arc genuinely moves through three rooms (see its icon, which
// keeps the full three-colour journey), but a gradient on the one row meant
// to stay calm read as noise, and no colour at all read as "no lens" — the
// same thing Wild already says. One flat colour splits the difference: a
// blend of the warm and cool ends of its own journey (steering clear of
// gold, which already means "no lean" here, and of Deep's own purple).
// Breadth gets one back too — the same teal its own icon already leans on
// (Connect's colour), standing in for "touches everything at once" the way
// Arc's blend stands in for "moves through a few rooms in sequence".
const SHUFFLE_COLOR = { deep: '#8f74b8', arc: '#6a8ab8', breadth: '#65c9b0' };

// The 5×5 mood word for each of the six rooms — depth band × focus band.
// Each cell holds 2 words, not 1 — see the note on computeMood below for why.
const MOOD_GRID = {
  arrive: {
    light: { self:['Easy','Easygoing','Mellow'], mostlySelf:['Curious','Wondering','Intrigued'], balanced:['Playful','Merry','Breezy'], mostlyUs:['Friendly','Amiable','Cordial'], us:['Warm','Kind','Gracious'] },
    easy:  { self:['Relaxed','Unhurried','Settled'], mostlySelf:['Curious','Attentive','Engaged'], balanced:['Genial','Amicable','Congenial'], mostlyUs:['Social','Sociable','Convivial'], us:['Fond','Warm','Caring'] },
    open:  { self:['Careful','Weighed','Measured'], mostlySelf:['Engaged','Invested','Present'], balanced:['Open','Candid','Clear'], mostlyUs:['Familiar','Settled','Easy'], us:['Close','Near','Bonded'] },
    deep:  { self:['Grounded','Steady','Centered'], mostlySelf:['Sincere','Earnest','Genuine'], balanced:['Honest','Frank','Truthful'], mostlyUs:['Trusting','Assured','Secure'], us:['Tender','Gentle','Soft'] },
    raw:   { self:['Direct','Blunt','Raw'], mostlySelf:['Candid','Raw','Unmasked'], balanced:['Candid','Frank','Direct'], mostlyUs:['Exposed','Uncovered','Bare'], us:['Bare','Stripped','Stark'] },
  },
  surface: {
    light: { self:['Bright','Sunny','Sparkling'], mostlySelf:['Probing','Curious','Intrigued'], balanced:['Lively','Animated','Buoyant'], mostlyUs:['Social','Outgoing','Sunny'], us:['Cheerful','Upbeat','Sunny'] },
    easy:  { self:['Wondering','Musing','Unhurried'], mostlySelf:['Curious','Keen','Engaged'], balanced:['Talkative','Chatty','Easygoing'], mostlyUs:['Welcoming','Kind','Warm'], us:['Loving','Warm','Fond'] },
    open:  { self:['Musing','Pensive','Absorbed'], mostlySelf:['Personal','Candid','Frank'], balanced:['Alive','Vivid','Animated'], mostlyUs:['Connected','Linked','Bonded'], us:['Close','Near','Attuned'] },
    deep:  { self:['Searching','Probing','Yearning'], mostlySelf:['Pensive','Inward','Musing'], balanced:['Deep','Weighty','Serious'], mostlyUs:['Trusting','Assured','Devoted'], us:['Intimate','Close','Held'] },
    raw:   { self:['Piercing','Cutting','Stinging'], mostlySelf:['Unsettled','Shaken','Rattled'], balanced:['Sharp','Incisive','Keen'], mostlyUs:['Revealing','Exposing','Bared'], us:['Exposed','Bare','Naked'] },
  },
  deepwater: {
    light: { self:['Quiet','Still','Hushed'], mostlySelf:['Attentive','Watchful','Present'], balanced:['Measured','Careful','Weighed'], mostlyUs:['Gentle','Mild','Kind'], us:['Soft','Tender','Warm'] },
    easy:  { self:['Inward','Musing','Pensive'], mostlySelf:['Careful','Weighed','Settled'], balanced:['Resonant','Stirring','Moving'], mostlyUs:['Caring','Warm','Devoted'], us:['Held','Cradled','Sheltered'] },
    open:  { self:['Musing','Inward','Pensive'], mostlySelf:['Searching','Probing','Reaching'], balanced:['Open','Frank','Candid'], mostlyUs:['Fragile','Unguarded','Bare'], us:['Trusting','Assured','Secure'] },
    deep:  { self:['Deep','Weighty','Profound'], mostlySelf:['Exposed','Bare','Uncovered'], balanced:['Serious','Grave','Solemn'], mostlyUs:['Tender','Gentle','Soft'], us:['Intimate','Close','Devoted'] },
    raw:   { self:['Raw','Stripped','Unmasked'], mostlySelf:['Exposed','Uncovered','Bared'], balanced:['Piercing','Cutting','Stinging'], mostlyUs:['Fragile','Brittle','Delicate'], us:['Naked','Bare','Exposed'] },
  },
  betweenus: {
    light: { self:['Sweet','Cherished','Adoring'], mostlySelf:['Fond','Loving','Warm'], balanced:['Warm','Kind','Cordial'], mostlyUs:['Close','Near','Devoted'], us:['Tender','Gentle','Soft'] },
    easy:  { self:['Personal','Candid','Easy'], mostlySelf:['Familiar','Easy','Cozy'], balanced:['Connected','Linked','Bonded'], mostlyUs:['Loving','Warm','Fond'], us:['Safe','Secure','Sheltered'] },
    open:  { self:['Open','Frank','Candid'], mostlySelf:['Trusting','Assured','Secure'], balanced:['Intimate','Close','Devoted'], mostlyUs:['Mutual','Shared','Aligned'], us:['Seen','Witnessed','Known'] },
    deep:  { self:['Honest','Frank','Truthful'], mostlySelf:['Bare','Unguarded','Naked'], balanced:['Devoted','Committed','Loyal'], mostlyUs:['Loyal','Guarding','Cradling'], us:['Bound','Tied','Anchored'] },
    raw:   { self:['Exposed','Bare','Naked'], mostlySelf:['Exposed','Uncovered','Stripped'], balanced:['Reckoning','Facing','Grave'], mostlyUs:['Bare','Stripped','Naked'], us:['All-In','Open','Whole'] },
  },
  afterdark: {
    light: { self:['Sparked','Kindled','Charged'], mostlySelf:['Teasing','Playful','Coy'], balanced:['Glowing','Radiant','Warming'], mostlyUs:['Magnetic','Pulling','Alluring'], us:['Drawn','Pulled','Beckoned'] },
    easy:  { self:['Heated','Ardent','Sultry'], mostlySelf:['Flirty','Coy','Enticing'], balanced:['Heated','Simmering','Sizzling'], mostlyUs:['Inviting','Welcoming','Beckoning'], us:['Close','Near','Warm'] },
    open:  { self:['Bold','Daring','Brazen'], mostlySelf:['Electric','Live-Wire','Charged'], balanced:['Charged','Humming','Buzzing'], mostlyUs:['Hungry','Craving','Wanting'], us:['Intimate','Close','Fused'] },
    deep:  { self:['Sultry','Simmering','Molten'], mostlySelf:['Velvet','Silken','Lush'], balanced:['Intense','Fervent','Ardent'], mostlyUs:['Devouring','Consuming','Ravenous'], us:['Devoted','Claiming','Owning'] },
    raw:   { self:['Primal','Feral','Feverish'], mostlySelf:['Untamed','Wild','Reckless'], balanced:['Fevered','Blazing','Scorching'], mostlyUs:['Ravenous','Voracious','Hungry'], us:['Consumed','Overtaken','Rapt'] },
  },
  charged: {
    light: { self:['Naughty','Playful','Impish'], mostlySelf:['Coy','Sly','Loaded'], balanced:['Sparked','Kindled','Buzzy'], mostlyUs:['Tense','Taut','Charged'], us:['Flirty','Teasing','Coy'] },
    easy:  { self:['Keen','Sharp','Simmering'], mostlySelf:['Teasing','Sparky','Charged'], balanced:['Electric','Live-Wire','Humming'], mostlyUs:['Magnetic','Pulling','Drawing'], us:['Close','Near','Warm'] },
    open:  { self:['Bold','Daring','Reckless'], mostlySelf:['Wild','Volatile','Live-Wire'], balanced:['Charged','Wired','Buzzing'], mostlyUs:['Pulling','Drawing','Wanting'], us:['Intimate','Close','Fused'] },
    deep:  { self:['Restless','Unsettled','Wound-Up'], mostlySelf:['Tempted','Drawn','Craving'], balanced:['Intense','Fervent','Charged'], mostlyUs:['Blunt','Frank','Unguarded'], us:['Exposed','Uncovered','Bared'] },
    raw:   { self:['Candid','Raw','Loaded'], mostlySelf:['Edged','Sharpened','Reckless'], balanced:['Volatile','Explosive','Charged'], mostlyUs:['Revealing','Exposing','Bared'], us:['Bare','Stripped','Naked'] },
  },
};

// Deterministic pick out of a cell's word list, keyed to exactly which
// categories are active (not the dial) — same selection always gives the
// same word (no randomness to fight), but two selections that land in the
// identical (register, depth band, focus band) cell can still read
// differently, instead of collapsing onto one word every time the dial
// doesn't move. This is the third axis: register (which room) × depth/focus
// band (the dial) × this fingerprint (which categories, within the cell).
// A hash-only pick still repeats whenever a click leaves the register and
// band unmoved (common — toggling a category within the same chapter, or
// adding a second After Dark pick to an already-Charged one, rarely shifts
// either): the hash is unrelated to the click, so it's a coin flip whether
// it lands on the same word again. lastMoodWord breaks that; lastMoodInputKey
// guards it — renderShell() gets called from places that don't touch mood
// state at all (resize, drawer open, party-mode toggle), and without the
// guard, re-rendering the *same* selection twice in a row would flip the
// word for no reason (it'd always look "different from lastMoodWord", even
// though nothing about the round changed). Only a genuinely new signature
// is allowed to advance past a repeat.
let lastMoodInputKey = null;
let lastMoodWord = null;
function pickFromCell(cell, levels, signature) {
  if (signature === lastMoodInputKey) return lastMoodWord;
  const key = [...levels].sort().join(',');
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  let idx = h % cell.length;
  if (cell.length > 1 && cell[idx] === lastMoodWord) idx = (idx + 1) % cell.length;
  lastMoodWord = cell[idx];
  lastMoodInputKey = signature;
  return lastMoodWord;
}

// Depth/focus bands stay dial-led (the dial is what the player actually
// reached for), tinted 70/30 by what's actually selected — so cranking a
// dial to its extreme with only light categories active (Arrive alone, say)
// can't claim "raw" on its own; the selection pulls back toward what could
// really get drawn. Shared by computeMood (the token's mood word) and
// roundSentence (Shape's live line), so the two never disagree about what
// the current dial+selection combination actually means.
function blendedBands(activeLevels, sliderIntensity01, sliderFocus01){
  const levels = activeLevels.filter(l => DECK_LEVELS.has(l));
  if (!levels.length) return { depth01: sliderIntensity01, focus01: sliderFocus01, depth: depthBand(sliderIntensity01), focus: focusBand(sliderFocus01) };
  const avgDepth = levels.reduce((s,l) => s + (levelIntensity(l)-1)/6, 0) / levels.length;
  const avgFocus = levels.reduce((s,l) => s + (levelFocus(l)+1)/2,     0) / levels.length;
  const depth01 = Math.max(0, Math.min(1, .7*sliderIntensity01 + .3*avgDepth));
  const focus01 = Math.max(0, Math.min(1, .7*sliderFocus01     + .3*avgFocus));
  return { depth01, focus01, depth: depthBand(depth01), focus: focusBand(focus01) };
}

/* Mood = which room the selected chapters put you in (register), crossed
   with how exposed (depth band) and who it's about (focus band). Rule-based
   lookup, not a nearest-anchor search over an averaged coordinate — mixing
   chapters of very different sizes, or diluting After Dark into a single
   other category, no longer blends into a washed-out midpoint word. */
function computeMood(activeLevels, sliderIntensity01, sliderFocus01){
  const levels = activeLevels.filter(l => DECK_LEVELS.has(l));
  if (!levels.length) return null;

  const register = registerState(levels);
  const { depth, focus } = blendedBands(levels, sliderIntensity01, sliderFocus01);

  // The real fix for the repeat: within whichever cell the dial+selection
  // lands on, which of its 2 words shows is keyed to exactly which
  // categories are active, not just the coarse band — so "same dial, same
  // register" no longer means "same word" the instant the selection differs.
  const signature = register + '|' + depth + '|' + focus + '|' + [...levels].sort().join(',');
  return pickFromCell(MOOD_GRID[register][depth][focus], levels, signature);
}

// The round as a line: one dot per card, in its category colour, placed by depth.
// Above ~48 cards the dots stop being readable, so the summary keeps to words.
function drawRoundTrace(cards) {
  if (!cards || cards.length < 2 || cards.length > 48) return '';
  const W = 240, H = 62, PAD = 10;
  const step = (W - PAD * 2) / (cards.length - 1);
  const pts = cards.map((c, i) => [
    +(PAD + i * step).toFixed(1),
    +(52 - (levelDepth(c.level) - 1) * 8).toFixed(1)
  ]);
  const line = pts.map(p => p.join(',')).join(' ');
  const dots = pts.map((p, i) =>
    `<circle cx="${p[0]}" cy="${p[1]}" r="${cards.length > 24 ? 2.2 : 3}" fill="${levelColor(cards[i].level)}"/>`
  ).join('');
  return `<svg class="sic-trace" viewBox="0 0 ${W} ${H}" role="img" aria-label="The round you drew: ${cards.length} cards, from light to deep.">`
       + `<line x1="${PAD}" y1="58" x2="${W - PAD}" y2="58" stroke="currentColor" stroke-width="1" opacity=".12"/>`
       + `<polyline points="${line}" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".28"/>`
       + dots + `</svg>`;
}

// Sample colors from whatever categories are actually active right now —
// not the literal order a real draw would deal them (that would preview
// the round and spoil it), just a representative "these hues are in play"
// read, so Breadth/Arc's dots mean something instead of being decoration.
// Falls back to a fixed palette when nothing's active yet to sample from.
function activeCategoryColors(n, fallback) {
  const levels = Array.from(state.activeToggles || []);
  if (!levels.length) return fallback;
  const out = [];
  for (let i = 0; i < n; i++) out.push(levelColor(levels[i % levels.length]));
  return out;
}

// The four shuffle modes, drawn as the shape of a round.
function shuffleShapeSVG(mode) {
  const d = 'r="2.4" fill="currentColor"';
  const breadthFallback = ['#d58b34','#f3c33c','#669bbb','#65c9b0','#96b87b','#df7a91','#8066e1','#4dbebe'];
  const arcFallback     = ['#d9a441','#b48c7c','#8f74b8','#6a8ab8','#45a0b8'];
  const shapes = {
    wild: `<circle cx="6" cy="20" ${d}/><circle cx="18" cy="7" ${d}/><circle cx="30" cy="23" ${d}/><circle cx="42" cy="11" ${d}/>`
        + `<circle cx="54" cy="25" ${d}/><circle cx="66" cy="9" ${d}/><circle cx="78" cy="19" ${d}/><circle cx="90" cy="13" ${d}/>`,
    deep: `<polyline points="6,23 18,20 30,17 42,14 54,11 66,9 78,7 90,5" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".3"/>`
        + `<circle cx="6" cy="23" ${d}/><circle cx="18" cy="20" ${d}/><circle cx="30" cy="17" ${d}/><circle cx="42" cy="14" ${d}/>`
        + `<circle cx="54" cy="11" ${d}/><circle cx="66" cy="9" ${d}/><circle cx="78" cy="7" ${d}/><circle cx="90" cy="5" ${d}/>`,
    breadth: activeCategoryColors(8, breadthFallback)
        .map((c, i) => `<circle cx="${6 + i * 12}" cy="15" r="2.6" fill="${c}"/>`).join(''),
    // Same idea as Breadth's own dots, not currentColor — a colored path
    // through a few of what's actually active, not the exact chapter
    // colours it used to be hardcoded to.
    arc: (() => {
      const pts = [[5,24],[26,9],[48,6],[70,9],[91,24]];
      const cols = activeCategoryColors(5, arcFallback);
      const path = `<path d="M5 24 C 20 24 22 6 48 6 S 76 24 91 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".35"/>`;
      return path + pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${cols[i]}"/>`).join('');
    })(),
  };
  if (!shapes[mode]) return '';
  return `<svg class="smp-shape" viewBox="0 0 96 30" aria-hidden="true">${shapes[mode]}</svg>`;
}



// Dot size steps down as the deck grows, so a 5- or 10-card arc gets big,
// colorful dots while a 40-card round still fits on one line.
const DOT_SIZE_STEPS = [
  [8,  10, 8],
  [14, 8,  6],
  [24, 6,  5],
  [36, 5,  4],
  [Infinity, 4, 3],
];
// `currentOverride`, when given, replaces state.currentIndex for this render
// only — used by the end-of-round summary to show every card as passed
// without a "current" dot, without touching real session position.

function renderProgress(currentOverride) {
  const container = document.getElementById('progress');
  const deckLen = state.visibleDeck.length;
  container.innerHTML = '';
  const MAX_DOTS = 60;
  const cur = currentOverride === undefined ? state.currentIndex : currentOverride;
  if (deckLen <= MAX_DOTS) {
    // One dot per card. Passed and current cards reveal their category
    // colour; cards still ahead stay neutral gold so the shape of what's
    // coming isn't spoiled.
    const [, size, gap] = DOT_SIZE_STEPS.find(([max]) => deckLen <= max);
    container.style.setProperty('--dot-size', size + 'px');
    container.style.setProperty('--dot-gap', gap + 'px');
    for (let i = 0; i < deckLen; i++) {
      const card = state.visibleDeck[i];
      const dot = document.createElement('div');
      const isSeen    = i < cur;
      const isCurrent = i === cur;
      dot.className = 'progress-dot' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
      if (isSeen || isCurrent) dot.style.setProperty('--dot-color', levelColor(card.level));
      container.appendChild(dot);
    }
  } else {
    // Large decks (e.g. 'All' in Everything, 300+ cards): a fixed-width
    // window of real per-card dots slides along the deck instead of
    // collapsing everything into averaged buckets. It always keeps one
    // neutral "next" dot in view, and drops the oldest passed dot off the
    // left edge as you advance — a continuous band, not a dulled-down summary.
    const WINDOW = 20;
    container.style.setProperty('--dot-size', '7px');
    container.style.setProperty('--dot-gap', '6px');
    const windowStart = Math.max(0, Math.min(cur - (WINDOW - 2), deckLen - WINDOW));
    const windowEnd = Math.min(deckLen, windowStart + WINDOW);
    for (let i = windowStart; i < windowEnd; i++) {
      const card = state.visibleDeck[i];
      const dot = document.createElement('div');
      const isSeen    = i < cur;
      const isCurrent = i === cur;
      dot.className = 'progress-dot' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
      if (isSeen || isCurrent) dot.style.setProperty('--dot-color', levelColor(card.level));
      container.appendChild(dot);
    }
  }
}

// ── SAFE MODE & PRESETS ───────────────────────────────────────────────────────

function updateShuffleDisplay() {
  const name = SHUFFLE_MODES[shuffleModeIdx] || state.randomMode;
  state.randomMode = name;
  // Reflect the active mode straight onto the Shuffle token value.
  const vo = document.getElementById('valOrder');
  if (vo) vo.textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

// setCardDisplay — updates card face, accent bar, and fullscreen sync

function updatePartyDisplay(card) {
  const pq  = document.getElementById('party-question');
  const pl  = document.getElementById('party-level');
  const pn  = document.getElementById('party-number');
  const pa  = document.getElementById('party-accent');
  if (!card) {
    if (pq) pq.textContent = 'Draw a card to begin.';
    if (pl) { pl.textContent=''; pl.style.color=''; }
    if (pn) pn.textContent = '';
    if (pa) pa.style.background = '';
    return;
  }
  const color = levelColor(card.level);
  if (pa) { pa.style.background=color; pa.classList.remove('accent-bloom'); void pa.offsetWidth; pa.classList.add('accent-bloom'); }
  if (pl) { pl.textContent=LEVEL_LABELS[card.level]||''; pl.style.color=color; }
  if (pq) { pq.style.opacity='0'; setTimeout(()=>{ pq.textContent=translateQ(card); pq.style.opacity='1'; },120); }
  if (pn) pn.textContent = `${state.currentIndex+1} / ${state.visibleDeck.length}`;
}

function toggleCategories() {
  state.categoriesCollapsed = !state.categoriesCollapsed;
  const wrap  = document.getElementById('toggles-wrap');
  const arrow = document.getElementById('catArrow');
  const lbl   = document.getElementById('catLabel');
  if (wrap)  wrap.classList.toggle('open', !state.categoriesCollapsed);
  if (arrow) arrow.textContent = state.categoriesCollapsed ? '▶' : '▼';
  if (lbl)   { lbl.classList.toggle('open', !state.categoriesCollapsed); lbl.blur(); }
};

function updateDeckInfo() {
  const shown = state.visibleDeck.length, total = state.fullDeck.length;
  const el = document.getElementById('deckCount');
  if (el) el.textContent = shown===0 ? 'No categories' : shown===total ? `${total} cards` : `${shown} / ${total}`;
};

// Entering party mode is handled inline by the #btnParty click handler below.
function exitParty() {
  state.partyMode = false;
  const overlay = document.getElementById('partyOverlay');
  if (overlay) overlay.classList.remove('open');
};

// ── Drawer helpers ──
// btn-menu is the one drawer trigger that's never itself inside a drawer, so
// it's always a safe, visible place to return focus to when any drawer closes
// — the sub-drawer triggers (d-log, d-favs, ...) live inside menuDrawer, which
// is already closed by the time a sub-drawer closes, so focusing them back
// would land focus inside a hidden dialog.

const DRAWER_TRIGGER_IDS = ['btn-menu', 'd-log', 'd-favs', 'd-custom', 'd-help'];
function openDrawer(id, triggerEl) {
  document.getElementById('overlay').classList.add('open');
  const el = document.getElementById(id);
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  if (triggerEl) triggerEl.setAttribute('aria-expanded', 'true');
  el.focus();
}
function closeAllDrawers() {
  document.getElementById('overlay').classList.remove('open');
  ['menuDrawer','logDrawer','favsDrawer','customDrawer','helpDrawer'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){ el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
  });
  DRAWER_TRIGGER_IDS.forEach(id=>{
    const el=document.getElementById(id); if(el) el.setAttribute('aria-expanded', 'false');
  });
  const btnMenu = document.getElementById('btn-menu');
  if (btnMenu) try { btnMenu.focus(); } catch(e) {}
}

// ── Language: single switch, menu row only now — the inline row toggle was
// removed to make room for the Twist trigger; the menu's own language row
// (d-lang) was already a full duplicate of it. ──

// "What kind of evening?" only means something in the evening — asking it at
// 9am reads as a bug, not a deliberate choice of words. Read the real clock
// instead of hard-coding one time of day.
const TIME_OF_DAY_WORD = {
  morning:   { en: 'morning',   nl: 'ochtend' },
  afternoon: { en: 'afternoon', nl: 'middag' },
  evening:   { en: 'evening',   nl: 'avond' },
  night:     { en: 'night',     nl: 'nacht' },
};
function timeOfDay() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}
function timeOfDayWord() {
  const w = TIME_OF_DAY_WORD[timeOfDay()];
  return state.lang === 'nl' ? w.nl : w.en;
}
function updateTimeOfDayHeading() {
  const word = timeOfDayWord();
  const heading = document.getElementById('playLeadFirst');
  if (heading) heading.textContent = (state.lang === 'nl' ? 'Wat voor ' : 'What kind of ') + word + '?';
  const customizeBtn = document.getElementById('customizeBtn');
  if (customizeBtn) customizeBtn.textContent = state.lang === 'nl' ? ('Pas je ' + word + ' aan') : ('Customize your ' + word);
  // The sheet's own title tracks which pane is showing — "Categories" only
  // actually describes Explore; Shape gets the same time-of-day framing as
  // its heading and the Customize button, so all three read as one line.
  const title = document.getElementById('catSheetTitle');
  if (title) {
    const exploring = document.getElementById('paneExplore') && document.getElementById('paneExplore').classList.contains('on');
    title.textContent = exploring
      ? (state.lang === 'nl' ? 'Categorieën' : 'Categories')
      : (state.lang === 'nl' ? ('Vorm je ' + word) : ('Shape your ' + word));
  }
}

function setLang(l, skipRefresh) {
  state.lang = l;
  document.documentElement.lang = l;
  const ic = document.getElementById('dLangIcon'); if (ic) ic.textContent = l.toUpperCase();
  const sub = document.getElementById('dLangSub');
  if (sub) sub.textContent = l === 'en' ? 'Switch to Nederlands' : 'Schakel naar English';
  updateTimeOfDayHeading();
  if (!skipRefresh) setCardDisplay(state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length ? state.visibleDeck[state.currentIndex] : null);
}
document.getElementById('d-lang').addEventListener('click', () => setLang(state.lang === 'en' ? 'nl' : 'en'));

// ── Category label toggle ──
document.getElementById('catLabel').addEventListener('click', toggleCategories);

// Shuffle mode is chosen from the Shuffle token tray (see the order list in the
// app shell wiring below); the mode is applied via updateShuffleDisplay().
// ── Reshuffle button: re-deal in the current shuffle mode ──
document.getElementById('d-reshuffle').addEventListener('click',()=>{
  initDeck();
  updateDeckInfo(); updateDrawMore();
  closeAllDrawers();
});

// ── Menu drawer ──
document.getElementById('btn-menu').addEventListener('click',(e)=>openDrawer('menuDrawer', e.currentTarget));
document.getElementById('overlay').addEventListener('click',closeAllDrawers);

// ── Log ──
document.getElementById('d-log').addEventListener('click',(e)=>{ closeAllDrawers(); renderLog(); openDrawer('logDrawer', e.currentTarget); });
document.getElementById('closeLog').addEventListener('click',()=>closeAllDrawers());
document.getElementById('btnExport').addEventListener('click', () => {
  if (!state.sessionLog.length) return;
  const lines = state.sessionLog.map((c,i)=>`${i+1}. [${LEVEL_LABELS[c.level]||c.level}]\n   ${c.question}`).join('\n\n');
  const blob = new Blob([`Between Us — ${new Date().toLocaleDateString()}\n${'─'.repeat(40)}\n\n${lines}`],{type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`between-us-${new Date().toISOString().slice(0,10)}.txt`; a.click();
});
document.getElementById('btnImport') && document.getElementById('btnImport').addEventListener('click',()=>{
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.txt';
  inp.onchange=async e=>{
    const text=await e.target.files[0]?.text(); if(!text) return;
    const qMap={}; ALL_CARDS.forEach(c=>{qMap[c.question.toLowerCase().trim()]=c;});
    const imported=[]; text.split('\n').forEach((line,i,arr)=>{
      if(/^\d+\. \[/.test(line.trim())){const q=arr[i+1]?.trim(); if(q) imported.push(qMap[q.toLowerCase()]||{question:q,level:'deep'});}
    });
    if(imported.length){state.sessionLog=imported;state.loggedQuestions=new Set(imported.map(c=>c.question));renderLog();closeAllDrawers();openDrawer('logDrawer');}
  }; inp.click();
});

document.getElementById('btnClearLog').addEventListener('click', () => {
  state.sessionLog = []; state.loggedQuestions.clear(); renderLog();
});

// ── Favourites ──
document.getElementById('d-favs').addEventListener('click',(e)=>{ closeAllDrawers(); renderFavourites(); openDrawer('favsDrawer', e.currentTarget); });
document.getElementById('closeFavs').addEventListener('click',()=>closeAllDrawers());

// ── Save / Continue ──


// ── Custom cards ──
document.getElementById('d-custom').addEventListener('click',(e)=>{ closeAllDrawers(); renderCustomList(); openDrawer('customDrawer', e.currentTarget); });
document.getElementById('closeCustom').addEventListener('click',()=>closeAllDrawers());
document.getElementById('customAddBtn').addEventListener('click',addCustomCard);
document.getElementById('customText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addCustomCard();}});

// ── Help ──
document.getElementById('d-help').addEventListener('click',(e)=>{ closeAllDrawers(); openDrawer('helpDrawer', e.currentTarget); });
document.getElementById('closeHelp').addEventListener('click',()=>closeAllDrawers());

function updateAfterDarkBtn() {
  const btn=document.getElementById('afterDarkToggle'); if(!btn) return;
  if (MASTER_SAFE || WORKPLACE_MODE) {
    // Hard lock: button gone AND every adult toggle stays hidden, in every mode
    btn.style.display='none';
    SAFE_BLOCKED_LEVELS.forEach(lvl=>{
      const b=document.querySelector(`.toggle-btn[data-level="${lvl}"]`);
      if(b){ b.style.display='none'; b.classList.remove('hard-locked'); }
    });
    return;
  }
  btn.classList.toggle('on',!state.safeMode);
  SAFE_BLOCKED_LEVELS.forEach(lvl=>{
    const b=document.querySelector(`.toggle-btn[data-level="${lvl}"]`);
    if(!b) return;
    if (b.style.display === 'none') return;   // not part of this mode — stays hidden, not just dimmed
    b.classList.toggle('hard-locked', state.safeMode);
  });
};





// ── SHELL RENDER ──────────────────────────────────────────────────────────────
// Single source of truth for the token-line labels. Every value is derived from
// state and written here; callers invoke renderShell() after a state change
// instead of the shell observing its own DOM for updates.
function renderShell() {
  // Categories token -> Mood: the sliders' energy, tinted by what's active.
  // Bare count only when literally nothing is selected — there's no mood to name.
  const total = [...document.querySelectorAll('.toggle-btn')]
    .filter(b => b.dataset.level && b.dataset.level !== 'backup' && b.style.display !== 'none').length;
  const vCats = document.getElementById('valCats'), lCats = document.getElementById('lblCats');
  const tokCats = document.getElementById('tokCats');
  if (vCats) {
    const activeLevels = [...state.activeToggles].filter(l => DECK_LEVELS.has(l));
    const mood = (typeof computeMood === 'function' && typeof intentIntensity !== 'undefined')
      ? computeMood([...state.activeToggles], intentIntensity, (intentFocus+1)/2) : null;
    if (mood) {
      vCats.textContent = mood; if (lCats) lCats.textContent = 'Mood';
      const reg = activeLevels.length ? registerState(activeLevels) : null;
      const col = reg && REGISTER_COLOR[reg];
      if (tokCats) col ? tokCats.style.setProperty('--tokc', col) : tokCats.style.removeProperty('--tokc');
    } else {
      vCats.textContent = state.activeToggles.size + '/' + total; if (lCats) lCats.textContent = 'Categories';
      if (tokCats) tokCats.style.removeProperty('--tokc');
    }
  }
  // Shuffle token: active mode. Deep gets its own flat colour (a real,
  // single lean); Breadth and Arc move across several categories at once,
  // and a gradient here read as noisy on the one row that's meant to stay
  // calm — that richer picture stays where there's room for it (the order
  // list's own icon), the main-screen token stays plain.
  const vOrder = document.getElementById('valOrder');
  const tokOrder = document.getElementById('tokOrder');
  if (vOrder && state.randomMode) {
    vOrder.textContent = state.randomMode.charAt(0).toUpperCase() + state.randomMode.slice(1);
    if (tokOrder) {
      const sc = SHUFFLE_COLOR[state.randomMode];
      sc ? tokOrder.style.setProperty('--tokc', sc) : tokOrder.style.removeProperty('--tokc');
    }
  }
  // Cards token: hand size / total matching cards, e.g. "5 / 214"
  // Uses the raw filtered match count, not state.fullDeck.length — that's
  // already post-applyIntent (trimmed to the top ~30%, floor 20), so using
  // it here understated the real pool (e.g. showed "20" when 66 cards
  // actually matched the active selection).
  const vHand = document.getElementById('valHand');
  if (vHand) {
    const handSize = (state.cardLimit == null) ? 'All' : String(state.cardLimit);
    vHand.textContent = handSize + ' / ' + getFilteredCards().length;
  }
  // Fullscreen mirror of the Draw-three toggle
  const pp = document.getElementById('partyPick'), pt = document.getElementById('pickToggle');
  if (pp && pt) { pp.classList.toggle('on', pt.classList.contains('on')); }

  // Shape pane's live sentence — same dial+selection reading as the Mood token, spelled out
  const sentenceEl = document.getElementById('roundSentence');
  if (sentenceEl && typeof intentIntensity !== 'undefined') {
    sentenceEl.textContent = roundSentence([...state.activeToggles], intentIntensity, (intentFocus + 1) / 2);
  }
}

function updateDrawMore() {
  // This runs after every deck-state change (nextCard, skipCard, initDeck,
  // choosePick, …), so the end-of-hand hint updates from here too — no need
  // to separately observe the DOM for it.
  hint(atEnd());
  // Always hide the standalone draw-more button — it floats awkwardly
  const standalone = document.getElementById('drawMoreBtn');
  if (standalone) standalone.classList.remove('visible');

  const atSummary  = state.visibleDeck.length > 0 && state.currentIndex >= state.visibleDeck.length;      // end-of-draw screen

  // Twist is a lens on a drawn card — nothing to twist before the first
  // draw or on the end-of-round summary.
  [document.getElementById('btnTwist'), document.getElementById('partyBtnTwist')].forEach(btn => {
    if (btn) btn.classList.toggle('disabled', !hasCurrentCard());
  });

  const nextBtn = document.getElementById('btn-next');
  if (!nextBtn) return;

  if (atSummary) {
    // The end-of-draw button starts a fresh hand — NOT "draw more" (which would
    // pile 10 extra cards onto the finished hand instead of dealing a new one).
    // This is the only state that skips straight to a new hand, and it always
    // needs the hold gesture — the last card of a hand still goes through this
    // screen first, never a one-tap shortcut around it.
    nextBtn.classList.add('hold-mode');   /* distinct colour: this one needs a hold */
    nextBtn.textContent = state.lang === 'nl' ? 'Houd vast om door te gaan' : 'Hold to continue';
  } else {
    nextBtn.classList.remove('hold-mode');
    nextBtn.textContent = state.currentIndex >= 0 ? (state.lang === 'nl' ? 'Volgende kaart' : 'Next Card') : (state.lang === 'nl' ? 'Trek kaart' : 'Draw Card');
  }
};

function showSessionSummary() {
  const isArc = state.randomMode === 'arc';

  // Build arc progression — unique categories of THIS DRAW, in order
  const seen = new Set(), cats = [];
  state.visibleDeck.forEach(c => { if (!seen.has(c.level)) { seen.add(c.level); cats.push(c.level); } });
  const arcLine = cats.map(l => LEVEL_LABELS[l] || l).join(' · ');
  const drawCount = state.visibleDeck.length;

  // Starred cards from this session
  const logQ = new Set(state.sessionLog.map(c => c.question));
  const starred = (state.favourites || []).filter(c => logQ.has(c.question)).slice(0, 3);

  // ── Update the card face ──
  const accent = document.getElementById('c-accent');
  if (accent) {
    accent.style.background = 'var(--gold-l)';
    accent.classList.remove('accent-bloom');
    void accent.offsetWidth;
    accent.classList.add('accent-bloom');
  }

  const lvlEl = document.getElementById('card-level');
  if (lvlEl) {
    lvlEl.classList.remove('in');
    lvlEl.textContent = isArc
      ? (state.lang === 'nl' ? 'Arc voltooid' : 'Arc complete')
      : (state.lang === 'nl' ? 'Ronde afgerond' : 'Draw complete');
    lvlEl.style.color = 'var(--gold-l)';
    void lvlEl.offsetWidth;
    lvlEl.classList.add('in');
  }

  const qEl = document.getElementById('card-question');
  if (qEl) {
    qEl.classList.remove('in');
    let html = `<div class="sic-wrap">`;
    if (arcLine) {
      html += `<div class="sic-label">${isArc ? 'You went' : 'You covered'} — ${drawCount} ${state.lang==='nl' ? 'kaarten' : 'cards'}</div>`;
      html += drawRoundTrace(state.visibleDeck);
      html += `<div class="sic-arc">${arcLine}</div>`;
    }
    if (starred.length > 0) {
      html += `<div class="sic-stars">`;
      starred.forEach(c => { html += `<div class="sic-star">&#9733;&nbsp; ${esc(translateQ(c))}</div>`; });
      html += `</div>`;
    }
    if (state.fullDeck.length - state.visibleDeck.length <= 0) {
      html += `<div class="sic-note">${state.lang==='nl'
        ? 'Dat was dit hele deck. Kies meer categorieën om door te gaan — of houd vast om opnieuw te schudden.'
        : 'That was the whole deck for this selection. Add categories to keep going — or hold to reshuffle it.'}</div>`;
    }
    html += `</div>`;
    qEl.innerHTML = html;
    void qEl.offsetWidth;
    qEl.classList.add('in');
    // Re-render the arc line with per-category colors (same `cats` computed above)
    const arcEl = qEl.querySelector('.sic-arc');
    if (arcEl) {
      arcEl.innerHTML = cats.map(l =>
        `<span style="color:${levelColor(l)}">${LEVEL_LABELS[l]||l}</span>`
      ).join('<span style="opacity:.35"> · </span>');
    }
  }

  // A Twist held over from the last card doesn't belong on the summary —
  // clear it before writing "— end —" so it can't get overwritten back to
  // a modifier sentence, and so the button itself stops reading as active.
  clearTwist();
  const numEl = document.getElementById('card-number');
  if (numEl) numEl.textContent = '— end —';

  // The round is over — every dot reads as passed, none as "current".
  renderProgress(state.visibleDeck.length);
}

// ── End-of-draw hold gate ──
// The end screen is a stop, not something you tap through: continuing takes a
// deliberate hold, in normal mode and fullscreen alike. Releasing a hold fires
// touchend/click, so the gate opens a short swallow window that those handlers
// (here and on the fullscreen overlay) check, keeping one hold to one advance.
//
// atEnd/hint are plain top-level functions (not nested in the IIFE below) so
// updateDrawMore() — already the one place every deck-state change routes
// through — can call hint(atEnd()) directly. That replaces a MutationObserver
// that used to watch #card-question's DOM for changes to infer the same
// thing: explicit state instead of observing what the DOM did as a result of it.

function atEnd(){ return state.currentIndex >= state.visibleDeck.length && state.visibleDeck.length > 0; }
// True only while a real, drawn card is on screen — false before the
// first draw (currentIndex -1) and at the end-of-round summary alike.
function hasCurrentCard(){ return state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length; }
function hint(on){
  const el = document.getElementById('endHint');
  if (el) el.classList.toggle('visible', !!on);
}

function runPartySummary() {
  const isArc = state.randomMode === 'arc';
  const pl = document.getElementById('party-level');
  const pq = document.getElementById('party-question');
  const pn = document.getElementById('party-number');
  const pa = document.getElementById('party-accent');
  if (pa) pa.style.background = 'var(--gold-l)';
  if (pl) { pl.textContent = isArc ? (state.lang==='nl'?'Arc voltooid':'Arc complete') : (state.lang==='nl'?'Ronde afgerond':'Draw complete'); pl.style.color = 'var(--gold-l)'; }
  if (pn) pn.textContent = '— end —';
  if (pq) {
    const seen2 = new Set(), cats2 = [];
    state.sessionLog.forEach(c => { if (!seen2.has(c.level)) { seen2.add(c.level); cats2.push(c.level); } });
    const arcHtml = cats2.map(l =>
      `<span style="color:${levelColor(l)}">${LEVEL_LABELS[l]||l}</span>`
    ).join('<span style="opacity:.35"> · </span>');
    pq.innerHTML = `<div class="sic-wrap">${drawRoundTrace(state.visibleDeck)}<div class="sic-arc" style="font-size:.85rem">${arcHtml}</div></div>`;
  }
}


