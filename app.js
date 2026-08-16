(function () {
  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  BUILD PROFILE                                                         ║
  // ║  Which version this is comes from the ONE line near the top of each    ║
  // ║  shell file (between-us.html / -work.html / -dev.html): it sets        ║
  // ║  window.BUILD_PROFILE before this shared app.js loads. The URL you     ║
  // ║  hand out then always opens exactly that version — nobody has to       ║
  // ║  pick anything. Everything else below is derived from the profile.     ║
  // ╚══════════════════════════════════════════════════════════════════════╝

  const BUILD_PROFILE = window.BUILD_PROFILE || "public";   // "public" · "work" · "editor"

  // ── PROFILE DEFINITIONS ──────────────────────────────────────────────────
  // Shared, identical in every build. Fine-tune a version by editing its block
  // (these are the settings you already had — just organised per version).
  const PROFILES = {

    // PUBLIC — the copy you hand someone by default.
    public: {
      MASTER_SAFE:      false,   // true → no adult content anywhere, ever (hard lock)
      WORKPLACE_MODE:   false,   // true → hard lock + starts in Work mode
      DEFAULT_LANGUAGE: "en",    // "en" or "nl"
      DEFAULT_SHUFFLE:  "arc",   // wild · deep · breadth · arc
      DEFAULT_LIMIT:    5,       // cards per hand: 5 · 10 · 20 · 0 (= All)
      START_COLLAPSED:  true,    // true → category list starts folded away
      SPICE_MODE:       false,   // true → adult categories pre-activated
      SPICE_AVAILABLE:  true,    // false → hides the ✦ spice-bias toggle entirely
      SHOW_BACKUP:      true,    // true → shows the hidden Backup overflow category
      LOG_PERSIST:      true,    // true → the session log survives a page reload
      COLBERT_STRICT:   true,    // true → Colbert plays its canonical 15, in order
      // what "Draw" plays, and what the app opens on. mode 'chapters' unions the
      // listed chapters; mode 'all' mirrors the All button (everything except
      // the opt-in-only lists and Abyss). intensity/focus are 0-100, 50=balanced.
      DEFAULT_SELECTION: { mode:'chapters', chapters:['findout','deeper','aboutus'], intensity:50, focus:50 },
    },

    // WORK — workplace-safe: Dutch, adult content hard-locked, opens in Work mode.
    work: {
      MASTER_SAFE:      false,
      WORKPLACE_MODE:   true,
      DEFAULT_LANGUAGE: "nl",
      DEFAULT_SHUFFLE:  "arc",
      DEFAULT_LIMIT:    5,
      START_COLLAPSED:  true,
      SPICE_MODE:       false,
      SPICE_AVAILABLE:  false,
      SHOW_BACKUP:      false,
      LOG_PERSIST:      true,
      COLBERT_STRICT:   true,
      // narrower room, and a touch softer than balanced — still a real conversation,
      // just not one that needs Between Us or the far end of the intensity dial
      DEFAULT_SELECTION: { mode:'chapters', chapters:['findout','deeper'], intensity:35, focus:50 },
    },

    // EDITOR — development build: spice pre-activated, dev conveniences on.
    editor: {
      MASTER_SAFE:      false,
      WORKPLACE_MODE:   false,
      DEFAULT_LANGUAGE: "en",
      DEFAULT_SHUFFLE:  "wild",
      DEFAULT_LIMIT:    5,
      START_COLLAPSED:  true,
      SPICE_MODE:       true,
      SPICE_AVAILABLE:  true,
      SHOW_BACKUP:      true,
      LOG_PERSIST:      true,
      COLBERT_STRICT:   true,
      DEFAULT_SELECTION: { mode:'all', intensity:50, focus:50 },
    },

  };

  // ── APPLY (do not edit) ──────────────────────────────────────────────────
  const _p = PROFILES[BUILD_PROFILE] || PROFILES.public;
  for (const _k in _p) window[_k] = _p[_k];
  window.BUILD_PROFILE     = BUILD_PROFILE;
  window.DEFAULT_COLLAPSED = window.START_COLLAPSED;
  window.NL_DEFAULT        = (window.DEFAULT_LANGUAGE === "nl");

  // ── NO INTRO — this is intentional ───────────────────────────────────────
  // Between Us has no onboarding screen. Users hand it to each other and they
  // get it immediately. The simplicity is the point. Do not add one.
})();
const WORKPLACE_MODE    = window.WORKPLACE_MODE;
const DEFAULT_COLLAPSED = window.DEFAULT_COLLAPSED;
const MASTER_SAFE       = window.MASTER_SAFE;
const SPICE_MODE        = window.SPICE_MODE || false;
const NL_DEFAULT        = window.NL_DEFAULT || false;

const SAFE_BLOCKED_LEVELS = ["flesh","carnal","kinks","usintimate","bare","abyss"];

// ── LEVEL COLORS for accent bar ──
const LEVEL_COLORS = {
  warm:"#d58b34",deep:"#f3c33c",self:"#669bbb",raw:"#eb6d6d",shadow:"#75609c",
  mind:"#5082cd",attract:"#e8997a",grief:"#7d7da0",lens:"#96b87b",ground:"#86a666",
  connect:"#65c9b0",spirit:"#ad7ac6",past:"#b79c66",wish:"#937ac6",home:"#97c965",
  culture:"#c99765",date:"#df7a91",work:"#4dbebe",values:"#caae3d",
  body:"#7bb397",move:"#65c77f",life:"#80bb66",roots:"#ad8d4c",friends:"#d2a158",
  world:"#3aabdd",family:"#ba8e58",unwind:"#4ec1a0",
  colbert:"#f3c33c",quick:"#f3c33c",us:"#e8af7a",usfriend:"#bea466",uslove:"#df7777",
  usintimate:"#e84a4a",edge:"#c44ba8",flesh:"#e08055",carnal:"#c81f1f",
  flesh:"#8a305a",kinks:"#a1247a",backup:"#5a5a6a",
  desire:"#b05080",threshold:"#7a3060",failure:"#8a6040",bare:"#e2603c",abyss:"#b00000",aron:"#e75783",magic:"#8066e1",
};
function levelColor(l){ return LEVEL_COLORS[l]||'#c9a84c'; }

// ── Depth scale: the bands of the category grid, light (1) to deepest (8).
//    Drives both the round-summary line AND Arc's own hand-shaping
//    (_arcHand below) — After Dark is graded here too (usintimate/flesh
//    easiest, kinks heavier, Abyss deepest), same ranking as LEVEL_INTENSITY,
//    so Arc can tell them apart instead of treating them as one flat tier. ──
const LEVEL_DEPTH = {
  quick:1, warm:1, colbert:1, aron:1, magic:1,
  culture:2, life:2, home:2, work:2, unwind:2, world:2,
  self:3, body:3, mind:3, spirit:3, values:3, wish:3, past:3, roots:3, family:3,
  connect:4, friends:4, date:4, attract:4, us:4, usfriend:4, uslove:4,
  deep:5, raw:5, grief:5, shadow:5,
  usintimate:6, flesh:6, carnal:6.5, bare:6.5, kinks:7, abyss:8,
};
function levelDepth(l){ return LEVEL_DEPTH[l] || 3; }

/* ── Intent: two dials instead of thirty-eight switches ──────────────────
   A gated bias, not a filter: each category's chance of being drawn is
   weighted toward the dial position, steeply, but a floor under every
   weight means nothing is ever truly excluded — a round set to Intense can
   still turn up the odd Warm card, same as one set to Easy can surprise you
   with something deeper. The same weighting runs under every shuffle mode,
   Arc included — Arc's own warm/deep/cool shape does the rest from there.

   Intensity is one scale for the whole deck, so After Dark grades on it too:
   Us: Intimate and Flesh are an easy end of that scale, Kink is not, and
   Abyss stays off the dial entirely (opt-in only, like the ordered lists).
   Focus runs from a question about you to a question about the two of you. */
const LEVEL_INTENSITY = {
  quick:1, warm:1, colbert:1, magic:1, aron:2,
  unwind:1, home:2, culture:2, life:2, work:2, world:3,
  self:3, mind:3, body:3, values:3, wish:3,
  family:3, spirit:4, roots:4, past:4,
  connect:3, friends:3, date:3, attract:4,
  us:3, usfriend:3, uslove:4,
  deep:5, raw:5, shadow:6, grief:6,
  usintimate:3, flesh:3, carnal:4, bare:4, kinks:6, abyss:8,
  backup:3, failure:4, lens:3, desire:3, threshold:5, move:2, ground:3, edge:5,
};
const LEVEL_FOCUS = {
  self:-1, mind:-0.9, body:-0.8, values:-0.7, wish:-0.7, spirit:-0.6, past:-0.5, roots:-0.3,
  quick:0, warm:0, colbert:0, aron:0, magic:0,
  culture:0, life:0, work:0, unwind:0, world:0, home:0.1,
  family:0.4, friends:0.5, connect:0.7, attract:0.7, date:0.8,
  us:1, usfriend:1, uslove:1, usintimate:1,
  deep:0, raw:0.2, shadow:0, grief:-0.2,
  flesh:0.6, carnal:0.7, bare:0.3, kinks:0.4, abyss:0,
  backup:0,
};
function levelIntensity(l){ return LEVEL_INTENSITY[l] != null ? LEVEL_INTENSITY[l] : 3; }
function levelFocus(l){ return LEVEL_FOCUS[l] != null ? LEVEL_FOCUS[l] : 0; }

let intentIntensity = 0.5;   /* dial position, 0 … 1  */
let intentFocus     = 0;     /* dial position, -1 … 1 */
let intentOn        = false; /* Explore hands the deck back untouched */

function intentWeight(lvl, lo, hi){
  const target = lo + intentIntensity * (hi - lo);
  const di = levelIntensity(lvl) - target;
  const df = levelFocus(lvl) - intentFocus;
  const w  = Math.exp(-(di*di) / (2*1.15*1.15)) * Math.exp(-(df*df) / (2*0.8*0.8));
  return Math.max(w, 0.05);          /* the floor is where the surprises live */
}

/* One weighted pass, no replacement, no bias in the ordering it leaves
   behind (Efraimidis–Spirakis). The shuffle mode then shapes what survives,
   so Arc still arcs and Breadth still cycles — over a pool the dials chose. */
function applyIntent(cards){
  if (!intentOn || cards.length < 8) return cards;
  const ints = [...new Set(cards.map(c => c.level))].map(levelIntensity);
  const lo = Math.min(...ints), hi = Math.max(...ints);
  const keyed = cards.map(c => ({ c, k: Math.pow(Math.random(), 1 / intentWeight(c.level, lo, hi)) }));
  keyed.sort((a, b) => b.k - a.k);
  return keyed.slice(0, Math.max(20, Math.ceil(keyed.length * 0.30))).map(x => x.c);
}

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
/* Which of the five chapters each category belongs to, so mixing chapters
   of very different sizes doesn't let the bigger one drown out the smaller
   one — Beneath the Surface has 19 members, Into the Deep has 4, and a flat
   average across raw categories would let 19 always outvote 4. Categories
   outside the five main chapters (Colbert, The 36, Magical, Backup, Abyss)
   fold into whichever chapter they read closest to on register. Kept in
   sync with CHAPTERS in the controller script below. */
