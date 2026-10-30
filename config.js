// ── CONFIG ───────────────────────────────────────────────────────────────────
// Build profile (?profile=), presets, helpers and the other app settings. The
// categories, chapters, buckets and their lookups (colors/depth/labels) moved
// to categories.js. No mutable state, no DOM. Loads right after it.

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
  // Shared, identical in every build. Fine-tune a version by editing its block.
  const PROFILES = {

    // PUBLIC — the copy you hand someone by default.
    public: {
      MASTER_SAFE:      false,   // true → no adult content anywhere, ever (hard lock)
      WORKPLACE_MODE:   false,   // true → hard lock + starts in Work mode
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
      // the opt-in-only lists). intensity/focus are 0-100, 50=balanced.
      // "Into the Deep" starts deselected — playtesters found it too daring
      // to be on by default; people can switch it on themselves once they
      // know what they're choosing. mode:'preset' routes through the same
      // applyPreset() every mode button uses (PRESETS.balanced, below) so
      // the matching button is shown active on load.
      DEFAULT_SELECTION: { mode:'preset', preset:'balanced', intensity:50, focus:50 },
    },

    // WORK — workplace-safe: adult content hard-locked, opens in Work mode.
    work: {
      MASTER_SAFE:      false,
      WORKPLACE_MODE:   true,
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
      // 'surface' carries the light everyday categories, giving Work an easy
      // on-ramp before the personal/reflective chapters.
      DEFAULT_SELECTION: { mode:'chapters', chapters:['surface','findout','deeper'], intensity:35, focus:50 },
    },

    // EDITOR — development build: spice pre-activated, dev conveniences on.
    editor: {
      MASTER_SAFE:      false,
      WORKPLACE_MODE:   false,
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

  // ── NO INTRO — this is intentional ───────────────────────────────────────
  // Between Us has no onboarding screen. Users hand it to each other and they
  // get it immediately. The simplicity is the point. Do not add one.
})();
const WORKPLACE_MODE    = window.WORKPLACE_MODE;
const DEFAULT_COLLAPSED = window.DEFAULT_COLLAPSED;
const MASTER_SAFE       = window.MASTER_SAFE;
const SPICE_MODE        = window.SPICE_MODE || false;
const NL_DEFAULT        = window.NL_DEFAULT || false;


// After Dark is switched on as a safety gate, not to customise a deck, so
// adding or removing an After Dark category keeps the preset. `customisedBy`
// lists the After Dark categories that still make a preset Custom.
const PRESETS = {
  open: {
    on:        ["warm","quick","connect","deep","self","culture","life","values","wish","home","roots","past","unwind","body","mind","spirit","friends","date","attract","world","work","raw","grief","family","us","usfriend","uslove","usintimate","shadow","bare"],
    available: ["colbert","aron","magic","flesh","carnal","kinks","backup"],
    customisedBy: ["usintimate"],
    subtitle:  "Everything on the table"
  },
  // The public build's actual opening selection — Beneath the Surface +
  // Between Us, deliberately short of Into the Deep and After Dark (see the
  // "Into the Deep starts deselected" note on DEFAULT_SELECTION above). It
  // matches neither "Everything" (broader) nor any narrower preset, so it has
  // its own preset and button.
  balanced: {
    on:        ["culture","life","home","work","unwind","world","self","mind","body","values","wish",
                "family","spirit","connect","friends","date","attract","us","usfriend","uslove"],
    // Arrive (warm/quick) and Into the Deep (past/roots included) are listed
    // as available, not left out: unlisted categories are hidden entirely, and
    // a chapter with only some of its categories on shows "part" on load, so
    // a first click would complete it instead of clearing it.
    available: ["warm","quick","past","roots","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","colbert","aron","magic","backup"],
    customisedBy: ["usintimate"],
    subtitle:  "Just enough edge."
  },
  // Every preset below is banded: "on" respects the depth ceiling the
  // subtitle promises, "available" is the honest stretch beyond it.
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
    available: ["past","roots","deep","raw","shadow","grief","usintimate","flesh","carnal","bare","kinks","aron","magic"],
    subtitle:  "Just the two of you."
  },
  latenight: {
    on:        ["connect","self","values","wish","deep","unwind"],
    available: ["raw","shadow","grief","past","roots","usintimate","flesh","carnal","bare","kinks"],
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


// COLBERT_OPTIONAL: questions present in the deck but not in the canonical 15.
// When COLBERT_STRICT = true (profile setting), these are filtered out during Colbert-solo play.
const COLBERT_OPTIONAL = ['Window or aisle?','Earliest memory?','Cats or dogs?'];
const COLBERT_STRICT = window.COLBERT_STRICT || false;

// deck.js treats any saved session whose randomMode isn't 'arc' as plain
// random order; these are the two it knows.
const SHUFFLE_MODES = ['wild','arc'];


