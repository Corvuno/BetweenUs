// ── CATEGORIES ───────────────────────────────────────────────────────────────
// The deck's structure: categories, chapters, buckets. Card text is in questions.js.
// Static tables and lookups derived from them; no mutable state, no DOM.
// Loads right after questions.js, before config.js (which only uses the key names).

// ── CATEGORIES — one record per category, the single place that knows
//    anything about it. LEVEL_COLORS, LEVEL_DEPTH, LEVEL_LABELS,
//    CATEGORY_DESCRIPTIONS, SPICY_LEVELS, OPT_IN_ONLY, ORDERED_SOLO_LEVELS
//    and ui.js's chapter/bucket groupings are all projections of it, so a
//    fact lives in exactly one place and can't disagree with itself.
//
//    label       — display name (✦ embedded for gated categories)
//    color       — accent color
//    band        — 1 (icebreaker) to 7 (confrontational): how much the
//                  actual cards ask you to reveal. Not the same axis as
//                  `gate` — see the note below.
//    focus       — -1 (about you) to 1 (about the two of you)
//    desc        — the tooltip
//    chapter     — which Play chapter it belongs to, or omitted (Colbert/
//                  The 36/Backup aren't part of the guided evenings)
//    bucket      — which Explore bucket it belongs to, or omitted (Colbert/
//                  The 36 get their own entry point instead, same reasoning
//                  as not being in a chapter)
//    gate        — true only for the five actual After Dark (✦) categories
//    optIn       — never swept up by Select All or auto-spice; needs a
//                  deliberate tap (the ordered sets)
//    ordered     — plays in a fixed, canonical order when selected alone
//
//    Depth/exposure note: band
//    is scored by how much the actual cards ask you to reveal, not by
//    topic and not by the After Dark gate — they're deliberately different
//    axes. That's why After Dark categories land all over the band scale
//    instead of clustering at the top: flesh/bare are mostly descriptive
//    (band 3), kinks asks you to name something you keep quiet (band 5).
//    Intensity runs the same scale as depth (a category has one
//    depth, not two disagreeing ones); focus runs from a question about
//    you to a question about the two of you. ──
const CATEGORIES = {
  quick:  { label:"Quick",  color:"#ecbd3a", band:1, focus:0,
            desc:"Small true things, answered before you can think",
            chapter:"warmup", bucket:"easein" },
  warm:   { label:"Warm",   color:"#d88015", band:1, focus:0,
            desc:"The fond, the funny and the faintly ridiculous",
            chapter:"warmup", bucket:"easein" },

  culture:{ label:"Culture", color:"#cda124", band:2, focus:0,
            desc:"Everything you love or hate that someone else made",
            chapter:"surface", bucket:"viewpoints" },
  life:   { label:"Life",   color:"#5bbe62", band:2, focus:0,
            desc:"Everything that has to be done",
            chapter:"surface", bucket:"everyday" },
  home:   { label:"Home",   color:"#b7ca40", band:2, focus:0.1,
            desc:"Your four walls, and everything around them",
            chapter:"surface", bucket:"everyday" },
  work:   { label:"Work",   color:"#32a0c5", band:2, focus:0,
            desc:"The job you have, and the ones that got you here",
            chapter:"surface", bucket:"everyday" },
  unwind: { label:"Unwind", color:"#69d3c6", band:2, focus:0,
            desc:"What you do when nothing has to be done",
            chapter:"surface", bucket:"everyday" },
  world:  { label:"World",  color:"#2d6a4f", band:2, focus:0,
            desc:"Everything out there, through your eyes",
            chapter:"surface", bucket:"viewpoints" },

  self:   { label:"Self",   color:"#6bbaf0", band:5, focus:-1,
            desc:"The person under all the parts you play",
            chapter:"findout", bucket:"reflection" },
  mind:   { label:"Mind",   color:"#6277d9", band:3, focus:-0.9,
            desc:"How your head actually works",
            chapter:"findout", bucket:"reflection" },
  body:   { label:"Body",   color:"#14bbc0", band:5, focus:-0.8,
            desc:"How you treat the only body you'll get",
            chapter:"findout", bucket:"reflection" },
  values: { label:"Values", color:"#b6ba7a", band:5, focus:-0.7,
            desc:"Your principles, tested",
            chapter:"findout", bucket:"reflection" },
  wish:   { label:"Wish",   color:"#aa6cd4", band:3, focus:-0.7,
            desc:"Dreams kept, dreams outgrown",
            chapter:"findout", bucket:"reflection" },
  connect:{ label:"Connect", color:"#ea856b", band:4, focus:0.7,
            desc:"The way you let people in",
            chapter:"findout", bucket:"relationships" },
  friends:{ label:"Friendship", color:"#fe9d41", band:3, focus:0.5,
            desc:"The people you picked yourself",
            chapter:"findout", bucket:"relationships" },
  date:   { label:"Romance", color:"#d94b78", band:5, focus:0.8,
            desc:"From the first date to the last goodbye",
            chapter:"findout", bucket:"relationships" },
  attract:{ label:"Attract", color:"#da5ab6", band:3, focus:0.7,
            desc:"Who you notice first",
            chapter:"findout", bucket:"relationships" },
  family: { label:"Family", color:"#a67537", band:5, focus:0.4,
            desc:"The family you have now",
            chapter:"findout", bucket:"relationships" },
  spirit: { label:"Spirit", color:"#bc8ada", band:4, focus:-0.6,
            desc:"What you believe when no one is asking",
            chapter:"findout", bucket:"viewpoints" },

  past:   { label:"Past",   color:"#999340", band:6, focus:-0.5,
            desc:"The chapters that made you",
            chapter:"deeper", bucket:"vulnerability" },
  roots:  { label:"Roots",  color:"#866448", band:6, focus:-0.3,
            desc:"The house you grew up in, and what it's still doing",
            chapter:"deeper", bucket:"vulnerability" },
  deep:   { label:"Deep",   color:"#4e60b8", band:7, focus:0,
            desc:"What you need, and who you let see it",
            chapter:"deeper", bucket:"vulnerability" },
  raw:    { label:"Raw",    color:"#008495", band:7, focus:0.2,
            desc:"Tonight, unfiltered",
            chapter:"deeper", bucket:"vulnerability" },
  shadow: { label:"Shadow", color:"#615874", band:7, focus:0,
            desc:"The side of you that does the damage",
            chapter:"deeper", bucket:"vulnerability" },
  grief:  { label:"Grief",  color:"#8c7b9a", band:7, focus:-0.2,
            desc:"Loss, and the shape it left",
            chapter:"deeper", bucket:"vulnerability" },

  us:       { label:"Between Us",  color:"#f5b9bc", band:4, focus:1,
              desc:"About each other, directly",
              chapter:"aboutus", bucket:"usb" },
  usfriend: { label:"Us: Friends", color:"#dba383", band:4, focus:1,
              desc:"About this friendship, directly",
              chapter:"aboutus", bucket:"usb" },
  uslove:   { label:"Us: Love",    color:"#d083a6", band:5, focus:1,
              desc:"About this relationship, directly",
              chapter:"aboutus", bucket:"usb" },

  usintimate: { label:"Us: Intimate ✦", color:"#a13039", band:4, focus:1, gate:true,
                desc:"Ask each other what you'd never ask anyone else ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  flesh:      { label:"Flesh ✦",   color:"#832f4d", band:3, focus:0.6, gate:true,
                desc:"Undressed, and honest about it ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  carnal:     { label:"Carnal ✦",  color:"#8d1c22", band:4, focus:0.7, gate:true,
                desc:"Sex as you actually have it, up close ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  bare:       { label:"Bare ✦",    color:"#b52074", band:3, focus:0.3, gate:true,
                desc:"Direct to a fault — the questions your friends ask three drinks in ✦",
                chapter:"afterdark", bucket:"afterdarkb" },
  kinks:      { label:"Kink ✦",    color:"#742055", band:5, focus:0.4, gate:true,
                desc:"What does it for you, exactly ✦",
                chapter:"afterdark", bucket:"afterdarkb" },

  colbert: { label:"Colbert", color:"#dcb04a", band:1, focus:0, ordered:true, optIn:true,
             desc:"The Colbert Questionnaire — same 15 questions, asked in order" },
  aron:    { label:"The 36",  color:"#cf6478", band:4, focus:0, ordered:true, optIn:true,
             desc:"Arthur Aron's 36 questions — the closeness study. Alone, they play in their original order" },
  magic:   { label:"Magical", color:"#d0c2ed", band:1, focus:0, ordered:true, optIn:true,
             desc:"Priya Parker's magical questions — light, surprising, proven",
             bucket:"easein" },

  backup:  { label:"Backup", color:"#5b554d", band:3, focus:0, bucket:"meta",
             desc:"Overflow — questions with merit that did not make the top ten" },
};