const LEVEL_CHAPTER = {};
[['warmup',['quick','warm','colbert','magic']],
 ['findout',['culture','life','home','work','unwind','world','self','mind','body','values','wish',
             'past','roots','family','spirit','connect','friends','date','attract','aron','backup']],
 ['deeper',['deep','raw','shadow','grief']],
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

/* Mood = which room the selected chapters put you in (register), crossed
   with how exposed (depth band) and who it's about (focus band). Rule-based
   lookup, not a nearest-anchor search over an averaged coordinate — mixing
   chapters of very different sizes, or diluting After Dark into a single
   other category, no longer blends into a washed-out midpoint word. */
function computeMood(activeLevels, sliderIntensity01, sliderFocus01){
  const levels = activeLevels.filter(l => DECK_LEVELS.has(l));
  if (!levels.length) return null;

  const register = registerState(levels);

  // Depth/focus bands stay dial-led (the dial is what the player actually
  // reached for), tinted 70/30 by what's selected so the band itself isn't
  // 100% frozen to a fixed dial position — that nudge alone can't do all
  // the work of breaking a repeat, though, since two different selections
  // often average out close to the same spot. This nudge never touches
  // register, only depth/focus — register washing out from averaging
  // chapters of very different sizes was the original bug, not this.
  const avgDepth = levels.reduce((s,l) => s + (levelIntensity(l)-1)/7, 0) / levels.length;
  const avgFocus = levels.reduce((s,l) => s + (levelFocus(l)+1)/2,     0) / levels.length;
  const depth01 = Math.max(0, Math.min(1, .7*sliderIntensity01 + .3*avgDepth));
  const focus01 = Math.max(0, Math.min(1, .7*sliderFocus01     + .3*avgFocus));

  const depth = depthBand(depth01);
  const focus = focusBand(focus01);

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

// The four shuffle modes, drawn as the shape of a round.
function shuffleShapeSVG(mode) {
  const d = 'r="2.4" fill="currentColor"';
  const shapes = {
    wild: `<circle cx="6" cy="20" ${d}/><circle cx="18" cy="7" ${d}/><circle cx="30" cy="23" ${d}/><circle cx="42" cy="11" ${d}/>`
        + `<circle cx="54" cy="25" ${d}/><circle cx="66" cy="9" ${d}/><circle cx="78" cy="19" ${d}/><circle cx="90" cy="13" ${d}/>`,
    deep: `<polyline points="6,23 18,20 30,17 42,14 54,11 66,9 78,7 90,5" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".3"/>`
        + `<circle cx="6" cy="23" ${d}/><circle cx="18" cy="20" ${d}/><circle cx="30" cy="17" ${d}/><circle cx="42" cy="14" ${d}/>`
        + `<circle cx="54" cy="11" ${d}/><circle cx="66" cy="9" ${d}/><circle cx="78" cy="7" ${d}/><circle cx="90" cy="5" ${d}/>`,
    breadth: ['#d58b34','#f3c33c','#669bbb','#65c9b0','#96b87b','#df7a91','#8066e1','#4dbebe']
        .map((c, i) => `<circle cx="${6 + i * 12}" cy="15" r="2.6" fill="${c}"/>`).join(''),
    arc: `<path d="M5 24 C 20 24 22 6 48 6 S 76 24 91 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".35"/>`
       + `<circle cx="5" cy="24" ${d}/><circle cx="26" cy="9" ${d}/><circle cx="48" cy="6" ${d}/><circle cx="70" cy="9" ${d}/><circle cx="91" cy="24" ${d}/>`,
  };
  if (!shapes[mode]) return '';
  return `<svg class="smp-shape" viewBox="0 0 96 30" aria-hidden="true">${shapes[mode]}</svg>`;
}


const LEVEL_LABELS = {
  warm:"Warm", deep:"Deep", life:"Life", home:"Home",
  roots:"Roots", past:"Past", self:"Self", body:"Body", move:"Move",
  connect:"Connect", friends:"Friendship", values:"Values",
  world:"World", spirit:"Spirit", mind:"Mind",
  culture:"Culture", unwind:"Unwind", raw:"Raw",
  date:"Romance", attract:"Attract", flesh:"Flesh ✦", carnal:"Carnal ✦",
  flesh:"Flesh ✦", kinks:"Kink ✦", work:"Work",
  backup:"Backup", family:"Family", grief:"Grief",
  us:"Between Us", usfriend:"Us: Friends", uslove:"Us: Love",
  usintimate:"Us: Intimate ✦", shadow:"Shadow",
  wish:"Wish", quick:"Quick", colbert:"Colbert",
  lens:"Lens", ground:"Ground",
  desire:"Desire ✦", threshold:"Threshold ✦", failure:"Failure", bare:"Bare ✦", abyss:"Abyss ✦", aron:"The 36", magic:"Magical"
};


const PRESETS = {
  open: {
    on:        ["warm","quick","connect","deep","self","culture","life","values","wish","home","roots","past","unwind","body","mind","spirit","friends","date","attract","world","work","raw","grief","family","us","usfriend","uslove","usintimate","shadow","bare"],
    available: ["colbert","aron","magic","carnal","kinks","backup","abyss"],
    subtitle:  "Everything on the table"
  },
  newpeople: {
    on:        ["warm","quick","culture","unwind","world"],
    available: ["connect","self","life","mind","wish","attract","spirit","body","aron","magic"],
    subtitle:  "Strangers, parties, after the dance floor"
  },
  friends: {
    on:        ["warm","friends","connect","culture","life","past","unwind","bare","deep","usfriend"],
    available: ["values","mind","us","grief","body","flesh","carnal","abyss","aron","magic"],
    subtitle:  "The people you chose"
  },
  dating: {
    on:        ["warm","attract","date","connect","culture","bare"],
    available: ["self","past","wish","values","us","usintimate","body","flesh","carnal","abyss","aron","magic"],
    subtitle:  "For two, finding out"
  },
  partner: {
    on:        ["us","uslove","connect","date","deep","wish","bare"],
    available: ["usintimate","family","roots","grief","raw","home","body","flesh","carnal","kinks","abyss","aron","magic"],
    subtitle:  "The two of you"
  },
  latenight: {
    on:        ["deep","raw","self","connect","values","shadow","wish","bare"],
    available: ["spirit","grief","past","roots","family","mind","world","body","carnal","abyss"],
    subtitle:  "When it gets late and honest"
  },
  solo: {
    on:        ["self","wish"],
    available: ["deep","raw","shadow","mind","spirit","past","grief","body","magic"],
    subtitle:  "Just you"
  },
  work: {
    on:        ["quick","warm","work","culture","mind"],
    available: ["life","values","world","connect","friends","unwind","wish","magic"],
    subtitle:  "Safe for the office"
  },
  family_p: {
    on:        ["warm","quick","roots","family","culture","past"],
    available: ["home","life","grief","us","usfriend","unwind","magic"],
    subtitle:  "Across generations"
  },
  colbertmode: {
    on:        ["colbert"],
    available: [],
    subtitle:  "The questionnaire — fifteen, in order"
  },
  aronmode: {
    on:        ["aron"],
    available: [],
    subtitle:  "The closeness study — thirty-six, in order"
  }
};


// ── HELPERS ───────────────────────────────────────────────────────────────────
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── STATE ─────────────────────────────────────────────────────────────────────
// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  activeToggles: new Set(),
  activePreset: '',       // tracks current preset so we avoid DOM queries
  safeMode: false,
  spiceMode: false,
  randomMode: window.DEFAULT_SHUFFLE || 'wild',
  lang: NL_DEFAULT ? 'nl' : (window.DEFAULT_LANGUAGE || 'en'),
  cardLimit: (window.DEFAULT_LIMIT === 0 ? null : (window.DEFAULT_LIMIT || 5)),
  fullDeck: [],
  visibleDeck: [],
  currentIndex: -1,
  skippedCards: new Set(),
  partyMode: false,
  sessionLog: [],
  loggedQuestions: new Set(),   // per-round guard against duplicate log entries
  colbertPrevLimit: null,       // limit to restore after Colbert-solo play
  favourites: [],
  customCards: [],
  categoriesCollapsed: DEFAULT_COLLAPSED,
};

// Shuffle mode category pools
const SPICY_LEVELS  = ['flesh','carnal','kinks','attract','bare','abyss'];
const DEEP_LEVELS   = ['deep','raw','self','values','mind','spirit','past','roots','connect','life','date','friends','world','body'];
const LIGHT_LEVELS  = ['warm','culture','unwind','home','work'];
const BORDER_LEVELS = ['attract','raw'];
// COLBERT_OPTIONAL: questions present in the deck but not in the canonical 15.
// When COLBERT_STRICT = true (HTML setting), these are filtered out during Colbert-solo play.
const COLBERT_OPTIONAL = ['Window or aisle?','Earliest memory?','Cats or dogs?'];
const COLBERT_STRICT = window.COLBERT_STRICT || false;

// ── DECK LOGIC ────────────────────────────────────────────────────────────────
function getFilteredCards() {
  const effectiveSafe = state.safeMode || MASTER_SAFE || WORKPLACE_MODE;
  let levels = [...state.activeToggles];
  if (effectiveSafe) levels = levels.filter(l => !SAFE_BLOCKED_LEVELS.includes(l));
  return ALL_CARDS.filter(c => {
    if (!levels.includes(c.level)) return false;
    if (effectiveSafe && c.safe === false) return false;
    return true;
  });
}

// Sets that play in their canonical order when selected alone
const ORDERED_SOLO_LEVELS = ['colbert', 'aron', 'magic'];
// Opt-in-only: never swept up by Select All or auto-spice — a deliberate tap required.
const OPT_IN_ONLY = ['colbert', 'aron', 'magic', 'abyss'];
function orderedSoloLevel() {
  if (state.activeToggles.size !== 1) return null;
  const l = [...state.activeToggles][0];
  return ORDERED_SOLO_LEVELS.includes(l) ? l : null;
}
function getOrderedSolo(lvl) {
  return lvl === 'colbert' ? getOrderedColbert() : ALL_CARDS.filter(c => c.level === lvl);
}

function getOrderedColbert() {
  let cards = ALL_CARDS.filter(c => c.level === 'colbert');
  if (COLBERT_STRICT) cards = cards.filter(c => !COLBERT_OPTIONAL.includes(c.question));
  return cards;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyRandomMode(arr) {
  switch (state.randomMode) {

    case 'wild':
      if (state.spiceMode && !state.safeMode) {
        // spiceMode on: bias toward spicy (roughly 1-in-3 spicy cards)
        const sp = shuffle(arr.filter(c => SPICY_LEVELS.includes(c.level)));
        const ns = shuffle(arr.filter(c => !SPICY_LEVELS.includes(c.level)));
        const r = []; let si=0, ni=0;
        while (si<sp.length || ni<ns.length) {
          if (ni<ns.length) r.push(ns[ni++]);
          if (ni<ns.length) r.push(ns[ni++]);
          if (si<sp.length) r.push(sp[si++]);
        }
        return r;
      }
      return shuffle(arr);

    case 'deep': {
      const deepPool = shuffle(arr.filter(c => DEEP_LEVELS.includes(c.level)));
      const border   = shuffle(arr.filter(c => !state.safeMode && BORDER_LEVELS.includes(c.level) && !DEEP_LEVELS.includes(c.level)));
      const light    = shuffle(arr.filter(c => LIGHT_LEVELS.includes(c.level) && !DEEP_LEVELS.includes(c.level)));
      const spicy    = shuffle(arr.filter(c => !state.safeMode && SPICY_LEVELS.includes(c.level) && !BORDER_LEVELS.includes(c.level)));
      const result = [];
      let di=0, bi=0, li=0, si=0;
      while (di<deepPool.length || bi<border.length || si<spicy.length) {
        for (let i=0; i<4 && di<deepPool.length; i++) result.push(deepPool[di++]);
        if (li < light.length && di % 8 < 2) result.push(light[li++]);
        if (bi < border.length) result.push(border[bi++]);
        if (si < spicy.length && di > deepPool.length * 0.7) result.push(spicy[si++]);
      }
      while (li<light.length) result.push(light[li++]);
      return result;
    }

    case 'breadth': {
      const byLevel = {};
      arr.forEach(c => { (byLevel[c.level] = byLevel[c.level] || []).push(c); });
      Object.keys(byLevel).forEach(k => { byLevel[k] = shuffle(byLevel[k]); });
      const levels = shuffle(Object.keys(byLevel));
      const result = [];
      let round = 0, exhausted = false;
      while (!exhausted) {
        exhausted = true;
        for (const lvl of levels) {
          if (byLevel[lvl][round]) { result.push(byLevel[lvl][round]); exhausted = false; }
        }
        round++;
      }
      return result;
    }

    case 'arc': {
      // Arc: cycling mini-arc pattern optimised for 5–20 card sessions.
      // Pattern per 4 cards: Warm → Deep → Deep → Cool (repeat).
      // After 70% of deck: Warm slot becomes Deep (full depth phase).
      // No recovery breaths — unnecessary at short session lengths.
      const wt = c => {
        if (['quick','colbert','warm','culture','unwind'].includes(c.level)) return 'L'; // light/warm
        if (['deep','raw','grief','shadow','wish'].includes(c.level)) return 'H'; // heavy/deep
        // After Dark itself, graded — not one flat tier. usintimate/flesh sit at
        // the easy end of this pool, kinks/abyss at the heavy end (see LEVEL_INTENSITY).
        if (['flesh','carnal','kinks','bare','usintimate','abyss'].includes(c.level)) return 'S';
        return 'M'; // medium/cool (includes attract/date/us/usfriend/uslove — relational, not after-dark)
      };
      const pools = { L:[], M:[], H:[], S:[] };
      arr.forEach(c => pools[wt(c)].push(c));
      Object.values(pools).forEach(a => { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} });
      // S ramps mild -> heavy by LEVEL_INTENSITY (stable sort keeps the shuffle
      // within each intensity tier, so it's a graded ramp, not a fixed order).
      pools.S.sort((a, b) => levelIntensity(a.level) - levelIntensity(b.level));
      let li=0, mi=0, hi=0, si=0;
      const total = arr.length;
      const result = [];
      // Slot pattern: L H H M
      const pat = ['L','H','H','M'];
      const draw = (type, pos) => {
        const progress = pos / Math.max(total, 1);
        // After 70%, L slots become H (full depth phase)
        const t = (type === 'L' && progress >= 0.7) ? 'H' : type;
        if (t === 'L') {
          if (li < pools.L.length) return pools.L[li++];
          if (mi < pools.M.length) return pools.M[mi++];
          if (hi < pools.H.length) return pools.H[hi++];
        } else if (t === 'H') {
          if (hi < pools.H.length) return pools.H[hi++];
          if (mi < pools.M.length) return pools.M[mi++];
          if (li < pools.L.length) return pools.L[li++];
        } else { // M / cool
          // Spice mode: weave S cards into cool slots
          if (state.spiceMode && si < pools.S.length && pos % 4 === 3) return pools.S[si++];
          if (mi < pools.M.length) return pools.M[mi++];
          if (li < pools.L.length) return pools.L[li++];
          if (hi < pools.H.length) return pools.H[hi++];
          if (si < pools.S.length) return pools.S[si++];
        }
        return null;
      };
      const hasCards = () => li<pools.L.length || mi<pools.M.length || hi<pools.H.length || si<pools.S.length;
      let pos = 0;
      while (hasCards() && pos < total * 4) {
        const card = draw(pat[pos % pat.length], pos);
        if (card) result.push(card);
        pos++;
      }
      // Drain any remaining (shouldn't happen but safety net)
      while (si < pools.S.length) result.push(pools.S[si++]);
      return result;
    }
    default: return shuffle(arr);
  }
}

function initDeck() {
  state.skippedCards.clear();
  state.loggedQuestions.clear();
  const _solo = orderedSoloLevel();
  if (_solo) {
    if (state.colbertPrevLimit === null) state.colbertPrevLimit = state.cardLimit;   // remember to restore later
    state.cardLimit = null;
    document.querySelectorAll('.limit-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.limit === 'all')
    );
    state.fullDeck = getOrderedSolo(_solo);
  } else {
    if (state.colbertPrevLimit !== null) {                               // leaving Colbert-solo: restore
      if (state.cardLimit === null) state.cardLimit = state.colbertPrevLimit;
      state.colbertPrevLimit = null;
      document.querySelectorAll('.limit-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.limit === (state.cardLimit === null ? 'all' : String(state.cardLimit)))
      );
    }
    state.fullDeck = applyRandomMode(applyIntent(getFilteredCards()));
    { const r=_unseenFirst(state.fullDeck); state.fullDeck=r.deck; window._drawUnseen=r.unseen; }
  }
  state.currentIndex = -1;
  state.visibleDeck  = orderedSoloLevel()
    ? (state.cardLimit === null ? [...state.fullDeck] : state.fullDeck.slice(0, state.cardLimit))
    : _sliceDraw(state.fullDeck, window._drawUnseen === undefined ? state.fullDeck.length : window._drawUnseen);
  renderProgress();
  setCardDisplay(null);
  updateDeckInfo();
  updateDrawMore();
  // clear accent on fresh deck
  const accent=document.getElementById('c-accent');
  if(accent){ accent.style.background=''; accent.classList.remove('accent-bloom'); }
  // init level
  const lv=document.getElementById('card-level');
  if(lv){ lv.classList.remove('in'); lv.textContent=''; }
  const qEl=document.getElementById('card-question');
  if(qEl){ qEl.classList.remove('in'); }
  setTimeout(()=>{ if(qEl) qEl.classList.add('in'); },20);
  renderShell();
}


/* Draw vs session: a draw is dealt from what this session hasn't seen. */
function _unseenFirst(deck){
  const seen = new Set(state.sessionLog.map(c => c.question));
  if (!seen.size) return {deck, unseen: deck.length};
  const fresh = deck.filter(c=>!seen.has(c.question));
  const used  = deck.filter(c=> seen.has(c.question));
  return {deck: fresh.concat(used), unseen: fresh.length};
}
function _sliceDraw(deck, unseen){
  /* deal only fresh cards; if none are left, the deck replays in full */
  const cap = unseen > 0 ? Math.min(unseen, state.cardLimit === null ? unseen : state.cardLimit)
                         : (state.cardLimit === null ? deck.length : Math.min(state.cardLimit, deck.length));
  if (state.randomMode === 'arc') return _arcHand(unseen > 0 ? deck.slice(0, unseen) : deck, cap);
  return deck.slice(0, cap);
}

/* One hand, one arc. Two things a hand needs that deck-wide ordering can't
   guarantee once seen cards are filtered out of it:
     - variety: prefer a category the hand hasn't used yet, so five cards mean
       five different categories whenever the selection allows, instead of three
       cards out of the same pool;
     - shape: order by depth so the hand opens warm, reaches its deepest card
       around the middle and eases down after it, rather than zig-zagging.
   The summary trace plots the same levelDepth, so the line reads as an arc too. */
function _arcHand(source, cap){
  if (source.length <= cap) return source.slice(0, cap);
  /* Later arcs start from a warmer baseline. A conversation already a hand or
     two in shouldn't drop back to small talk, so the floor rises one step per
     completed hand and stops at 3 — deep enough not to feel like starting over,
     shallow enough that the arc still has somewhere to climb and ease back to.
     Cards at or above the floor are simply offered first, so a narrow category
     selection quietly falls back to whatever is left. */
  const round = Math.floor(state.sessionLog.length / Math.max(cap, 1));
  const floor = Math.min(1 + round, 3);
  if (floor > 1) {
    const atFloor = source.filter(c => levelDepth(c.level) >= floor);
    const below   = source.filter(c => levelDepth(c.level) <  floor);
    source = atFloor.concat(below);
  }
  const picked = [], usedLevels = new Set(), spares = [];
  for (const c of source) {
    if (picked.length >= cap) break;
    if (usedLevels.has(c.level)) { spares.push(c); continue; }   // keep as a fallback
    usedLevels.add(c.level); picked.push(c);
  }
  for (let i = 0; picked.length < cap && i < spares.length; i++) picked.push(spares[i]);
  /* deepest card to the middle: walk the cards from shallow to deep, placing
     them alternately at the front and the back, so depth rises then falls */
  const byDepth = picked.slice().sort((a, b) => levelDepth(a.level) - levelDepth(b.level));
  const out = new Array(byDepth.length);
  let lo = 0, hi = byDepth.length - 1;
  byDepth.forEach((c, i) => { if (i % 2 === 0) out[lo++] = c; else out[hi--] = c; });
  return out;
}

function applyLimit(reshuffle = true) {
  state.loggedQuestions.clear();
  if (reshuffle) {
    state.fullDeck = orderedSoloLevel() ? getOrderedSolo(orderedSoloLevel()) : applyRandomMode(applyIntent(getFilteredCards()));
    if (!orderedSoloLevel()) { const r=_unseenFirst(state.fullDeck); state.fullDeck=r.deck; window._drawUnseen=r.unseen; }
    else window._drawUnseen = state.fullDeck.length;
  }
  state.visibleDeck  = orderedSoloLevel()
    ? (state.cardLimit === null ? [...state.fullDeck] : state.fullDeck.slice(0, state.cardLimit))
    : _sliceDraw(state.fullDeck, window._drawUnseen === undefined ? state.fullDeck.length : window._drawUnseen);
  state.currentIndex = -1;
  renderProgress();
  setCardDisplay(null);
  updateDeckInfo();
  updateDrawMore();
  renderShell();
}

function drawMore() {
  /* Deal a FRESH hand at the chosen limit rather than growing the current one.
     The hand is always the size you picked (5) — it never becomes 10 or 15.
     initDeck() deals unseen cards first, so a new hand doesn't repeat what this
     session already showed. Same behaviour as Continue on the end screen. */
  initDeck();
  _nextCardBase();
  updateDeckInfo();
  updateDrawMore();
  renderProgress();
}

// ── TRANSLATION ───────────────────────────────────────────────────────────────
function translateQ(card) {
  return state.lang === 'nl' && card.nl ? card.nl : card.question;
}

// ── CARD DISPLAY ──────────────────────────────────────────────────────────────
function _nextCardBase() {
  if (!state.visibleDeck.length) return;
  if (state.currentIndex < state.visibleDeck.length - 1) {
    state.currentIndex++;
    flipToCard(state.visibleDeck[state.currentIndex]);
    addToLog(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    if (state.currentIndex === state.visibleDeck.length - 1) updateDrawMore();
  } else {
    const remaining = state.fullDeck.filter(c => c && !state.skippedCards.has(c.question)).length - state.visibleDeck.length;
    const el = document.getElementById('card');
    el.classList.add('flipping');
    state.currentIndex = state.visibleDeck.length; // sentinel: prevents re-trigger on repeat tap
    setTimeout(() => {
      document.getElementById('card-level').className   = 'card-level';
      document.getElementById('card-level').textContent = '';
      const _fresh = (()=>{const sn=new Set(state.sessionLog.map(c=>c.question));return state.fullDeck.filter(c=>!sn.has(c.question)).length;})();
      document.getElementById('card-question').innerHTML = _fresh > 0
        ? `<span style="font-size:1rem;color:var(--muted)">That's your ${state.visibleDeck.length}.<br><br>${_fresh} ${state.lang==='nl'?'nieuwe kaarten over — houd vast voor de volgende ronde.':(_fresh===1?'new card left — hold to continue.':'new cards left — hold to continue.')}</span>`
        : `<span style="font-size:1rem;color:var(--muted)">${state.lang==='nl'
            ? `Dat was dit hele deck — alle ${state.visibleDeck.length} kaarten.<br><br>Kies meer categorieën om door te gaan, of houd vast om dit deck opnieuw te spelen.`
            : `That's the whole deck — all ${state.visibleDeck.length} cards.<br><br>Add categories to keep going, or hold to replay this deck.`}</span>`;
      document.getElementById('card-number').textContent = '— end —';
      el.classList.remove('flipping');
      updateDrawMore();
    }, 175);
  }
}
// nextCard is defined below (APP SHELL section) — it wraps _nextCardBase with
// the end-of-draw hold gate and post-advance hooks (party/session summary).

function prevCard() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
  }
}

