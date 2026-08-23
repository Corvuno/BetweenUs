// ── CONFIG ───────────────────────────────────────────────────────────────────
// Build profile (?profile=), level metadata (colors/depth/intensity/focus/
// labels), presets, and the other static/build-time lookup tables. No mutable
// state, no DOM. Loads first — everything else reads these tables.

(function () {
  // ╔══════════════════════════════════════════════════════════════════════╗
  // ║  BUILD PROFILE                                                         ║
  // ║  There's one shell (between-us.html) for every version — which one      ║
  // ║  this is comes from ?profile= in the URL (public/work/editor), so       ║
  // ║  the URL you hand out still always opens exactly that version with      ║
  // ║  nobody picking anything. window.BUILD_PROFILE is a fallback for the    ║
  // ║  offline single-file build (scripts/build-single-file.mjs), which has   ║
  // ║  no URL to read and bakes the profile in as a script tag instead.       ║
  // ║  Everything else below is derived from the profile.                     ║
  // ╚══════════════════════════════════════════════════════════════════════╝
  //
  // NOTE: the work profile's adult-content lock relies on the profile being
  // trusted input. Anyone can edit ?profile= in the address bar to switch
  // away from it — this is a courtesy default, not a security boundary.

  const BUILD_PROFILE = new URLSearchParams(location.search).get('profile') || window.BUILD_PROFILE || "public";   // "public" · "work" · "editor"

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
      // "Into the Deep" starts deselected — playtesters found it too daring
      // to be on by default; people can switch it on themselves once they
      // know what they're choosing. mode:'preset' routes through the same
      // applyPreset() every mode button uses (PRESETS.balanced, below) so
      // the matching button is correctly shown active on load, instead of
      // a bespoke chapters-only selection no button could ever honestly
      // claim.
      DEFAULT_SELECTION: { mode:'preset', preset:'balanced', intensity:50, focus:50 },
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
      // just not one that needs Between Us or the far end of the intensity dial.
      // 'surface' added alongside the split: 'findout' used to carry the light
      // everyday categories itself, so leaving it out here would have quietly
      // dropped Work straight into personal/reflective territory with no easy
      // on-ramp left in front of it.
      DEFAULT_SELECTION: { mode:'chapters', chapters:['surface','findout','deeper'], intensity:35, focus:50 },
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


// ── CATEGORIES — one record per category, one place that knows anything
//    about it. Everything below this block (LEVEL_COLORS, LEVEL_DEPTH,
//    LEVEL_LABELS, CATEGORY_DESCRIPTIONS, CHAPTERS, the Explore bucket grid
//    in between-us.html, SPICY_LEVELS, OPT_IN_ONLY, ORDERED_SOLO_LEVELS...)
//    used to each carry their own copy of some subset of this — color in
//    one table, depth in another, gate membership in a third, chapter
//    membership in ui.js, bucket membership only in hand-typed HTML
//    attributes nowhere near any of it. Four separate real bugs came out of
//    that shape this session alone (SPICY_LEVELS missing usintimate and
//    wrongly including attract; LEVEL_COLORS and LEVEL_LABELS each silently
//    shadowing an earlier `flesh` entry with a later duplicate key; presets
//    quietly holding onto categories that had moved chapters). A duplicate
//    fact is a fact that can disagree with itself — this is the fix.
//
//    label       — display name (✦ embedded for gated categories)
//    color       — accent color
//    band        — 1 (icebreaker) to 7 (confrontational): how much the
//                  actual cards ask you to reveal. Not the same axis as
//                  `gate` — see the note that used to live on LEVEL_DEPTH,
//                  preserved below.
//    focus       — -1 (about you) to 1 (about the two of you)
//    desc        — the tooltip
//    chapter     — which Play chapter it belongs to, or omitted (Colbert/
//                  The 36/Abyss/Backup aren't part of the guided evenings)
//    bucket      — which Explore bucket it belongs to, or omitted (Colbert/
//                  The 36 get their own entry point instead, same reasoning
//                  as not being in a chapter)
//    gate        — true only for the six actual After Dark (✦) categories
//    optIn       — never swept up by Select All or auto-spice; needs a
//                  deliberate tap (the ordered sets, plus Abyss)
//    ordered     — plays in a fixed, canonical order when selected alone
//
//    Depth/exposure note, preserved from the old LEVEL_DEPTH comment: band
//    is scored by how much the actual cards ask you to reveal, not by
//    topic and not by the After Dark gate — they're deliberately different
//    axes. That's why After Dark categories land all over the band scale
//    instead of clustering at the top: flesh/bare are mostly descriptive
//    (band 3), kinks asks you to name something you keep quiet (band 5),
//    abyss reads the same as roots/past — "tell me about the time/place
//    you found this out" — so it sits with them (band 6), not off on its
//    own. Intensity runs the same scale as depth (a category has one
//    depth, not two disagreeing ones); focus runs from a question about
//    you to a question about the two of you. ──
const CATEGORIES = {
  quick:  { label:"Quick",  color:"#f3c33c", band:1, focus:0,
            desc:"Small true things, answered before you can think",
            chapter:"warmup", bucket:"easein" },
  warm:   { label:"Warm",   color:"#d58b34", band:1, focus:0,
            desc:"The fond, the funny and the faintly ridiculous",
            chapter:"warmup", bucket:"easein" },

  culture:{ label:"Culture", color:"#c99765", band:2, focus:0,
            desc:"What moves you, what leaves you cold, and the places that shaped your eye",
            chapter:"surface", bucket:"viewpoints" },
  life:   { label:"Life",   color:"#80bb66", band:2, focus:0,
            desc:"The shape of your ordinary days — and whether they're yours",
            chapter:"surface", bucket:"everyday" },
  home:   { label:"Home",   color:"#97c965", band:2, focus:0.1,
            desc:"Rooms, objects, and the feeling of belonging somewhere",
            chapter:"surface", bucket:"everyday" },
  work:   { label:"Work",   color:"#4dbebe", band:2, focus:0,
            desc:"What you do all day — and who you become doing it",
            chapter:"surface", bucket:"everyday" },
  unwind: { label:"Unwind", color:"#4ec1a0", band:2, focus:0,
            desc:"Rest, weather, small pleasures, and where you go to stop",
            chapter:"surface", bucket:"everyday" },
  world:  { label:"World",  color:"#3aabdd", band:2, focus:0,
            desc:"Power, fairness, and the world you're actually living in",
            chapter:"surface", bucket:"viewpoints" },

  self:   { label:"Self",   color:"#669bbb", band:5, focus:-1,
            desc:"Who you are once the roles come off — and what keeps you standing",
            chapter:"findout", bucket:"reflection" },
  mind:   { label:"Mind",   color:"#5082cd", band:3, focus:-0.9,
            desc:"How your head actually works — attention, memory, habit, doubt",
            chapter:"findout", bucket:"reflection" },
  body:   { label:"Body",   color:"#7bb397", band:5, focus:-0.8,
            desc:"Living in a body — pleasure, tension, failure and repair",
            chapter:"findout", bucket:"reflection" },
  values: { label:"Values", color:"#caae3d", band:5, focus:-0.7,
            desc:"Where your lines are — and what it costs to hold them",
            chapter:"findout", bucket:"reflection" },
  wish:   { label:"Wish",   color:"#937ac6", band:3, focus:-0.7,
            desc:"Wanting — what you chase, what you dropped, what keeps returning",
            chapter:"findout", bucket:"reflection" },
  connect:{ label:"Connect", color:"#65c9b0", band:4, focus:0.7,
            desc:"How you reach people, and how you let them reach you",
            chapter:"findout", bucket:"relationships" },
  friends:{ label:"Friendship", color:"#6bb36e", band:3, focus:0.5,
            desc:"The people you chose — and what you're like to have as a friend",
            chapter:"findout", bucket:"relationships" },
  date:   { label:"Romance", color:"#df7a91", band:5, focus:0.8,
            desc:"Falling, staying, leaving — how you do love",
            chapter:"findout", bucket:"relationships" },
  attract:{ label:"Attract", color:"#e8997a", band:3, focus:0.7,
            desc:"Desire before anything happens — what pulls you, and what you do with it",
            chapter:"findout", bucket:"relationships" },
  family: { label:"Family", color:"#ba8e58", band:5, focus:0.4,
            desc:"The family you have now — roles, rules, and what you'd pass on",
            chapter:"findout", bucket:"relationships" },
  spirit: { label:"Spirit", color:"#ad7ac6", band:4, focus:-0.6,
            desc:"Meaning, mortality, practice — and what you hope is true",
            chapter:"findout", bucket:"viewpoints" },

  past:   { label:"Past",   color:"#b79c66", band:6, focus:-0.5,
            desc:"Turning points, survivals, and the stories you've earned",
            chapter:"deeper", bucket:"vulnerability" },
  roots:  { label:"Roots",  color:"#ad8d4c", band:6, focus:-0.3,
            desc:"The house you grew up in, and what it's still doing",
            chapter:"deeper", bucket:"vulnerability" },
  deep:   { label:"Deep",   color:"#f3c33c", band:7, focus:0,
            desc:"The harder questions, for when the room is ready",
            chapter:"deeper", bucket:"vulnerability" },
  raw:    { label:"Raw",    color:"#eb6d6d", band:7, focus:0.2,
            desc:"Right now, in this room — no softening",
            chapter:"deeper", bucket:"vulnerability" },
  shadow: { label:"Shadow", color:"#75609c", band:7, focus:0,
            desc:"The parts you don't advertise — and what they cost other people",
            chapter:"deeper", bucket:"vulnerability" },
  grief:  { label:"Grief",  color:"#7d7da0", band:7, focus:-0.2,
            desc:"Loss, and the shape it left",
            chapter:"deeper", bucket:"vulnerability" },

  us:       { label:"Between Us",  color:"#e8af7a", band:4, focus:1,
              desc:"About this specific moment, between the two of you",
              chapter:"aboutus", bucket:"usb" },
  usfriend: { label:"Us: Friends", color:"#bea466", band:4, focus:1,
              desc:"About this friendship, directly",
              chapter:"aboutus", bucket:"usb" },
  uslove:   { label:"Us: Love",    color:"#df7777", band:4, focus:1,
              desc:"About this relationship, directly",
              chapter:"aboutus", bucket:"usb" },

  usintimate: { label:"Us: Intimate ✦", color:"#e84a4a", band:4, focus:1, gate:true,
                desc:"Physical and intimate — for the two of you only ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  flesh:      { label:"Flesh ✦",   color:"#8a305a", band:3, focus:0.6, gate:true,
                desc:"The body in desire — before and around the act ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  carnal:     { label:"Carnal ✦",  color:"#c81f1f", band:4, focus:0.7, gate:true,
                desc:"The act itself, from the inside ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  bare:       { label:"Bare ✦",    color:"#e2603c", band:3, focus:0.3, gate:true,
                desc:"Direct to a fault — the questions your friends ask three drinks in ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  kinks:      { label:"Kink ✦",    color:"#a1247a", band:5, focus:0.4, gate:true,
                desc:"Power, edge, and what you'd rather not explain ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  abyss:      { label:"Abyss ✦",   color:"#b00000", band:6, focus:0, gate:true, optIn:true,
                desc:"The far room. For the ones who go further than most. Aftercare included. ✦",
                bucket:"afterdarkb" },

  colbert: { label:"Colbert", color:"#f3c33c", band:1, focus:0, ordered:true, optIn:true,
             desc:"The Colbert Questionnaire — same 15 questions, asked in order" },
  aron:    { label:"The 36",  color:"#e75783", band:4, focus:0, ordered:true, optIn:true,
             desc:"Arthur Aron's 36 questions — the closeness study. Alone, they play in their original order" },
  magic:   { label:"Magical", color:"#8066e1", band:1, focus:0, ordered:true, optIn:true,
             desc:"Priya Parker's magical questions — light, surprising, proven",
             bucket:"easein" },

  backup:  { label:"Backup", color:"#5a5a6a", band:3, focus:0, bucket:"meta",
             desc:"Overflow — questions with merit that did not make the top ten" },
};

// Derived views — every one of these used to be its own hand-maintained
// table. Now they're all just projections of CATEGORIES, so they can't
// drift out of sync with it or with each other.
const LEVEL_COLORS   = Object.fromEntries(Object.entries(CATEGORIES).map(([k,v]) => [k, v.color]));
const LEVEL_DEPTH     = Object.fromEntries(Object.entries(CATEGORIES).map(([k,v]) => [k, v.band]));
const LEVEL_INTENSITY = LEVEL_DEPTH;
const LEVEL_FOCUS     = Object.fromEntries(Object.entries(CATEGORIES).map(([k,v]) => [k, v.focus]));
const LEVEL_LABELS    = Object.fromEntries(Object.entries(CATEGORIES).map(([k,v]) => [k, v.label]));
const CATEGORY_DESCRIPTIONS = Object.fromEntries(Object.entries(CATEGORIES).map(([k,v]) => [k, v.desc]));

function levelColor(l){ return LEVEL_COLORS[l]||'#c9a84c'; }
function levelDepth(l){ return LEVEL_DEPTH[l] || 3; }
function levelIntensity(l){ return LEVEL_INTENSITY[l] != null ? LEVEL_INTENSITY[l] : 3; }
function levelFocus(l){ return LEVEL_FOCUS[l] != null ? LEVEL_FOCUS[l] : 0; }

const PRESETS = {
  open: {
    on:        ["warm","quick","connect","deep","self","culture","life","values","wish","home","roots","past","unwind","body","mind","spirit","friends","date","attract","world","work","raw","grief","family","us","usfriend","uslove","usintimate","shadow","bare"],
    available: ["colbert","aron","magic","carnal","kinks","backup","abyss"],
    subtitle:  "Everything on the table"
  },
  // The public build's actual opening selection — Beneath the Surface +
  // Between Us, deliberately short of Into the Deep and After Dark (see the
  // "Into the Deep starts deselected" note on DEFAULT_SELECTION above). This
  // used to be applied through a separate chapters-only code path that never
  // marked any mode button active, since it matches neither "Everything"
  // (broader) nor any narrower preset — it's its own thing, so it gets its
  // own preset and button rather than leaving the row showing nothing
  // selected.
  balanced: {
    on:        ["culture","life","home","work","unwind","world","self","mind","body","values","wish",
                "family","spirit","connect","friends","date","attract","us","usfriend","uslove"],
    // "warm"/"quick" (Arrive) weren't listed at all, on or available — that
    // hid the whole Arrive chapter rather than just leaving it unselected,
    // which isn't what "not on by default" was supposed to mean. past/roots
    // moved here from "on" too, now that they're part of Into the Deep —
    // leaving them on left that chapter's button showing "part" on load, so
    // a first click completed it to fully-on instead of clearing it.
    available: ["warm","quick","past","roots","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","colbert","aron","magic","backup","abyss"],
    subtitle:  "Just enough edge."
  },
  // Every preset below is banded now: "on" respects the depth ceiling the
  // subtitle promises, "available" is the honest stretch beyond it. Full
  // reasoning (why each is or isn't thin on purpose) is in the design log —
  // the short version is in each subtitle.
  newpeople: {
    on:        ["quick","warm","culture","life","home","work","unwind","world"],
    available: [],
    subtitle:  "No history required."
  },
  work: {
    on:        ["quick","warm","culture","life","home","work","unwind","world","mind","wish"],
    available: ["attract","friends","aron","magic"],
    subtitle:  "Professional, mostly."
  },
  friends: {
    on:        ["warm","culture","life","unwind","connect","friends","attract","usfriend"],
    available: ["self","values","family","flesh","bare","past","deep","aron","magic"],
    subtitle:  "Getting to know another side."
  },
  family_p: {
    on:        ["warm","quick","culture","life","home","family","past"],
    available: ["connect","usfriend","roots","magic"],
    subtitle:  "The people who knew you first."
  },
  dating: {
    on:        ["warm","culture","life","connect","date","attract","wish","values","spirit"],
    available: ["self","flesh","bare","carnal","aron","magic"],
    subtitle:  "Humble beginnings with potential."
  },
  partner: {
    on:        ["us","uslove","connect","wish","family","body","spirit","self","values","date"],
    available: ["past","roots","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","abyss","aron","magic"],
    subtitle:  "Just the two of you."
  },
  latenight: {
    on:        ["connect","self","values","wish","deep","unwind"],
    available: ["raw","shadow","grief","past","roots","usintimate","flesh","carnal","bare","kinks","abyss"],
    subtitle:  "When it doesn't need softening."
  },
  solo: {
    on:        ["self","wish","mind","values","spirit"],
    available: ["past","roots","deep","magic"],
    subtitle:  "The one conversation you don't perform."
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


// SPICY_LEVELS (the actual After Dark gate set, ✦ in LEVEL_LABELS),
// SAFE_BLOCKED_LEVELS, ORDERED_SOLO_LEVELS and OPT_IN_ONLY all just read
// their flag off CATEGORIES now, so a category's gate/ordered/optIn status
// is set in exactly one place. SPICY_LEVELS used to be its own hand-typed
// list and had drifted (listed `attract`, which isn't gated; missed
// `usintimate`, which is); SAFE_BLOCKED_LEVELS was a second hand-typed list
// of the exact same six categories, just in a different order — same fact,
// two places it could (and did) disagree.
const SPICY_LEVELS = Object.keys(CATEGORIES).filter(k => CATEGORIES[k].gate);
const SAFE_BLOCKED_LEVELS = SPICY_LEVELS;
const ORDERED_SOLO_LEVELS = Object.keys(CATEGORIES).filter(k => CATEGORIES[k].ordered);
const OPT_IN_ONLY = Object.keys(CATEGORIES).filter(k => CATEGORIES[k].optIn);
// COLBERT_OPTIONAL: questions present in the deck but not in the canonical 15.
// When COLBERT_STRICT = true (HTML setting), these are filtered out during Colbert-solo play.
const COLBERT_OPTIONAL = ['Window or aisle?','Earliest memory?','Cats or dogs?'];
const COLBERT_STRICT = window.COLBERT_STRICT || false;

// Deep and Breadth dropped from the picker: Deep duplicated what the Depth
// dial already does (and does more precisely, continuously); Breadth's
// whole premise ("one from every active category") surfaced "categories"
// as a concept the player has to think about, which the app otherwise goes
// out of its way to keep invisible. applyRandomMode()'s switch in deck.js
// still has a default (plain shuffle) for any old saved session that has
// 'deep'/'breadth' in storage, but the cases themselves are gone.
const SHUFFLE_MODES = ['wild','arc'];


// ═══════════════════════════════════════════════════════════
// SHUFFLE MODE DESCRIPTIONS
// ═══════════════════════════════════════════════════════════
const SHUFFLE_DESCRIPTIONS = {
  wild: 'Fully random — anything goes',
  arc:  'Warm start, depth, cool-down — repeating pattern'
};


// ═══════════════════════════════════════════════════════════
// EXPLORE BUCKETS — the only per-bucket data left; per-category bucket
// membership lives on CATEGORIES itself (see the .bucket field above).
// between-us.html no longer hand-authors the bucket grid — ui.js builds it
// from this plus CATEGORIES at boot (see renderBucketGrid in ui.js).
// ═══════════════════════════════════════════════════════════
const BUCKET_META = {
  easein:        { label:"Ease In",       color:"#d9a441", desc:"Small talk that's actually good talk" },
  everyday:      { label:"Your Days",     color:"#6bb36e", desc:"Days, rooms, and the ordinary made worth saying" },
  viewpoints:    { label:"Viewpoints",    color:"#b79c66", desc:"What you make of things — taste, the world, and what you believe" },
  reflection:    { label:"Reflection",    color:"#5082cd", desc:"Who you are once the roles come off" },
  relationships: { label:"Relationships", color:"#e8997a", desc:"The people you choose, and the family you didn't" },
  vulnerability: { label:"Vulnerability", color:"#8f74b8", desc:"Where you're from, and how far the room is willing to go" },
  usb:           { label:"Us",            color:"#d97a92", desc:"About the two of you. Directly" },
  afterdarkb:    { label:"After Dark",    color:"#ff2f2f", desc:"Desire, named — open to anyone at the table, not only lovers \u2726" },
  meta:          { label:"Meta",          color:"#5a5a6a", desc:"Overflow — questions with merit that did not make the top ten" },
};
const BUCKET_DESCRIPTIONS = Object.fromEntries(Object.entries(BUCKET_META).map(([k,v]) => [k, v.desc]));