// Derived views — projections of CATEGORIES, so they can't drift out of sync
// with it or with each other.
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

// SPICY_LEVELS (the actual After Dark gate set, ✦ in LEVEL_LABELS),
// SAFE_BLOCKED_LEVELS, ORDERED_SOLO_LEVELS and OPT_IN_ONLY all read their
// flag off CATEGORIES, so a category's gate/ordered/optIn status is set in
// exactly one place.
const SPICY_LEVELS = Object.keys(CATEGORIES).filter(k => CATEGORIES[k].gate);
const SAFE_BLOCKED_LEVELS = SPICY_LEVELS;
const ORDERED_SOLO_LEVELS = Object.keys(CATEGORIES).filter(k => CATEGORIES[k].ordered);
const OPT_IN_ONLY = Object.keys(CATEGORIES).filter(k => CATEGORIES[k].optIn);

// ═══════════════════════════════════════════════════════════
// EXPLORE BUCKETS — per-bucket data; per-category bucket membership lives on
// CATEGORIES itself (the .bucket field above). ui.js builds the Explore grid
// from this plus CATEGORIES at boot.
// ═══════════════════════════════════════════════════════════
const BUCKET_META = {
  easein:        { label:"Ease In",       color:"#d9a441", desc:"Small talk that's actually good talk" },
  everyday:      { label:"Your Days",     color:"#6bb36e", desc:"Days, rooms, and the ordinary made worth saying" },
  viewpoints:    { label:"Viewpoints",    color:"#b79c66", desc:"What you make of things — taste, the world, and what you believe" },
  reflection:    { label:"Reflection",    color:"#5082cd", desc:"Who you are once the roles come off" },
  relationships: { label:"Relationships", color:"#e8997a", desc:"The people you choose, and the family you didn't" },
  vulnerability: { label:"Vulnerability", color:"#8f74b8", desc:"Where you're from, and how far the room is willing to go" },
  usb:           { label:"Us",            color:"#d97a92", desc:"About the two of you. Directly" },
  afterdarkb:    { label:"After Dark",    color:"#c1272d", desc:"Desire, named — open to anyone at the table, not only lovers \u2726" },
  meta:          { label:"Meta",          color:"#5a5a6a", desc:"Overflow — questions with merit that did not make the top ten" },
};

// ═══════════════════════════════════════════════════════════
// CHAPTERS_META — the six chapters shown in Play (between-us.html's
// .chapter buttons), in the app's canonical order. The single stored
// source for a chapter's display name and colour — the chapter drawer's
// rail (ui.js) and the end-of-hand summary's sentence colour
// (presentation.js) both read it.
// A category's own membership in a chapter is CATEGORIES[key].chapter,
// which points at these same keys.
// ═══════════════════════════════════════════════════════════
const CHAPTERS_META = {
  warmup:    { label:"Arrive",              color:"#b98a31" },
  surface:   { label:"The Surface",         color:"#3a9c47" },
  findout:   { label:"Beneath the Surface", color:"#3a89a6" },
  deeper:    { label:"Into the Deep",       color:"#723bba" },
  aboutus:   { label:"Between Us",          color:"#c6396d" },
  afterdark: { label:"After Dark",          color:"#7a1620" },
};
const BUCKET_DESCRIPTIONS = Object.fromEntries(Object.entries(BUCKET_META).map(([k,v]) => [k, v.desc]));