// ── PROGRESS & INFO ───────────────────────────────────────────────────────────
// Dot size steps down as the deck grows, so a 5- or 10-card arc gets big,
// colorful dots while a 40-card round still fits on one line.
const DOT_SIZE_STEPS = [
  [8,  10, 8],
  [14, 8,  6],
  [24, 6,  5],
  [36, 5,  4],
  [Infinity, 4, 3],
];
function renderProgress() {
  const container = document.getElementById('progress');
  const deckLen = state.visibleDeck.length;
  container.innerHTML = '';
  const MAX_DOTS = 60;
  if (deckLen <= MAX_DOTS) {
    // One dot per card, colored by category — accurate for any normal-sized
    // session, and doubles as a preview of the round's emotional shape.
    const [, size, gap] = DOT_SIZE_STEPS.find(([max]) => deckLen <= max);
    container.style.setProperty('--dot-size', size + 'px');
    container.style.setProperty('--dot-gap', gap + 'px');
    for (let i = 0; i < deckLen; i++) {
      const card = state.visibleDeck[i];
      const dot = document.createElement('div');
      const isSeen    = i < state.currentIndex;
      const isCurrent = i === state.currentIndex;
      dot.className = 'progress-dot' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
      dot.style.setProperty('--dot-color', levelColor(card.level));
      container.appendChild(dot);
    }
  } else {
    // Large decks (e.g. 'All' in Everything): bucket into MAX_DOTS proportional dots
    // so the trail always spans the whole deck instead of running out partway.
    container.style.setProperty('--dot-size', '4px');
    container.style.setProperty('--dot-gap', '3px');
    const perBucket = deckLen / MAX_DOTS;
    const currentBucket = state.currentIndex < 0 ? -1 : Math.floor(state.currentIndex / perBucket);
    for (let i = 0; i < MAX_DOTS; i++) {
      const dot = document.createElement('div');
      const isSeen    = i < currentBucket;
      const isCurrent = i === currentBucket;
      dot.className = 'progress-dot' + (isSeen ? ' seen' : '') + (isCurrent ? ' current' : '');
      container.appendChild(dot);
    }
  }
}

// ── SAFE MODE & PRESETS ───────────────────────────────────────────────────────
function syncBandLabels(){
  document.querySelectorAll('.band-lbl,.cat-band').forEach(band=>{
    let any=false;
    for(let n=band.nextElementSibling; n && !(n.classList.contains('band-lbl')||n.classList.contains('cat-band')); n=n.nextElementSibling){
      if(n.classList.contains('toggle-btn') && n.style.display!=='none'){ any=true; break; }
    }
    band.classList.toggle('band-hidden', !any);
  });
}
function applyToggleUI() {
  const preset = PRESETS[state.activePreset];
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    const on  = state.activeToggles.has(lvl);
    btn.classList.toggle('on', on);
    /* "you could also go here" — in this room, not yet chosen */
    const suggested = !!preset && !on && !btn.classList.contains('hard-locked')
                      && preset.available.includes(lvl);
    btn.classList.toggle('suggested', suggested);
  });
  syncBandLabels();
  // category colors
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    const isOn = btn.classList.contains('on');
    btn.style.color = isOn ? levelColor(lvl) : '';
  });
  if (typeof syncIntentUI === 'function') syncIntentUI();
}

let _prevSafeModeHS = null;   // remembers your After Dark state across hard-safe modes
function applyPreset(mode) {
  const preset = PRESETS[mode];
  if (!preset) return;
  state.activePreset = mode;
  // bring the active mode button into the centre of its scroll strip
  requestAnimationFrame(() => {
    const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (activeBtn && activeBtn.scrollIntoView) {
      try { activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch(e) {}
    }
  });
  // A mode is hard-safe when none of its categories — on or merely available —
  // ever reach adult territory. That used to be hardcoded to Work and Family;
  // it now covers any mode built that way, so a mode with nothing under
  // After Dark locks it away the same as Work and Family always did.
  const hasAfterDark = SAFE_BLOCKED_LEVELS.some(l => DECK_LEVELS.has(l) &&
                        (preset.on.includes(l) || preset.available.includes(l)));
  if (!hasAfterDark) {
    if (_prevSafeModeHS === null) _prevSafeModeHS = state.safeMode;
    state.safeMode = true;
  } else if (_prevSafeModeHS !== null) {
    state.safeMode = _prevSafeModeHS;
    _prevSafeModeHS = null;
  }
  const sub = document.getElementById('subtitle'); if (sub) sub.textContent = preset.subtitle;
  state.activeToggles = new Set(preset.on.filter(l => DECK_LEVELS.has(l)));
  // After Dark is opt-in: adult categories stay reachable but are never
  // pre-activated by a preset unless this build ships with spice on (editor).
  if (state.safeMode || !window.SPICE_MODE) SAFE_BLOCKED_LEVELS.forEach(l => state.activeToggles.delete(l));

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    const inMode = preset.on.includes(lvl) || preset.available.includes(lvl);
    const lockedOut = (MASTER_SAFE || WORKPLACE_MODE) && SAFE_BLOCKED_LEVELS.includes(lvl);
    const hidden = !inMode || lockedOut || !DECK_LEVELS.has(lvl) || (lvl === 'backup' && !window.SHOW_BACKUP);
    btn.style.display = hidden ? 'none' : '';
    const locked = !hidden && state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl);
    btn.classList.toggle('hard-locked', locked);
  });
  // Dev default: SPICE_MODE keeps adult categories switched on in every mode that reaches them,
  // not just at page load — otherwise leaving and returning to a mode silently drops them.
  if (window.SPICE_MODE && !state.safeMode && !MASTER_SAFE && !WORKPLACE_MODE) {
    SAFE_BLOCKED_LEVELS.forEach(lvl => {
      if (OPT_IN_ONLY.includes(lvl)) return;
      if (DECK_LEVELS.has(lvl) && (preset.on.includes(lvl) || preset.available.includes(lvl))) state.activeToggles.add(lvl);
    });
  }
  if (typeof updateGridScrollHint === 'function') updateGridScrollHint();

  const glyphBtn = document.getElementById('spiceGlyphBtn');
  const reachable = hasAfterDark && !state.safeMode && !MASTER_SAFE && !WORKPLACE_MODE;
  const adBtn = document.getElementById('afterDarkToggle');
  if (adBtn) adBtn.classList.toggle('hidden', !hasAfterDark);
  /* the spice glyph is meaningless where no adult category exists */
  if (glyphBtn) glyphBtn.classList.toggle('spice-hidden', !reachable);

  updateAfterDarkBtn();
  applyToggleUI();
}

