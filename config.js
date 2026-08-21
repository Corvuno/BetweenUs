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
  body:"#7bb397",move:"#65c77f",life:"#80bb66",roots:"#ad8d4c",friends:"#6bb36e",
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
                "past","roots","family","spirit","connect","friends","date","attract","us","usfriend","uslove"],
    // "warm"/"quick" (Arrive) weren't listed at all, on or available — that
    // hid the whole Arrive chapter rather than just leaving it unselected,
    // which isn't what "not on by default" was supposed to mean.
    available: ["warm","quick","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","colbert","aron","magic","backup","abyss"],
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


// Shuffle mode category pool — Wild's spiceMode weighting
const SPICY_LEVELS  = ['flesh','carnal','kinks','attract','bare','abyss'];
// COLBERT_OPTIONAL: questions present in the deck but not in the canonical 15.
// When COLBERT_STRICT = true (HTML setting), these are filtered out during Colbert-solo play.
const COLBERT_OPTIONAL = ['Window or aisle?','Earliest memory?','Cats or dogs?'];
const COLBERT_STRICT = window.COLBERT_STRICT || false;

// Sets that play in their canonical order when selected alone
const ORDERED_SOLO_LEVELS = ['colbert', 'aron', 'magic'];
// Opt-in-only: never swept up by Select All or auto-spice — a deliberate tap required.
const OPT_IN_ONLY = ['colbert', 'aron', 'magic', 'abyss'];

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
// CATEGORY TOOLTIPS
// ═══════════════════════════════════════════════════════════

const CATEGORY_DESCRIPTIONS = {
  quick:     "Small true things, answered before you can think",
  colbert:   "The Colbert Questionnaire — same 15 questions, asked in order",
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

