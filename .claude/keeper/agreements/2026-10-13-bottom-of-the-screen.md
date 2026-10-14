# The bottom of the screen — agreement, 2026-10-13

Owner's words: "the bottom side of the application looks less well designed as the rest
and is fricking unclear to people." Approved after three rounds of questions, with the
owner's amendments to B folded in.

What players did (owner's observations): back was probably found; one person found the
menu (fine — most of it is on screen already); people tap Twist when it isn't active (e.g.
while Three shows its options), nothing happens, and they don't try again; when Twist works
they don't see what it did; Three gets tapped and then figured out; one player who had found
Three and Twist asked for "a focus mode where the menu is removed" — that is Full screen,
which he missed entirely.

## B) Looks — looks-builder

What changes:
- Back and menu may stay part of the bar, but must look like they belong and are tappable,
  not like empty slots. Owner: Next Card, back and menu may also change if that helps — not
  a must, they only have to look good.
- Three, Full screen and Twist read as tappable at one even strength, without explaining
  words added. No loose pills or boxes — unless a mockup shows a version that works.
- Full screen must read as "just the card, nothing else". Its label may change (owner:
  "Focus, or whatever word works better").
- Existing words may change where that makes things clearer; no extra words.
- Where the "n / total" numbers sit is open (they used to be on the card) — part of the
  mockups.

What stays: Draw is the one clear main action; the symmetry (basis of the design language);
the progress bar.

Way of working: mockup rounds, current bottom next to the options, every round its own new
link; the owner picks; nothing is built before that.

## C) How the app works — app-builder

What changes:
- Tapping Twist when it can't be used (before the first draw, during Three) no longer does
  nothing silently.
- When Twist works, it is clear that the extra line on the card came from Twist.

What stays: what Three, Full screen and Twist do; what is in the menu.

Options in plain words go to the owner before anything is built.

## How they pull on each other

If Twist hides or changes shape when it can't be used, the row's symmetry changes — so the
Twist choices from C are shown inside the B mockups.

## Done when

The mockup the owner picked is built as shown, and the Keeper has checked it on phone-size
screenshots against that mockup; the C behaviour the owner picked works when tried as a
player.

---

## Revised and approved, 2026-10-13 (after eight mockup rounds)

Replaces the B and C sections above; those stay as the record of where this started.
Mockups: round 6 https://claude.ai/artifact/K6Up3fQYdQW7pKmJ4dQGK7 is the whole-screen
reference; round 8 https://claude.ai/artifact/6bzN7zqn8ZtRpmhN4Tn6Nj option B1 is the hint tone.

### B) Looks — looks-builder
- Draw (Next Card / Draw Card) stays exactly as it is.
- Back and menu: same square frame, frame colour = the gold of Draw at border-strong
  strength (rgba(201,168,76,.38)); symbols in copper #C67B28.
- The row Three · Spotlight · Twist: all in celadon #A9C7B6 (symbol + word), one even
  strength, between two fading horizontal rules in celadon (~42% alpha), with small
  rotated-square separators in celadon between the items. No boxes, pills or outlines
  around any item. Active state: underline under the word.
- Hints under each item: darker celadon #5b6b63 ("B1"), Cormorant Garamond italic, ~.88rem,
  centred, may wrap to two lines. Exact words:
  "pick one of three" / "the question takes the stage" / "same question, new angle"
- Logo ornament: the small centre diamond in copper #C67B28; the two inner horizontal line
  pairs (the half-opacity ones) take the active preset's colour (the same colour as the
  preset name under "Selected"). Tagline unchanged.
- Start card (card back, before the first draw): the centre diamond of the mark and the
  line under it take the active preset's colour.
- "Custom" (the preset label when categories are picked by hand) is copper #C67B28,
  everywhere the preset colour is used.
- Twist's line on the card is celadon.
- Equal visible gaps of ~33px: from the tagline to "Selected", and from the line under the
  preset name to the top of the card (phone width; keep them equal at other widths).
- Bar, numbers and tagline otherwise unchanged.

### C) How it works — app-builder
- "Full screen" is renamed "Spotlight" on the button and anywhere else in the app's chrome.
  NOT in How to play — the owner leaves How to play alone for now.
- Each hint disappears for good the moment its control has actually worked once (Three
  switched on, Spotlight opened, Twist applied). A shake on a dimmed Twist does not count.
  Stored per device; never comes back by itself.
- New menu item directly below How to play: label "Show hints again", sub-line
  "Every hint back, for whoever's new". It brings back every hint, including "tap to
  change", and any hint added later.
- Twist when it can't be used (before the first draw, during Three): stays dimmed; a tap
  makes it shake (short horizontal shake, no words).
- Twist when it works: the word Twist and the new line on the card light up together for
  about half a second, then settle.
- Spotlight brightens once (to near white, ~1s, no glow) when the third card is drawn,
  once per device. Provisional — to be tested.

### Done when
Built as in round 6 with the round 8 B1 hint tone; the Keeper has checked it on phone
screenshots against those mockups; the tester has gone through it as a player; on main.

---

## Follow-up approved, 2026-10-14 (rounds 9–10)

- Logo inner lines at full preset colour (built 40039a0), desktop fits again (40039a0).
- One accent: celadon. Back and menu symbols in celadon (#A9C7B6), frame the faint gold of the
  first edition (rgba(201,168,76,.2)); on tap/press (and hover) frame and symbol turn gold
  (#c9a84c), as in between-us-first.html `.btn-nav:hover`. Copper stays only in the logo's centre
  diamond and in Custom. Owner on cream: too close to the card's letters, fights it for attention.
  Reference: round 10 https://claude.ai/artifact/9AHupwHrWbcZg2vGqrr77T, "One accent: celadon".

---

## Follow-up approved, 2026-10-14 (start screen, hover, How to play)

C) How it works — app-builder
- Start screen (before the first card is drawn): Three, Spotlight and Twist are all dimmed and
  can't be used; a tap makes the tapped one shake, exactly like Twist does now. They become
  usable with the first card. The hints under them stay at full strength while the row is
  dimmed (owner: "option 2"). Back is NOT part of this (owner didn't decide; stays as is).
  Three no longer starts a hand from the start screen — first draw, then Three.
- How to play: archive everything except the opening line ("This isn't a quiz…"), the Ways to
  play section (the seven tiles + the "There are more ways than these…" note) and the closing
  line ("No winners, no right answers…"). Archived text is kept word for word in
  questions/how-to-play-archive.md. Menu item renamed — owner delegated the wording, it is a
  placeholder: label "Ways to play", sub-line "Seven ways round the table". The help panel's
  own title follows the new name.

B) Looks — same builder
- Hover (pointer devices) and press on Three, Spotlight and Twist: they light up gold (#c9a84c),
  like back and menu, so they read as buttons. Not while dimmed.
- 2026-10-14, added: Back (#btn-prev) is dimmed on the start screen too, before the first card, and
  shakes when tapped, like the row. The doubled "Ways to play" heading stays as it is (owner is fine
  with it).
- 2026-10-14, added (owner: "option two, looks way better"): the start card's diamond and its line use
  a deeper shade of the preset colour (HSL lightness −7, never below 45%), so to the eye it matches
  the preset name. Built 8e5ab02.