// ── LOG & FAVOURITES ──────────────────────────────────────────────────────────
function addToLog(card) {
  if (!card) return;
  if (state.loggedQuestions.has(card.question)) return;   // re-visiting via prev/next must not re-log
  state.loggedQuestions.add(card.question);
  state.sessionLog.push({ question: card.question, level: card.level });
  renderLog();
}

function renderLog() {
  const el = document.getElementById('logList');
  el.innerHTML = state.sessionLog.length === 0
    ? '<div class="drawer-empty">No cards drawn yet.</div>'
    : [...state.sessionLog].reverse().map(c =>
        `<div class="drawer-item drawer-item--lvl" style="--lvl:${levelColor(c.level)}">
          <div class="drawer-item-meta">${LEVEL_LABELS[c.level] || esc(c.level)}</div>
          ${esc(c.question)}
        </div>`
      ).join('');
}

function loadFavourites() {
  try { const v = localStorage.getItem('bu-favourites'); if (v) state.favourites = JSON.parse(v); }
  catch(e) { state.favourites = []; }
  updateStarUI();
}

async function toggleFavourite() {
  const card = state.currentIndex >= 0 ? state.visibleDeck[state.currentIndex] : null;
  if (!card) return;
  const idx = state.favourites.findIndex(f => f.question === card.question);
  if (idx >= 0) state.favourites.splice(idx, 1);
  else state.favourites.push({ question: card.question, level: card.level });
  try { localStorage.setItem('bu-favourites', JSON.stringify(state.favourites)); } catch(e) {}
  updateStarUI();
  renderFavourites();
}

function updateStarUI() {
  const card = state.currentIndex >= 0 ? state.visibleDeck[state.currentIndex] : null;
  const star = document.getElementById('cardStar');
  if (star) star.classList.toggle('active', !!card && state.favourites.some(f => f.question === card.question));
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

function addCustomCard() {
  const text   = document.getElementById('customText').value.trim();
  const textNl = (document.getElementById('customTextNl')?.value||'').trim();
  const level  = document.getElementById('customLevel').value;
  if (!text) return;
  const card = { level, question: text, custom: true };
  if (textNl) card.nl = textNl;
  state.customCards.push(card);
  ALL_CARDS.push(card);
  try { localStorage.setItem('bu-custom-cards', JSON.stringify(state.customCards)); } catch(e) {}
  document.getElementById('customText').value = '';
  if (document.getElementById('customTextNl')) document.getElementById('customTextNl').value = '';
  renderCustomList();
  if (typeof updateCatCounts === 'function') updateCatCounts();
  initDeck();
}

function removeCustomCard(question) {
  state.customCards = state.customCards.filter(c => c.question !== question);
  const idx   = ALL_CARDS.findIndex(c => c.question === question && c.custom);
  if (idx >= 0) ALL_CARDS.splice(idx, 1);
  try { localStorage.setItem('bu-custom-cards', JSON.stringify(state.customCards)); } catch(e) {}
  renderCustomList();
  if (typeof updateCatCounts === 'function') updateCatCounts();
  initDeck();
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
// Delegated remove handler — inline onclick breaks on quotes in the question text
document.getElementById('customList').addEventListener('click', e => {
  const btn = e.target.closest('.drawer-remove-btn');
  if (!btn) return;
  const card = state.customCards[parseInt(btn.dataset.idx, 10)];
  if (card) removeCustomCard(card.question);
});

// ── INIT ──────────────────────────────────────────────────────────────────────
if (MASTER_SAFE || WORKPLACE_MODE) {
  state.safeMode = true;
  document.getElementById('afterDarkToggle').style.display  = 'none';
  document.querySelector('.spice-toggle') && (document.querySelector('.spice-toggle').style.display = 'none');
  SAFE_BLOCKED_LEVELS.forEach(l => {
    const btn = document.querySelector(`.toggle-btn[data-level="${l}"]`);
    if (btn) btn.style.display = 'none';
  });
  const dBtn = null; // 'desire' mode removed with deck v14
  if (dBtn) dBtn.style.display = 'none';
}

// Backup is a dev-only overflow category — hidden unless SHOW_BACKUP is set
if (!window.SHOW_BACKUP) {
  const bb = document.querySelector('.toggle-btn[data-level="backup"]');
  if (bb) { bb.style.display = 'none'; bb.classList.add('hard-locked'); }
}

if (WORKPLACE_MODE) {
  state.safeMode = true;
  applyPreset('work');
} else {
  state.safeMode = false;
  applyPreset('open');
}
// SPICE_MODE: add adult categories to the active set by default
if (SPICE_MODE && !MASTER_SAFE && !WORKPLACE_MODE) {
  state.safeMode = false;
  applyToggleUI();
  /* the ✦ glyph button reflects spiceMode when its own setup runs, just below */
  state.spiceMode = true;
}
document.querySelectorAll('.mode-btn').forEach(b =>
  b.classList.toggle('active', b.dataset.mode === state.activePreset)
);
initDeck();

if (DEFAULT_COLLAPSED) {
  state.categoriesCollapsed = true;
  document.getElementById('toggles')?.classList.add('collapsed');
  const ca = document.getElementById('catArrow');
  if (ca) ca.textContent = '▶';
}

loadFavourites();
loadCustomCards();
checkSavedSession();

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────

// Presets
document.querySelectorAll('.mode-btn').forEach(btn =>
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyPreset(btn.dataset.mode);
    initDeck();
  })
);

// Category toggles
document.getElementById('toggles').addEventListener('click', e => {
  const btn = e.target.closest('.toggle-btn');
  if (!btn || btn.classList.contains('hard-locked')) return;
  if (btn._longPressed) { btn._longPressed = false; return; }   // long-press reads, never toggles
  const lvl = btn.dataset.level;
  state.activeToggles[state.activeToggles.has(lvl) ? 'delete' : 'add'](lvl);
  state.activePreset = '';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  applyToggleUI();
  initDeck();
  // Show tooltip briefly then fade
  if (btn.dataset.tip) {
    btn.classList.remove('tip-fade');
    btn.classList.add('show-tip');
    setTimeout(() => { btn.classList.add('tip-fade'); btn.classList.remove('show-tip'); }, 1200);
    setTimeout(() => btn.classList.remove('tip-fade'), 1900);
  }
});

document.getElementById('selectAll').addEventListener('click', () => {
  document.querySelectorAll('.toggle-btn:not(.hard-locked)').forEach(btn => {
    if (OPT_IN_ONLY.includes(btn.dataset.level)) return;
    if (btn.dataset.level && btn.style.display !== 'none') state.activeToggles.add(btn.dataset.level);
  });
  state.activePreset = '';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  applyToggleUI();
  initDeck();
});

document.getElementById('deselectAll').addEventListener('click', () => {
  state.activeToggles.clear();
  state.activePreset = '';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  applyToggleUI();
  initDeck();
});

// Card limit
document.getElementById('limitBtns').addEventListener('click', e => {
  const btn = e.target.closest('.limit-btn');
  if (!btn) return;
  document.querySelectorAll('.limit-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.cardLimit = btn.dataset.limit === 'all' ? null : parseInt(btn.dataset.limit);
  applyLimit(true);
});

// Draw controls
document.getElementById('drawMoreBtn').addEventListener('click', drawMore);
document.getElementById('btn-next').addEventListener('click', nextCard);
document.getElementById('btn-prev').addEventListener('click', prevCard);

// Card star
document.getElementById('cardStar').addEventListener('click', e => {
  e.stopPropagation();
  toggleFavourite();
});

// Normal mode: tap the card to advance. The touch handler below owns every
// swipe gesture and calls preventDefault() when it acts, so the browser
// never synthesizes a click after a swipe — this handler only ever sees
// genuine taps and needs no "was that just a swipe?" flag to guard against.
document.getElementById('card').addEventListener('click', e => {
  if (state.partyMode) return;
  if (e.target.closest('#cardStar')) return;
  nextCard();
  updateDeckInfo();
});

// Card touch gestures — one handler owns all of them (swipe left/right to
// advance/reverse, swipe down to skip), so there's exactly one place that
// decides what a touch on the card means. Registered non-passive so it can
// call preventDefault() and suppress the synthetic click a touch leaves
// behind, in place of the flag-based "swallow the next call" guards that
// pattern otherwise forces on every listener downstream.
(function() {
  const card = document.getElementById('card');
  let startX = 0, startY = 0, startTime = 0;
  card.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  }, { passive: true });
  card.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 65 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      // never on the end/summary card
      if (state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length) {
        e.preventDefault();
        skipCard();
      }
    } else if (Date.now() - startTime < 400 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      e.preventDefault();
      dx < 0 ? nextCard() : prevCard();
    }
  }, { passive: false });
})();







// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL — UI wiring: card display, drawers, party mode, save/continue
// ─────────────────────────────────────────────────────────────────────────────

const SHUFFLE_MODES = ['wild','deep','breadth','arc'];
let shuffleModeIdx = SHUFFLE_MODES.indexOf(state.randomMode);

