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


// ── Depth/exposure scale: 1 (icebreaker) to 7 (confrontational), by how much
//    a category's actual cards ask you to reveal — not by topic, and not by
//    the After Dark gate. The gate (✦, SPICY_LEVELS below) is a separate axis
//    entirely: who's allowed to see the card, not how hard it is to answer.
//    That's why After Dark categories land all over this scale instead of
//    clustering at the top — flesh/bare are mostly descriptive (band 3),
//    kinks asks you to name something you keep quiet (band 5), abyss reads
//    the same as roots/past — "tell me about the time/place you found this
//    out" — so it sits with them (band 6), not off on its own.
//    One table drives both the round-summary line and Arc's hand-shaping
//    (_arcHand below); LEVEL_DEPTH and LEVEL_INTENSITY are kept as two names
//    for historical call-site reasons, but they're intentionally identical
//    now — a category has one depth, not two disagreeing ones. ──
const LEVEL_DEPTH = {
  quick:1, warm:1, colbert:1, magic:1,
  culture:2, life:2, home:2, work:2, unwind:2, world:2,
  mind:3, wish:3, attract:3, flesh:3, bare:3, friends:3,
  connect:4, us:4, usfriend:4, uslove:4, usintimate:4, spirit:4, carnal:4,
  self:5, values:5, body:5, date:5, family:5, kinks:5,
  past:6, roots:6, abyss:6,
  deep:7, raw:7, shadow:7, grief:7,
  aron:4,
};
function levelDepth(l){ return LEVEL_DEPTH[l] || 3; }


/* ── Intent: two dials instead of thirty-eight switches ──────────────────
   A gated bias, not a filter: each category's chance of being drawn is
   weighted toward the dial position, steeply, but a floor under every
   weight means nothing is ever truly excluded — a round set to Intense can
   still turn up the odd Warm card, same as one set to Easy can surprise you
   with something deeper. The same weighting runs under every shuffle mode,
   Arc included — Arc's own warm/deep/cool shape does the rest from there.
   Focus runs from a question about you to a question about the two of you. */
const LEVEL_INTENSITY = LEVEL_DEPTH;
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
                "family","spirit","connect","friends","date","attract","us","usfriend","uslove"],
    // "warm"/"quick" (Arrive) weren't listed at all, on or available — that
    // hid the whole Arrive chapter rather than just leaving it unselected,
    // which isn't what "not on by default" was supposed to mean. past/roots
    // moved here from "on" too, now that they're part of Into the Deep —
    // leaving them on left that chapter's button showing "part" on load, so
    // a first click completed it to fully-on instead of clearing it.
    available: ["warm","quick","past","roots","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","colbert","aron","magic","backup","abyss"],
    subtitle:  "Everything on the table"
  },
  // Every preset below is banded now: "on" respects the depth ceiling the
  // subtitle promises, "available" is the honest stretch beyond it. Full
  // reasoning (why each is or isn't thin on purpose) is in the design log —
  // the short version is in each subtitle.
  newpeople: {
    on:        ["quick","warm","culture","life","home","work","unwind","world"],
    available: [],
    subtitle:  "Light stuff only"
  },
  work: {
    on:        ["quick","warm","culture","life","home","work","unwind","world","mind","wish"],
    available: ["attract","friends","aron","magic"],
    subtitle:  "Colleagues, with a little more room"
  },
  friends: {
    on:        ["warm","culture","life","unwind","connect","friends","attract","usfriend"],
    available: ["self","values","family","flesh","bare","past","deep","aron","magic"],
    subtitle:  "The people you chose — going further"
  },
  family_p: {
    on:        ["warm","quick","culture","life","home","family","past"],
    available: ["connect","usfriend","roots","magic"],
    subtitle:  "Warm by default, deeper if you want it"
  },
  dating: {
    on:        ["warm","culture","life","connect","date","attract","wish","values","spirit"],
    available: ["self","flesh","bare","carnal","aron","magic"],
    subtitle:  "Romance-shaped, still finding out"
  },
  partner: {
    on:        ["us","uslove","connect","wish","family","body","spirit","self","values","date"],
    available: ["past","roots","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","abyss","aron","magic"],
    subtitle:  "Mostly everything — you already know each other"
  },
  latenight: {
    on:        ["connect","self","values","wish","deep","unwind"],
    available: ["raw","shadow","grief","past","roots","usintimate","flesh","carnal","bare","kinks","abyss"],
    subtitle:  "Late, honest, and still fun"
  },
  solo: {
    on:        ["self","wish","mind","values","spirit"],
    available: ["past","roots","deep","magic"],
    subtitle:  "Just you, and what you're chasing"
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


// Shuffle mode category pools
// SPICY_LEVELS is the actual After Dark gate set (✦ in LEVEL_LABELS) — used
// by Wild's spice-mode weave and by Arc's hand-shaping below to keep the
// gate itself separate from the depth scale above. It used to list `attract`
// (not gated) and miss `usintimate` (gated) — fixed to match the real ✦ set.
const SPICY_LEVELS  = ['usintimate','flesh','carnal','bare','kinks','abyss'];
const DEEP_LEVELS   = ['deep','raw','self','values','mind','spirit','past','roots','connect','life','date','friends','world','body'];
const LIGHT_LEVELS  = ['warm','culture','unwind','home','work'];
const BORDER_LEVELS = ['attract','raw'];
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
// out of its way to keep invisible. applyRandomMode()'s 'deep'/'breadth'
// cases are left in place in deck.js, just unreachable from the UI now.
const SHUFFLE_MODES = ['wild','arc'];


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