function updateShuffleDisplay() {
  const name = SHUFFLE_MODES[shuffleModeIdx] || state.randomMode;
  state.randomMode = name;
  // Reflect the active mode straight onto the Shuffle token value.
  const vo = document.getElementById('valOrder');
  if (vo) vo.textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

// setCardDisplay — updates card face, accent bar, and fullscreen sync
function setCardDisplay(card) {
  const lvlEl  = document.getElementById('card-level');
  const qEl    = document.getElementById('card-question');
  const numEl  = document.getElementById('card-number');
  const nextBtn= document.getElementById('btn-next');
  const accent = document.getElementById('c-accent');

  if (!card) {
    if (lvlEl)    { lvlEl.textContent=''; lvlEl.classList.remove('in'); }
    if (accent)   { accent.style.background=''; }
    if (qEl)      { qEl.textContent = state.visibleDeck.length===0
      ? (state.lang==='nl' ? 'Selecteer minstens één categorie.' : 'Select at least one category.')
      : (state.lang==='nl' ? 'Een plek om te beginnen…'   : 'A place to begin…');
      qEl.classList.remove('in'); setTimeout(()=>qEl.classList.add('in'),20);
    }
    if (numEl)    numEl.textContent = '— — —';
    if (nextBtn)  nextBtn.textContent = state.lang==='nl' ? 'Trek kaart' : 'Draw Card';
    // Update party display too
    updatePartyDisplay(null);
    return;
  }
  const color = levelColor(card.level);
  if (accent) {
    accent.style.background = color;
  }
  if (lvlEl) {
    lvlEl.textContent = LEVEL_LABELS[card.level] || '';
    lvlEl.style.color = color;
  }
  if (qEl)   qEl.textContent = translateQ(card);
  if (numEl) numEl.textContent = `${state.currentIndex + 1} / ${state.visibleDeck.length}`;
  if (nextBtn) nextBtn.textContent = state.lang==='nl' ? 'Volgende kaart' : 'Next Card';
  // Update party display
  updatePartyDisplay(card);
};

// flipToCard — animates the flip and updates accent, arc indicator, fullscreen sync
function flipToCard(card) {
  const el     = document.getElementById('card');
  const lvlEl  = document.getElementById('card-level');
  const accent = document.getElementById('c-accent');
  if (lvlEl) lvlEl.classList.remove('in');
  const qEl = document.getElementById('card-question');
  if (qEl)  qEl.classList.remove('in');
  el.classList.add('flipping');
  setTimeout(() => {
    const color = levelColor(card.level);
    if (accent) {
      accent.style.background = color;
      accent.classList.remove('accent-bloom');
      void accent.offsetWidth;
      accent.classList.add('accent-bloom');
    }
    if (lvlEl) { lvlEl.textContent = LEVEL_LABELS[card.level] || ''; lvlEl.style.color = color; }
    const qEl2 = document.getElementById('card-question');
    if (qEl2) qEl2.textContent = translateQ(card);
    const numEl = document.getElementById('card-number');
    if (numEl) numEl.textContent = `${state.currentIndex+1} / ${state.visibleDeck.length}`;
    /* let updateDrawMore own the button label — hard-coding "Next Card" here
       ran 175ms later and clobbered the "Draw more cards"/"Continue" states */
    updateDrawMore();
    requestAnimationFrame(() => {
      if (lvlEl) lvlEl.classList.add('in');
      if (qEl2)  qEl2.classList.add('in');
    });
    el.classList.remove('flipping');
    renderProgress();
    updatePartyDisplay(card);
    // Auto-save on every card
    autoSaveSession();
  }, 175);
};

// ── Party display sync ──
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

// ── Language: single switch for toggle row, menu row, and session restore ──
function setLang(l, skipRefresh) {
  state.lang = l;
  document.documentElement.lang = l;
  const ic = document.getElementById('dLangIcon'); if (ic) ic.textContent = l.toUpperCase();
  const inlineBtn = document.getElementById('btn-lang-inline'); if (inlineBtn) inlineBtn.textContent = l.toUpperCase();
  const sub = document.getElementById('dLangSub');
  if (sub) sub.textContent = l === 'en' ? 'Switch to Nederlands' : 'Schakel naar English';
  if (!skipRefresh) setCardDisplay(state.currentIndex >= 0 && state.currentIndex < state.visibleDeck.length ? state.visibleDeck[state.currentIndex] : null);
}
document.getElementById('d-lang').addEventListener('click', () => setLang(state.lang === 'en' ? 'nl' : 'en'));
const inlineLangBtn = document.getElementById('btn-lang-inline'); if (inlineLangBtn) inlineLangBtn.addEventListener('click', () => setLang(state.lang === 'en' ? 'nl' : 'en'));

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
let saveMode = '';
document.getElementById('d-save').addEventListener('click',()=>{
  closeAllDrawers();
  if (saveMode==='continue') { continueSession(); }
  else { saveSession(); }
});
function saveSession() {
  if (!state.visibleDeck.length) return;
  const data = {
    deckQuestions: state.visibleDeck.map(c=>c.question),
    fullDeckQuestions: state.fullDeck.map(c=>c.question),
    position: state.currentIndex, toggles:[...state.activeToggles],
    safeMode: state.safeMode, spiceMode: state.spiceMode, randomMode: state.randomMode, cardLimit: state.cardLimit, lang: state.lang,
    activePreset: state.activePreset,
    sessionLog: window.LOG_PERSIST ? state.sessionLog : undefined,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem('bu-session', JSON.stringify(data));
    const lbl = document.getElementById('saveBtnLabel');
    if (lbl) { lbl.textContent='Saved ✓'; setTimeout(()=>{ lbl.textContent='Save session'; },2000); }
  } catch(e){}
};
function checkSavedSession() {
  try {
    const v = localStorage.getItem('bu-session');
    if (!v) return;
    saveMode = 'continue';
    const lbl = document.getElementById('saveBtnLabel');
    if (lbl) lbl.textContent = 'Continue session →';
  } catch(e){}
};
function continueSession() {
  try {
    const v = localStorage.getItem('bu-session'); if(!v) return;
    const data = JSON.parse(v);
    state.safeMode=data.safeMode||false; state.spiceMode=data.spiceMode||false;
    state.randomMode=data.randomMode||'wild'; state.cardLimit=data.cardLimit;
    shuffleModeIdx=SHUFFLE_MODES.indexOf(state.randomMode); if(shuffleModeIdx<0) shuffleModeIdx=7;
    updateShuffleDisplay();
    state.activeToggles=new Set(data.toggles||[]);
    if (MASTER_SAFE) SAFE_BLOCKED_LEVELS.forEach(l => state.activeToggles.delete(l));
    // restore preset highlight
    state.activePreset = data.activePreset || '';
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === state.activePreset));
    // restore language (also updates lang UI + html lang attribute)
    setLang(data.lang || 'en', true);
    // restore session log
    if (window.LOG_PERSIST && Array.isArray(data.sessionLog)) {
      state.sessionLog = data.sessionLog;
      state.loggedQuestions = new Set(state.sessionLog.map(c => c.question));
      renderLog();
    }
    // sync spice glyph
    if (window.syncSpiceGlyph) window.syncSpiceGlyph();
    updateAfterDarkBtn(); applyToggleUI();
    const qMap={}; ALL_CARDS.forEach(c=>{qMap[c.question]=c;});
    state.visibleDeck=(data.deckQuestions||[]).map(q=>qMap[q]).filter(Boolean);
    state.fullDeck=(data.fullDeckQuestions||data.deckQuestions||[]).map(q=>qMap[q]).filter(Boolean);
    state.currentIndex=data.position??-1;
    document.querySelectorAll('.limit-btn').forEach(b=>b.classList.toggle('active',b.dataset.limit===(state.cardLimit===null?'all':String(state.cardLimit))));
    updateDeckInfo(); updateDrawMore(); renderProgress();
    setCardDisplay(state.currentIndex>=0 ? state.visibleDeck[state.currentIndex] : null);
    const lbl=document.getElementById('saveBtnLabel'); if(lbl) lbl.textContent='Save session';
    saveMode='';
    renderShell();
  } catch(e){ console.error('continueSession:',e); }
};

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

// ── Fullscreen party ──
(function(){
  const btn = document.getElementById('btnParty');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      state.partyMode = true;
      document.getElementById('partyOverlay').classList.add('open');
      if (state.currentIndex < 0 && state.visibleDeck.length > 0) {
        state.currentIndex = 0;
        setCardDisplay(state.visibleDeck[0]);
        renderProgress();
        updateStarUI();
        updateDrawMore();
      } else if (state.currentIndex >= 0 && state.visibleDeck[state.currentIndex]) {
        updatePartyDisplay(state.visibleDeck[state.currentIndex]);
      }
    });
  }

  const newOv = document.getElementById('partyOverlay');

  // Exit button — stop propagation so overlay listener doesn't also fire
  const exitBtn = newOv.querySelector('#partyExit');
  if (exitBtn) exitBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    state.partyMode = false;
    newOv.classList.remove('open');
  });

  // Touch: single handler, always prevents click so mobile never double-fires
  let ptsx = 0, ptsy = 0, partyBusy = false;
  const partyThrottle = (fn) => {
    if (partyBusy) return;
    partyBusy = true;
    fn();
    setTimeout(() => { partyBusy = false; }, 350);
  };

  newOv.addEventListener('touchstart', e => {
    ptsx = e.touches[0].clientX;
    ptsy = e.touches[0].clientY;
  }, { passive: true });

  newOv.addEventListener('touchend', e => {
    if (e.target.closest('#partyExit')) return;
    /* a hold just continued the draw — its release must not advance again.
       Reads the flag, doesn't clear it: the click handler below checks it
       too, in case this touchend's preventDefault doesn't fully suppress a
       trailing click (inconsistent across browsers after a long hold) —
       clearing it here would leave that click unprotected. start() clears
       it at the top of the next press. */
    if (window._endHoldFired) { e.preventDefault(); return; }
    e.preventDefault(); // suppresses subsequent click event on mobile
    const dx = e.changedTouches[0].clientX - ptsx;
    const dy = e.changedTouches[0].clientY - ptsy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      // swipe left = next, swipe right = prev
      if (dx < 0) partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
      else         partyThrottle(() => { prevCard();  updateDeckInfo(); });
    } else {
      // tap — only act on card area
      if (!e.target.closest('.party-card')) return;
      if (e.target.closest('.party-zone-prev')) partyThrottle(() => { prevCard();  updateDeckInfo(); });
      else                                       partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
    }
  }, { passive: false });

  // Click — desktop only (mobile click is suppressed by touchend's preventDefault above)
  newOv.addEventListener('click', function(e) {
    e.stopPropagation(); // prevent document-level handler from also firing
    if (e.target.closest('#partyExit')) return;
    if (window._endHoldFired) { return; }
    if (!e.target.closest('.party-card')) return; // outside card = no action
    if (e.target.closest('.party-zone-prev')) partyThrottle(() => { prevCard();  updateDeckInfo(); });
    else                                       partyThrottle(() => { nextCard();  updateDeckInfo(); updateDrawMore(); });
  });
})();

// ── Keyboard ──
document.addEventListener('keydown',e=>{
  if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;   // don't hijack typing
  if(document.querySelector('[id$="Drawer"].open')){
    if(e.key==='Escape') closeAllDrawers();
    return;                                                               // drawers own the keys
  }
  if(document.getElementById('cat-area')?.classList.contains('sheet-open')){
    if(e.key==='Escape' && typeof closeCats==='function') closeCats();
    return;
  }
  if(typeof pickMode!=='undefined' && pickMode) return;
  if(state.partyMode){
    if(e.key==='Escape')     exitParty();
    if(e.key==='ArrowRight') { nextCard(); updateDeckInfo(); updateDrawMore(); }
    if(e.key==='ArrowLeft')  { prevCard(); updateDeckInfo(); }
  } else {
    if(e.key==='ArrowRight') { nextCard(); updateDeckInfo(); }
    if(e.key==='ArrowLeft')  { prevCard(); updateDeckInfo(); }
    if(e.key==='ArrowDown')  { e.preventDefault(); skipCard(); }
  }
});



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
  if (vCats) {
    const mood = (typeof computeMood === 'function' && typeof intentIntensity !== 'undefined')
      ? computeMood([...state.activeToggles], intentIntensity, (intentFocus+1)/2) : null;
    if (mood) { vCats.textContent = mood; if (lCats) lCats.textContent = 'Mood'; }
    else      { vCats.textContent = state.activeToggles.size + '/' + total; if (lCats) lCats.textContent = 'Categories'; }
  }
  // Shuffle token: active mode
  const vOrder = document.getElementById('valOrder');
  if (vOrder && state.randomMode) vOrder.textContent = state.randomMode.charAt(0).toUpperCase() + state.randomMode.slice(1);
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
}

// ── INIT ──
// Apply initial shuffle display
updateShuffleDisplay();

// Apply After Dark state
document.getElementById('afterDarkToggle').classList.toggle('on',!state.safeMode);

// Animate UI in
setTimeout(()=>document.getElementById('card-wrap').classList.add('in'),60);
setTimeout(()=>document.getElementById('hdr').classList.add('in'),200);
setTimeout(()=>document.getElementById('preset-outer').classList.add('in'),260);
setTimeout(()=>document.getElementById('cat-area').classList.add('in'),320);
setTimeout(()=>document.getElementById('controls-wrap').classList.add('in'),380);

// Set initial category label state
(function(){
  const wrap=document.getElementById('toggles-wrap');
  const lbl=document.getElementById('catLabel');
  const arrow=document.getElementById('catArrow');
  if(DEFAULT_COLLAPSED){
    if(wrap) wrap.classList.remove('open');
    if(arrow) arrow.textContent='▶';
    if(lbl) lbl.classList.remove('open');
  } else {
    if(wrap) wrap.classList.add('open');
    if(arrow) arrow.textContent='▼';
    if(lbl) lbl.classList.add('open');
  }
})();

// Initialise card-level visibility
(function(){
  const lv=document.getElementById('card-level');
  if(lv) setTimeout(()=>lv.classList.add('in'),400);
  const qEl=document.getElementById('card-question');
  if(qEl) setTimeout(()=>qEl.classList.add('in'),400);
})();

// updateDrawMore — transforms btn-next into "draw more" / "hold to continue" as needed
function updateDrawMore() {
  // This runs after every deck-state change (nextCard, skipCard, initDeck,
  // choosePick, …), so the end-of-hand hint updates from here too — no need
  // to separately observe the DOM for it.
  hint(atEnd());
  // Always hide the standalone draw-more button — it floats awkwardly
  const standalone = document.getElementById('drawMoreBtn');
  if (standalone) standalone.classList.remove('visible');

  const remaining = state.fullDeck.length - state.visibleDeck.length;
  const atSummary  = state.visibleDeck.length > 0 && state.currentIndex >= state.visibleDeck.length;      // end-of-draw screen
  const atLastCard = state.visibleDeck.length > 0 && state.currentIndex === state.visibleDeck.length - 1; // last card of the hand
  const nextBtn = document.getElementById('btn-next');
  if (!nextBtn) return;

  if (atSummary) {
    // The end-of-draw button starts a fresh hand — NOT "draw more" (which would
    // pile 10 extra cards onto the finished hand instead of dealing a new one).
    nextBtn.classList.remove('draw-mode');
    nextBtn.classList.add('hold-mode');   /* distinct colour: this one needs a hold */
    nextBtn.textContent = state.lang === 'nl' ? 'Houd vast om door te gaan' : 'Hold to continue';
  } else if (atLastCard && remaining > 0) {
    // On the last card you can still extend the current hand by holding.
    nextBtn.classList.remove('hold-mode');
    nextBtn.classList.add('draw-mode');
    nextBtn.textContent = state.lang === 'nl' ? 'Trek meer kaarten' : 'Draw more cards';
  } else {
    nextBtn.classList.remove('draw-mode');
    nextBtn.classList.remove('hold-mode');
    nextBtn.textContent = state.currentIndex >= 0 ? (state.lang === 'nl' ? 'Volgende kaart' : 'Next Card') : (state.lang === 'nl' ? 'Trek kaart' : 'Draw Card');
  }
};

// Tap btn-next while it shows "Draw more cards" → drawMore(). Capture phase, so
// it runs instead of the normal nextCard click. No hold required.
(function(){
  const btn = document.getElementById('btn-next');
  if (!btn) return;
  btn.addEventListener('click', e => {
    if (!btn.classList.contains('draw-mode')) return;
    e.stopImmediatePropagation(); e.preventDefault();
    btn.classList.remove('draw-mode');
    drawMore(); updateDeckInfo();
  }, true);
})();

// ═══════════════════════════════════════════════════════════
// FEATURE 3: SKIP CARD — swipe down (the touch handler that recognizes the
// gesture lives with the card's other touch handling, above)
// ═══════════════════════════════════════════════════════════
// skippedCards declared at top with state variables

// Skip-undo bookkeeping lives alongside skipCard itself (not in a wrapper —
// see the undo button listener below, which shares these three).
let _undoCard = null, _undoIndex = null, _undoTimer = null;

function skipCard() {
  // Captured before the guard below, and the "show undo button" step at the
  // end runs unconditionally too — matching the swipe-down caller, which
  // already never invokes skipCard() outside a valid index.
  const undoBtn = document.getElementById('skipUndo');
  if (undoBtn) { _undoCard = state.visibleDeck[state.currentIndex]; _undoIndex = state.currentIndex; }
  if (!(state.currentIndex < 0 || state.currentIndex >= state.visibleDeck.length || state.visibleDeck.length === 0)) {
    // Remove from visibleDeck only — fullDeck stays intact for new rounds
    const removed = state.visibleDeck.splice(state.currentIndex, 1)[0];
    state.skippedCards.add(removed.question);
    // Show next card (or skipped-all state)
    if (state.visibleDeck.length === 0) {
      state.currentIndex = state.visibleDeck.length; // sentinel: past end
      const el = document.getElementById('card');
      el.classList.add('flipping');
      setTimeout(() => {
        document.getElementById('card-level').className = 'card-level';
        document.getElementById('card-level').textContent = '';
        document.getElementById('card-question').innerHTML =
          `<span style="font-size:1rem;color:var(--muted)">All cards skipped.<br><br>Hold to continue.</span>`;
        document.getElementById('card-number').textContent = '— end —';
        el.classList.remove('flipping');
        updateDrawMore();
      }, 175);
    } else {
      if (state.currentIndex >= state.visibleDeck.length) state.currentIndex = state.visibleDeck.length - 1;
      flipToCard(state.visibleDeck[state.currentIndex]);
    }
    updateDeckInfo(); renderProgress(); updateDrawMore();
  }
  if (undoBtn) {
    undoBtn.classList.add('visible');
    clearTimeout(_undoTimer);
    _undoTimer = setTimeout(() => {
      undoBtn.classList.remove('visible');
      _undoCard = null; _undoIndex = null;
    }, 3000);
  }
}

// The swipe-down gesture that calls skipCard() is recognized by the card's
// touch handler, above — skip is downward-swipe-only; a hold always means
// "continue" (see the end-of-draw hold gate below).

// ═══════════════════════════════════════════════════════════
// FEATURE 5: SESSION SUMMARY
// ═══════════════════════════════════════════════════════════
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

  const numEl = document.getElementById('card-number');
  if (numEl) numEl.textContent = '— end —';
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
function hint(on){
  const el = document.getElementById('endHint');
  if (el) el.classList.toggle('visible', !!on);
}
const END_HOLD_TARGETS = ['card','btn-next','partyOverlay'];
(function(){
  const HOLD = 550;
  let timer = null;
  window._nudgeEndHold = function(){
    const el = document.getElementById('endHint');
    if (!el) return;
    el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge');
  };
  function holdBtn(){ return document.getElementById('btn-next'); }
  function start(e){
    /* a new press starts a new gesture — never inherit a stale swallow flag */
    window._endHoldFired = false;
    if (!atEnd()) return;
    clearTimeout(timer);
    const b = holdBtn();
    if (b && e && e.currentTarget === b) b.classList.add('holding');
    timer = setTimeout(() => {
      if (b) b.classList.remove('holding');
      window._endHoldOK    = true;
      /* Swallow the release, however long the press lasted. A time window here
         expired mid-hold, letting the release advance a second card. */
      window._endHoldFired = true;
      hint(false);
      if (typeof nextCard === 'function') nextCard();
    }, HOLD);
  }
  function cancel(){
    clearTimeout(timer); timer = null;
    const b = holdBtn(); if (b) b.classList.remove('holding');
  }
  END_HOLD_TARGETS.forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('pointerdown', start);
    ['pointerup','pointerleave','pointercancel'].forEach(ev => el.addEventListener(ev, cancel));
    /* swallow the click that a completed hold leaves behind. Reads the flag
       but never clears it here — on the party overlay, touchend checks the
       same flag before this does, and if it were the one to clear it, a
       trailing click that slips through anyway (preventDefault doesn't
       always suppress it, especially after a long hold rather than a quick
       tap) would find the flag already gone and double-advance. start()
       is the only place that resets it, at the top of the next press. */
    el.addEventListener('click', e => {
      if (window._endHoldFired) {
        e.stopImmediatePropagation(); e.preventDefault();
      }
    }, true);
  });
})();

// ── Spice glyph buttons (one inline on the After Dark chapter in Play,
//    one inline on the After Dark drawer in Explore) — same state, kept in sync ──
(function(){
  const btns = [...document.querySelectorAll('.spice-glyph')];
  if (!btns.length) return;
  const update = () => btns.forEach(b => b.classList.toggle('on', state.spiceMode));
  window.syncSpiceGlyph = update;
  update();
  btns.forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();   // sits inside the After Dark chapter/bucket row — must not also toggle it
    state.spiceMode = !state.spiceMode;
    update();
    initDeck();
  }));
})();

// Fullscreen end-of-draw continue is handled by the shared end-gate above
// (bound to #partyOverlay too).

// ═══════════════════════════════════════════════════════════
// nextCard — advances the deck and runs post-advance hooks (party/session summary)
// ═══════════════════════════════════════════════════════════
function nextCard() {
  if (state.visibleDeck.length === 0 && state.skippedCards.size > 0) { initDeck(); _nextCardBase(); return; }  // all skipped: reshuffle straight into a card
  if (state.visibleDeck.length === 0) { _nextCardBase(); return; }
  // Guard: already past end (sentinel) — tap offers new round
  if (state.currentIndex >= state.visibleDeck.length) {
    /* The end of a draw is a deliberate stop: only a completed hold moves on,
       so tapping through a session can never rush past the summary unseen. */
    if (!window._endHoldOK) { _nudgeEndHold(); return; }
    window._endHoldOK = false;
    initDeck();
    _nextCardBase();   /* deal straight into the next hand — no blank card */
    return;
  }

  // 2. Pick-3 intercept (works in fullscreen too)
  {
    const picker = document.getElementById(state.partyMode ? 'partyPicker' : 'cardPicker');
    if (picker && picker.classList.contains('open')) return;
    if (pickMode) {
      const startIdx = state.currentIndex + 1;
      if (startIdx < state.visibleDeck.length) {
        const count = Math.min(3, state.visibleDeck.length - startIdx);
        if (count >= 2) { openPicker(state.visibleDeck.slice(startIdx, startIdx + count)); return; }
      }
    }
  }

  // 3. Was at end before advancing?
  const wasAtEnd = state.currentIndex >= state.visibleDeck.length - 1;

  // 4. Advance
  _nextCardBase();

  // 5. Post-advance hooks
  if (wasAtEnd) {
    if (state.partyMode) {
      // Party summary
      setTimeout(() => {
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
      }, 250);
    } else {
      // Normal mode session summary
      setTimeout(showSessionSummary, 500);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// AUTO-SAVE — called from flipToCard on every card advance
// ═══════════════════════════════════════════════════════════
function autoSaveSession() {
  if (!state.visibleDeck.length) return;
  try {
    const data = {
      deckQuestions: state.visibleDeck.map(c=>c.question),
      fullDeckQuestions: state.fullDeck.map(c=>c.question),
      position: state.currentIndex, toggles:[...state.activeToggles],
      safeMode: state.safeMode, spiceMode: state.spiceMode, randomMode: state.randomMode, cardLimit: state.cardLimit, lang: state.lang,
      activePreset: state.activePreset,
      sessionLog: window.LOG_PERSIST ? state.sessionLog : undefined,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('bu-session', JSON.stringify(data));
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════════
// SKIP UNDO — 3-second undo window after skip
// ═══════════════════════════════════════════════════════════
(function() {
  // _undoCard / _undoIndex / _undoTimer are set by skipCard() itself now.
  const undoBtn = document.getElementById('skipUndo');
  if (!undoBtn) return;

  undoBtn.addEventListener('click', () => {
    if (!_undoCard) return;
    clearTimeout(_undoTimer);
    undoBtn.classList.remove('visible');
    // Re-insert card at original position and remove from skipped set
    state.skippedCards.delete(_undoCard.question);
    const insertAt = Math.min(_undoIndex, state.visibleDeck.length);
    state.visibleDeck.splice(insertAt, 0, _undoCard);
    state.currentIndex = insertAt;
    flipToCard(state.visibleDeck[state.currentIndex]);
    updateStarUI();
    updateDeckInfo(); renderProgress(); updateDrawMore();
    _undoCard = null; _undoIndex = null;
  });
})();

// ═══════════════════════════════════════════════════════════
// SHUFFLE MODE DESCRIPTIONS
// ═══════════════════════════════════════════════════════════
const SHUFFLE_DESCRIPTIONS = {
  wild:    'Fully random — anything goes',
  deep:    'Leans toward harder, more vulnerable questions',
  breadth: 'One from every active category, cycling',
  arc:     'Warm start, depth, cool-down — repeating pattern'
};


// ═══════════════════════════════════════════════════════════
// CATEGORY TOOLTIPS
// ═══════════════════════════════════════════════════════════
const CATEGORY_DESCRIPTIONS = {
  quick:     "Small true things, answered before you can think",
  colbert:   "The Colbert Questionert — same 15 questions, asked in order",
  warm:      "The fond, the funny and the faintly ridiculous",
  culture:   "What moves you, what leaves you cold, and the places that shaped your eye",
  unwind:    "Rest, weather, small pleasures, and where you go to stop",
  life:      "The shape of your ordinary days — and whether they're yours",
  home:      "Rooms, objects, and the feeling of belonging somewhere",
  roots:     "The house you grew up in, and what it's still doing",
  past:      "Turning points, survivals, and the stories you've earned",
  self:      "Who you are once the roles come off — and what keeps you standing",
  body:      "Living in a body — pleasure, tension, failure and repair",
  mind:      "How your head actually works — attention, memory, habit, doubt",
  spirit:    "Meaning, mortality, practice — and what you hope is true",
  connect:   "How you reach people, and how you let them reach you",
  friends:   "The people you chose — and what you're like to have as a friend",
  date:      "Falling, staying, leaving — how you do love",
  attract:   "Desire before anything happens — what pulls you, and what you do with it",
  values:    "Where your lines are — and what it costs to hold them",
  world:     "Power, fairness, and the world you're actually living in",
  work:      "What you do all day — and who you become doing it",
  deep:      "The harder questions, for when the room is ready",
  raw:       "Right now, in this room — no softening",
  grief:     "Loss, and the shape it left",
  family:    "The family you have now — roles, rules, and what you'd pass on",
  failure:   "Mistakes and the patterns you keep repeating — what they cost, what they taught",
  bare:     "Direct to a fault — the questions your friends ask three drinks in ✦",
  abyss:     "The far room. For the ones who go further than most. Aftercare included. ✦",
  aron:      "Arthur Aron's 36 questions — the closeness study. Alone, they play in their original order",
  magic:     "Priya Parker's magical questions — light, surprising, proven",
  shadow:    "The parts you don't advertise — and what they cost other people",
  lens:      "How you see yourself — honestly",
  wish:      "Wanting — what you chase, what you dropped, what keeps returning",
  us:        "About this specific moment, between the two of you",
  usfriend:  "About this friendship, directly",
  uslove:    "About this relationship, directly",
  usintimate:"Physical and intimate — for the two of you only ✦",
  flesh:     "The body in desire — before and around the act ✦",
  carnal:    "The act itself, from the inside ✦",
  kinks:     "Power, edge, and what you'd rather not explain ✦",
  desire:    "The feeling of wanting and being wanted ✦",
  threshold: "Edges and limits — yours, and how you found them ✦",
  backup:    "Overflow — questions with merit that did not make the top ten",
};

const BUCKET_DESCRIPTIONS = {
  easein:        "Small talk that's actually good talk — plus the sequences that play in order",
  everyday:      "Days, rooms, and the ordinary made worth saying",
  reflection:    "Who you are once the roles come off",
  foundations:   "Where you're from, and what it's still doing",
  relationships: "The people you choose, and how you choose them",
  vulnerability: "The harder questions, for when the room is ready",
  usb:           "About the two of you. Directly",
  afterdarkb:    "Desire, named — open to anyone at the table, not only lovers \u2726",
  meta:          "Overflow — questions with merit that did not make the top ten",
};

(function() {
  const descEl = document.getElementById('catDesc');
  if (!descEl) return;
  const show = (btn) => {
    const desc = CATEGORY_DESCRIPTIONS[btn.dataset.level];
    if (!desc) return;
    descEl.textContent = desc + (btn.dataset.count ? '  ·  ' + btn.dataset.count + ' cards' : '');
    descEl.classList.add('lit');
  };
  const showBucket = (el) => {
    const desc = BUCKET_DESCRIPTIONS[el.dataset.bucket];
    if (!desc) return;
    descEl.textContent = desc;
    descEl.classList.add('lit');
  };
  document.querySelectorAll('.toggle-btn, .cbk-select').forEach(btn => {
    const isBucket = btn.classList.contains('cbk-select');
    const fire = () => isBucket ? showBucket(btn.closest('.cat-bucket')) : show(btn);
    // Desktop hover reads it too, no need to click
    btn.addEventListener('mouseenter', fire);
    // Every tap updates the description — same moment the category toggles
    btn.addEventListener('click', () => { if (!btn._longPressed) fire(); });
    // Long-press (450ms) reads the description WITHOUT toggling the category
    let touchTimer = null;
    btn.addEventListener('touchstart', () => {
      btn._longPressed = false;
      touchTimer = setTimeout(() => { btn._longPressed = true; fire(); }, 450);
    }, {passive:true});
    btn.addEventListener('touchmove', () => clearTimeout(touchTimer), {passive:true});
    btn.addEventListener('touchend',  () => clearTimeout(touchTimer), {passive:true});
  });
})();

// ═══════════════════════════════════════════════════════════
// CUSTOM CARDS — export / import
// ═══════════════════════════════════════════════════════════
(function() {
  const expBtn = document.getElementById('customExportBtn');
  const impBtn = document.getElementById('customImportBtn');
  if (expBtn) {
    expBtn.addEventListener('click', () => {
      if (!state.customCards.length) return;
      const blob = new Blob([JSON.stringify(state.customCards, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'between-us-custom-cards.json';
      a.click();
    });
  }
  if (impBtn) {
    impBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json';
      inp.onchange = async e => {
        try {
          const text = await e.target.files[0]?.text();
          if (!text) return;
          const imported = JSON.parse(text);
          if (!Array.isArray(imported)) return;
          imported.forEach(c => {
            if (!c.question || !c.level) return;
            if (state.customCards.find(x => x.question === c.question)) return; // skip dupes
            const card = { level: c.level, question: c.question, custom: true };
            if (c.nl) card.nl = c.nl;
            state.customCards.push(card);
            ALL_CARDS.push(card);
          });
          localStorage.setItem('bu-custom-cards', JSON.stringify(state.customCards));
          renderCustomList();
          updateCatCounts();
          initDeck();
        } catch(err) { console.warn('Import failed:', err); }
      };
      inp.click();
    });
  }
})();

// ═══════════════════════════════════════════════════════════
// SPICE_AVAILABLE — hide spice glyph if configured off
// ═══════════════════════════════════════════════════════════
(function() {
  if (!window.SPICE_AVAILABLE) {
    const sg = document.getElementById('spiceGlyphBtn');
    if (sg) sg.classList.add('spice-hidden');
  }
})();

// ═══════════════════════════════════════════════════════════
// PICK-3 MODE — draw 3 cards, choose one, discard the others
// ═══════════════════════════════════════════════════════════

let pickMode = false;

function openPicker(options) {
  const inParty = typeof state.partyMode !== 'undefined' && state.partyMode;
  const picker = document.getElementById(inParty ? 'partyPicker' : 'cardPicker');
  const optsEl = document.getElementById(inParty ? 'partyPickerOptions' : 'pickerOptions');
  if (!picker || !optsEl) return;

  optsEl.innerHTML = '';
  options.forEach(card => {
    const div = document.createElement('div');
    div.className = 'pick-opt';
    const color = levelColor(card.level);
    div.innerHTML = `
      <div class="pick-opt-accent" style="background:${color}"></div>
      <span class="pick-opt-level" style="color:${color}">${LEVEL_LABELS[card.level]||''}</span>
      <span class="pick-opt-q">${esc(translateQ(card))}</span>
    `;
    // stopPropagation prevents the card's own click handler from also firing
    div.addEventListener('click', e => { e.stopPropagation(); choosePick(card, options); });
    optsEl.appendChild(div);
  });

  picker.classList.add('open');
}

function closePicker() {
  ['cardPicker','partyPicker'].forEach(id=>{
    const p=document.getElementById(id); if(p) p.classList.remove('open');
  });
}

function choosePick(chosen, allOptions) {
  // Remove unchosen cards from both decks silently
  allOptions.forEach(c => {
    if (c.question === chosen.question) return;
    const vi = state.visibleDeck.findIndex(x => x.question === c.question);
    if (vi >= 0) state.visibleDeck.splice(vi, 1);
    const fi = state.fullDeck.findIndex(x => x.question === c.question);
    if (fi >= 0) state.fullDeck.splice(fi, 1);
  });
  // Set currentIndex to the chosen card
  const newIdx = state.visibleDeck.findIndex(x => x.question === chosen.question);
  if (newIdx >= 0) state.currentIndex = newIdx;
  closePicker();
  flipToCard(chosen);
  if (typeof state.partyMode !== 'undefined' && state.partyMode && typeof updatePartyDisplay === 'function') updatePartyDisplay(chosen);
  addToLog(chosen);
  updateStarUI();
  updateDeckInfo();
  renderProgress();
  updateDrawMore();
}

// Pick toggle
(function(){
  const btn = document.getElementById('pickToggle');
  if (!btn) return;
  let prevLimit = null; // remember the limit before pick mode was turned on

  btn.addEventListener('click', () => {
    pickMode = !pickMode;
    btn.classList.toggle('on', pickMode);
    renderShell();  // mirror the toggle onto the fullscreen Draw-three button

    if (pickMode) {
      // Remember current limit and switch to All so there are always enough cards to pick from
      prevLimit = state.cardLimit;
      if (state.cardLimit !== null) {
        state.cardLimit = null;
        document.querySelectorAll('.limit-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.limit === 'all'));
        initDeck();
      }
    } else {
      // Restore previous limit
      closePicker();
      if (prevLimit !== null) {
        state.cardLimit = prevLimit;
        document.querySelectorAll('.limit-btn').forEach(b =>
          b.classList.toggle('active', String(b.dataset.limit) === String(state.cardLimit)));
        initDeck();
      }
      prevLimit = null;
    }
  });
})();

// ── Category card counts in the grid ──
function updateCatCounts() {
  const counts = {};
  ALL_CARDS.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; });
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    const lvl = btn.dataset.level;
    if (!lvl) return;
    const span = btn.querySelector('.tb-count');
    if (span) span.remove();                       // buttons stay clean
    btn.dataset.count = counts[lvl] || 0;          // count lives in the tooltip instead
  });
}
updateCatCounts();

// Apply initial language to all language UI (incl. html lang attribute)
setLang(state.lang, true);

checkSavedSession();

// ── Category grid: make it obvious that it scrolls ──
(function(){
  const wrap = document.getElementById('toggles-wrap');
  if (!wrap) return;
  /* class-only and inserted once: an id here could never be unique if this ever
     ran twice, and nothing looks the element up by id anyway */
  if (!wrap.querySelector(':scope > .grid-fade'))
    wrap.insertAdjacentHTML('beforeend', '<div class="grid-fade"></div>');
  function upd(){
    const scrollable = wrap.scrollHeight > wrap.clientHeight + 4;
    const atBottom   = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 6;
    wrap.classList.toggle('can-scroll', scrollable && !atBottom);
  }
  window.updateGridScrollHint = upd;
  wrap.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  new MutationObserver(upd).observe(wrap, { childList: true, subtree: true, attributes: true });
  const mb = document.getElementById('modeBar');
  if (mb) mb.addEventListener('click', () => setTimeout(() => { wrap.scrollTop = 0; upd(); }, 60));
  upd();
})();

// ── Keep the screen awake during fullscreen play ──
(function(){
  let lock = null;
  async function acquire(){ try { if ('wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); } catch(e) {} }
  function release(){ try { lock && lock.release(); } catch(e) {} lock = null; }
  const ov = document.getElementById('partyOverlay');
  if (!ov) return;
  new MutationObserver(() => { ov.classList.contains('open') ? acquire() : release(); })
    .observe(ov, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ov.classList.contains('open')) acquire();
  });
})();

// Apply category colors to initial state
applyToggleUI();

/* ═════════ APP SHELL WIRING — trays, drawers, presets, dials ═════════ */
(function(){
  const $=id=>document.getElementById(id);

  /* ── re-home existing controls into trays ── */
  /* modes now live in the categories drawer as presets */
  const presetHost=document.createElement('div');
  presetHost.className='preset-host';
  presetHost.innerHTML='<div class="preset-host-lbl">Start from</div>';
  presetHost.appendChild($('preset-outer'));
  const topbar=document.querySelector('.cat-area .cat-topbar');
  topbar.before(presetHost);            /* presets first … */
  presetHost.after(topbar);             /* … then After Dark · All · None */
  const openRow=$('tokCats');
  const dc=$('deckCount'); dc.style.display='none'; openRow.appendChild(dc);
  $('trayHandInner').append($('limitBtns'));  /* caption stays first */

  /* ── category sheet ── */
  const catArea=document.getElementById('cat-area'), scrim=$('catScrim'),
        togglesWrap=$('toggles-wrap'), catLabel=$('catLabel');
  /* .app is a stacking context (z-index:1); the body-level scrim was painting OVER
     the drawer and eating its taps. Re-home both to <body>: scrim below, drawer above. */
  document.body.appendChild(scrim);
  document.body.appendChild(catArea);
  function openCats(){
    if(!togglesWrap.classList.contains('open')) catLabel.click(); /* keep original state machine in sync */
    catArea.classList.add('sheet-open'); scrim.classList.add('on');
    document.querySelectorAll('.tray.open,.tok.open').forEach(el=>el.classList.remove('open'));
    catArea.removeAttribute('aria-hidden');
    $('d-cats').setAttribute('aria-expanded', 'true');
    catArea.focus();
  }
  function closeCats(){
    catArea.classList.remove('sheet-open'); scrim.classList.remove('on');
    catArea.setAttribute('aria-hidden', 'true');
    $('d-cats').setAttribute('aria-expanded', 'false');
    // d-cats lives inside menuDrawer, already closed by the time this fires — a
    // stable, always-visible anchor (same one closeAllDrawers uses) is safer to
    // refocus than a trigger that may now sit inside a hidden dialog.
    const btnMenu = $('btn-menu'); if (btnMenu) try { btnMenu.focus(); } catch(e) {}
  }
  window.openCats=openCats; window.closeCats=closeCats;
  openRow.addEventListener('click', openCats);
  $('catClose').addEventListener('click', closeCats);
  scrim.addEventListener('click', closeCats);
  $('d-cats').addEventListener('click', ()=>{ if(typeof closeAllDrawers==='function') closeAllDrawers(); openCats(); });

  /* ── order list (sort modes as a list, not a cycler) ── */
  function buildOrderList(){
    const c=$('orderList');
    c.innerHTML=SHUFFLE_MODES.map(m=>
      `<button class="smp-row ${m===state.randomMode?'active':''}" data-mode="${m}">
         ${typeof shuffleShapeSVG==='function'?shuffleShapeSVG(m):''}
         <span class="smp-txt">
           <span class="smp-name">${m}</span>
           <span class="smp-desc">${(typeof SHUFFLE_DESCRIPTIONS!=='undefined'&&SHUFFLE_DESCRIPTIONS[m])||''}</span>
         </span>
       </button>`).join('');
  }
  $('orderList').addEventListener('click',e=>{
    const row=e.target.closest('.smp-row'); if(!row) return;
    state.randomMode=row.dataset.mode;
    shuffleModeIdx=SHUFFLE_MODES.indexOf(state.randomMode);
    updateShuffleDisplay(); initDeck(); updateDeckInfo(); updateDrawMore();
    buildOrderList();
    setTimeout(closeTrays,220);
  });

  /* ── accordion trays ── */
  const toks=[['tokOrder','trayOrder'],['tokHand','trayHand']];
  function closeTrays(){toks.forEach(([t2,tr2])=>{$(t2).classList.remove('open');$(tr2).classList.remove('open');});}
  /* selection anywhere inside a tray closes it — open, change, close */
  ;[['trayHandInner','.limit-btn']].forEach(([box,sel])=>{
    $(box).addEventListener('click',e=>{ if(e.target.closest(sel)) setTimeout(closeTrays,220); });
  });
  toks.forEach(([t,tr])=>{
    $(t).addEventListener('click',()=>{
      const wasOpen=$(tr).classList.contains('open');
      toks.forEach(([t2,tr2])=>{$(t2).classList.remove('open');$(tr2).classList.remove('open');});
      if(!wasOpen){
        if(tr==='trayOrder') buildOrderList();
        if(tr==='trayHand') $('handCap').textContent=(typeof state.lang!=='undefined'&&state.lang==='nl')?'Hoeveel kaarten per ronde':'How many cards per round';
        $(t).classList.add('open');$(tr).classList.add('open');
      }
    });
  });

  /* token labels are rendered from state by renderShell() — no self-observation */
  renderShell();
  $('tokLine').classList.add('in');

  /* fullscreen mirror of the pick-3 toggle */
  /* fullscreen Draw-three button forwards taps; its label + state come from renderShell() */
  const pp=$('partyPick');
  if(pp) pp.addEventListener('click',e=>{ e.stopPropagation(); $('pickToggle').click(); });

  /* ── fullscreen idle fade (concept B: resting state is only the card) ── */
  const party=$('partyOverlay'); let idleT=null, partyWasOpen=false;
  function wake(){
    if(party.classList.contains('idle')) party.classList.remove('idle');
    clearTimeout(idleT);
    if(party.classList.contains('open'))
      idleT=setTimeout(()=>{ if(party.classList.contains('open')) party.classList.add('idle'); },2800);
  }
  ['pointerdown','pointermove','keydown'].forEach(ev=>party.addEventListener(ev,wake,{passive:true}));
  new MutationObserver(()=>{
    const isOpen=party.classList.contains('open');
    if(isOpen && !partyWasOpen) wake();                       /* just entered fullscreen */
    if(!isOpen && partyWasOpen){                              /* just left it */
      clearTimeout(idleT);
      if(party.classList.contains('idle')) party.classList.remove('idle');
    }
    partyWasOpen=isOpen;
  }).observe(party,{attributes:true,attributeFilter:['class']});
})();
/* ═════════ PLAY · EXPLORE — the two ways in ═══════════════════════════════
   Play asks what kind of evening this is: five chapters you can mix, and two
   dials that weight the draw inside them. Explore is the same deck as eight
   drawers, each opening onto the categories it is made of. One selection
   underneath both, and one spice toggle and After Dark link shared above
   both tabs, so neither view goes without them.                          */
(function(){
  const $ = id => document.getElementById(id);

  const CHAPTERS = {
    warmup:    ['quick','warm'],
    findout:   ['culture','life','home','work','unwind','world',
                'self','mind','body','values','wish',
                'past','roots','family','spirit',
                'connect','friends','date','attract'],
    deeper:    ['deep','raw','shadow','grief'],
    aboutus:   ['us','usfriend','uslove'],
    afterdark: ['usintimate','flesh','carnal','bare','kinks'],
  };
  const inDeck = l => DECK_LEVELS.has(l);
  const chapterLevels = id => (CHAPTERS[id] || []).filter(inDeck);
  const bucketLevels  = id => [...document.querySelectorAll('.toggle-btn[data-bucket="'+id+'"]')]
                                .map(b => b.dataset.level).filter(inDeck);
  /* Ease In and After Dark each hold opt-in-only members (the ordered lists;
     Abyss) that a bulk click deliberately never turns on. Judging a bucket's
     on/off state against ALL its members meant it could never reach "on" —
     every click re-ran the turn-on branch, so it looked stuck and never
     deselected. On/off is judged only against the members a click can
     actually control; the count badge still shows against every member. */
  const controllable = levels => { const c = levels.filter(l => !OPT_IN_ONLY.includes(l)); return c.length ? c : levels; };

  function stateOf(levels){
    const live = levels.filter(l => !(state.safeMode && SAFE_BLOCKED_LEVELS.includes(l)));
    const pool = live.length ? live : levels;
    if (!pool.length) return 'off';
    const on = pool.filter(l => state.activeToggles.has(l)).length;
    return on === 0 ? 'off' : (on === pool.length ? 'on' : 'part');
  }

  function releasePresetMask(){
    document.querySelectorAll('.toggle-btn').forEach(b => {
      const lvl = b.dataset.level; if (!lvl) return;
      const lockedOut = (MASTER_SAFE || WORKPLACE_MODE) && SAFE_BLOCKED_LEVELS.includes(lvl);
      const hide = lockedOut || !inDeck(lvl) || (lvl === 'backup' && !window.SHOW_BACKUP);
      b.style.display = hide ? 'none' : '';
      b.classList.toggle('hard-locked', !hide && state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl));
    });
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    state.activePreset = '';
    if (typeof updateGridScrollHint === 'function') updateGridScrollHint();
  }

  function openAfterDark(){
    if (MASTER_SAFE || WORKPLACE_MODE) return false;
    if (state.safeMode) { state.safeMode = false; state.spiceMode = true; updateAfterDarkBtn(); }
    return true;
  }

  function setLevels(levels, on){
    levels.forEach(l => {
      if (on) { if (!(state.safeMode && SAFE_BLOCKED_LEVELS.includes(l))) state.activeToggles.add(l); }
      else state.activeToggles.delete(l);
    });
  }

  const INT_WORDS = ['Easy','Gentle','Balanced','Deeper','Intense'];
  const FOC_WORDS = ['About you','Leaning you','Balanced','Leaning us','About us'];
  const word = (list, t) => list[Math.min(list.length - 1, Math.floor(t * list.length))];

  function syncIntentUI(){
    document.querySelectorAll('.chapter').forEach(btn => {
      const levels  = chapterLevels(btn.dataset.chapter);
      const visible = levels.filter(l => {
        const b = document.querySelector('.toggle-btn[data-level="'+l+'"]');
        return b && b.style.display !== 'none';
      });
      const st = stateOf(visible);
      btn.classList.toggle('on',   st === 'on');
      btn.classList.toggle('part', st === 'part');
      /* a chapter with nothing reachable under it in the current mode doesn't
         belong on screen at all — the same rule an Explore drawer already
         follows (bkt-hidden), applied one level up. This is what used to
         hard-lock After Dark for Work/Family only; now it applies to any
         chapter in any mode, e.g. After Dark in New people/Solo, or
         Into the Deep in Work/Date/New people. */
      btn.classList.toggle('ch-hidden', visible.length === 0);
    });
    document.querySelectorAll('.cat-bucket').forEach(hdr => {
      const levels  = bucketLevels(hdr.dataset.bucket);
      const visible = levels.filter(l => {
        const b = document.querySelector('.toggle-btn[data-level="'+l+'"]');
        return b && b.style.display !== 'none';
      });
      const st = stateOf(controllable(visible));
      hdr.classList.toggle('on',   st === 'on');
      hdr.classList.toggle('part', st === 'part');
      hdr.classList.toggle('bkt-hidden', visible.length === 0);
      const c = hdr.querySelector('.cbk-count');
      if (c) c.textContent = visible.length
        ? visible.filter(l => state.activeToggles.has(l)).length + ' / ' + visible.length
        : '';
    });
    const iv = $('dialIntVal'), fv = $('dialFocVal');
    if (iv) iv.textContent = word(INT_WORDS, intentIntensity);
    if (fv) fv.textContent = word(FOC_WORDS, (intentFocus + 1) / 2);
    const ii = $('dialIntensity'), fi = $('dialFocus');
    if (ii) ii.style.opacity = intentOn ? '1' : '.45';
    if (fi) fi.style.opacity = intentOn ? '1' : '.45';
  }
  window.syncIntentUI = syncIntentUI;

  function commit(){
    applyToggleUI();   // now calls syncIntentUI() itself
    initDeck();
    if (typeof renderShell === 'function') renderShell();
  }

  /* ── chapters: plain add/remove toggles on whatever's already selected —
     same rule as an Explore bucket, no matter what put the current
     selection there (a preset, Explore, another chapter). A chapter never
     wipes the rest of the room; it only ever adds or removes its own
     categories. ── */
  $('chapters').addEventListener('click', e => {
    if (e.target.closest('.spice-glyph')) return;   // the inline After Dark spice toggle handles itself
    const btn = e.target.closest('.chapter'); if (!btn) return;
    const id = btn.dataset.chapter;
    const turningOn = stateOf(controllable(chapterLevels(id))) !== 'on';
    if (id === 'afterdark' && turningOn && !openAfterDark()) return;
    releasePresetMask();
    intentOn = true;
    setLevels(chapterLevels(id), turningOn);
    commit();
  });

  /* ── dials ── */
  /* Halfway is the default — a magnetic dead zone around it, felt during the
     drag itself (like Android's system sliders, or Lightroom mobile's snap
     to 0): while the finger is within a few percent of 50, the thumb holds
     at exactly 50 instead of tracking the finger 1:1, so crossing centre
     takes a small deliberate push. That reads as a physical catch. The
     previous version only snapped once on release — the thumb tracked the
     finger the whole drag, then jumped to 50 after the fact, which read as
     the value being pulled there rather than the finger feeling anything. */
  function dial(el, apply){
    if (!el) return;
    const snap = () => { if (Math.abs(+el.value - 50) <= 4) el.value = 50; };
    el.addEventListener('input', () => { snap(); apply(+el.value / 100); intentOn = true; syncIntentUI(); });
    ['change','pointerup','touchend'].forEach(ev =>
      el.addEventListener(ev, () => {
        snap();
        apply(+el.value / 100); intentOn = true; commit();
      }, {passive:true}));
  }
  dial($('dialIntensity'), t => { intentIntensity = t; });
  dial($('dialFocus'),     t => { intentFocus = t * 2 - 1; });

  /* ── defaults: what the app opens on, and what Draw plays ── */
  function applyDefaultSelection(){
    const d = window.DEFAULT_SELECTION || { mode:'chapters', chapters:['findout','deeper','aboutus'], intensity:50, focus:50 };
    releasePresetMask();
    state.activeToggles.clear();
    if (d.mode === 'all') {
      document.querySelectorAll('.toggle-btn').forEach(b => {
        const lvl = b.dataset.level;
        if (!lvl || b.style.display === 'none') return;
        if (lvl === 'backup' && !window.SHOW_BACKUP) return;
        if (OPT_IN_ONLY.includes(lvl)) return;
        if (state.safeMode && SAFE_BLOCKED_LEVELS.includes(lvl)) return;
        state.activeToggles.add(lvl);
      });
    } else {
      (d.chapters || []).forEach(id => {
        if (id === 'afterdark') { if (!openAfterDark()) return; }
        setLevels(chapterLevels(id), true);
      });
    }
    intentIntensity = (d.intensity != null ? d.intensity : 50) / 100;
    intentFocus     = ((d.focus != null ? d.focus : 50) / 100) * 2 - 1;
    const ii = $('dialIntensity'), fi = $('dialFocus');
    if (ii) ii.value = d.intensity != null ? d.intensity : 50;
    if (fi) fi.value = d.focus != null ? d.focus : 50;
    intentOn = true;
  }

  /* ── Explore drawers: select and expand are separate buttons now, each
     with a real touch target, instead of one element with a tiny hot corner
     found via closest() — that ambiguity was why the drawer only opened
     some of the time. ── */
  document.querySelectorAll('.cat-bucket').forEach(hdr => {
    const id = hdr.dataset.bucket;
    const expandBtn = hdr.querySelector('.cbk-expand');
    if (expandBtn) expandBtn.addEventListener('click', () => {
      const open = hdr.classList.toggle('open');
      document.querySelectorAll('.toggle-btn[data-bucket="'+id+'"]')
        .forEach(b => b.classList.toggle('chip-folded', !open));
      if (typeof updateGridScrollHint === 'function') updateGridScrollHint();
    });
    const selectBtn = hdr.querySelector('.cbk-select');
    if (selectBtn) selectBtn.addEventListener('click', () => {
      const levels = bucketLevels(id).filter(l => {
        const b = document.querySelector('.toggle-btn[data-level="'+l+'"]');
        return b && b.style.display !== 'none';
      });
      const turningOn = stateOf(controllable(levels)) !== 'on';
      if (id === 'afterdarkb' && turningOn && !openAfterDark()) return;
      releasePresetMask();
      intentOn = false;   // an Explore edit only drops the dials' weighting — the
                          // selection itself stays exactly as edited
      setLevels(levels.filter(l => !(turningOn && OPT_IN_ONLY.includes(l))), turningOn);
      commit();
    });
  });

  /* A chip, preset or bulk All/None is a selection of its own — the dials
     stop weighting it, so a chapter tapped afterwards doesn't silently
     resume a weighting the player never asked for here. The selection
     itself is untouched; every route in (preset, Explore, a chapter) is a
     plain add/remove toggle on whatever's already there — nothing wipes
     the room out from under whatever came before it. */
  ['toggles','modeBar','selectAll','deselectAll'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', () => { intentOn = false; syncIntentUI(); }, true);
  });

  /* Each "Start from" room has its own natural depth and focus. The preset
     itself still decides exactly which categories are on — this only moves
     the dials to where that room's mood actually sits, so if the player
     starts mixing chapters in afterwards, the dials aren't left wherever a
     different room last set them. Strangers and Work sit light; Late Night
     sits the most intense; Partner leans furthest toward Us. */
  const PRESET_DIALS = {
    open:       { intensity:50, focus:50 },
    newpeople:  { intensity:15, focus:30 },
    friends:    { intensity:20, focus:45 },
    dating:     { intensity:40, focus:55 },
    partner:    { intensity:60, focus:75 },
    latenight:  { intensity:90, focus:55 },
    solo:       { intensity:45, focus:5  },
    work:       { intensity:10, focus:25 },
    family_p:   { intensity:30, focus:40 },
  };
  const modeBarEl = $('modeBar');
  if (modeBarEl) modeBarEl.addEventListener('click', e => {
    const modeBtn = e.target.closest('.mode-btn'); if (!modeBtn) return;
    const d = PRESET_DIALS[modeBtn.dataset.mode]; if (!d) return;
    intentIntensity = d.intensity / 100;
    intentFocus     = (d.focus / 100) * 2 - 1;
    const ii = $('dialIntensity'), fi = $('dialFocus');
    if (ii) ii.value = d.intensity;
    if (fi) fi.value = d.focus;
    syncIntentUI();
  });

  /* Play's All/None are the same action from the other tab — proxy straight
     to the canonical Explore buttons so there is exactly one implementation */
  const playAll = $('selectAllPlay'), playNone = $('deselectAllPlay');
  if (playAll)  playAll.addEventListener('click',  () => $('selectAll').click());
  if (playNone) playNone.addEventListener('click', () => $('deselectAll').click());

  /* ── tabs ── */
  function showPane(name){
    $('tabPlay').classList.toggle('on', name === 'play');
    $('tabExplore').classList.toggle('on', name === 'explore');
    $('tabPlay').setAttribute('aria-selected', String(name === 'play'));
    $('tabExplore').setAttribute('aria-selected', String(name === 'explore'));
    $('panePlay').classList.toggle('on', name === 'play');
    $('paneExplore').classList.toggle('on', name === 'explore');
    syncIntentUI();   // looking is not choosing — a tab switch never re-deals the hand
    if (name === 'explore' && typeof updateGridScrollHint === 'function') updateGridScrollHint();
  }
  $('tabPlay').addEventListener('click', () => showPane('play'));
  $('tabExplore').addEventListener('click', () => showPane('explore'));

  /* ── move the re-homed presets into Play, where they belong ── */
  const presetHost = document.querySelector('.preset-host'), playPane = $('panePlay');
  if (presetHost && playPane) playPane.insertBefore(presetHost, playPane.firstChild);

  /* ── the app should never open empty: play the build's defaults now ── */
  applyDefaultSelection();
  commit();

  syncIntentUI();
})();
