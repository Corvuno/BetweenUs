# Backlog

_Updated 23 October 2026_

The one queue of work. The Keeper keeps it in order; the owner can move anything. Older detailed notes: backlog-notes-before-2026-10-23.md.

## Building now

### Category rework, round 4: Self, Mind, Values (Area A deck)
**Story:** As a player, I want Self, Mind and Values to be wide categories made of real stories and positions, so that every card earns its slot.
**Acceptance criteria:**
1. The ten cards agreed to go are gone, not benched: Self 6, 8, 9, 11, 12; Mind 4, 8, 10; Values 2, 8.
2. Every other card in the three categories stays as it is (Self 3 and 5, Mind 2, Values 6 included).
3. Each of the ten open slots gets a new card that the owner has seen and approved in its exact words, before it goes in.
4. The new cards fit the agreed briefs: Mind stays curious, never diagnosis, therapy or medication; Values has no party politics or hot-button fights.
5. Mind shows the new app line "How your head actually works"; Self and Values keep theirs.
6. The change log records old text, new text and why for every swapped card.
**Touches:** questions.js, config.js, questions/between-us-deck.md
**Source:** agreements/round4-briefs.md (briefs 2026-10-23, stay/go 2026-10-23); same method as rounds 1 to 3
**Status note:** Briefs and stay/go are agreed. The ten new cards are not written yet. Writer test (two writers, owner picks blind) applies.

## Next

### Finish the old-code clean-up (Area C app)
**Story:** As the owner, I want the old code's check findings gone, so that new work starts from a clean base and nothing hidden breaks the app.
**Acceptance criteria:**
1. The clean-up goes file by file, smallest first. Real findings that touch behaviour (unused code, swallowed errors, over-complex parts) go first.
2. The pure type noise comes last, as its own round after all files.
3. The app looks and behaves the same for players after every file.
4. The list of known findings gets shorter by exactly what was fixed, and nothing new appears.
5. The tester tries a few sets by hand and the reviewer reads the change once per file.
6. If a fix would need a new message or choice for the player, it goes back to the owner as a question.
**Touches:** card.js, presentation.js, ui.js, deck.js, other .js files, checks-baseline.json
**Source:** agreements/2026-10-19-old-code-cleanup.md, 2026-10-19-code-checks.md; 2026-10-20 note on two open findings in the screen-turning code
**Status note:** The first file (library.js) is done and custom cards are removed. The baseline still lists findings in card.js and more. Order of the rest not set.

## Waiting on the owner

### Ready to release: what is still open (Area C app)
**Story:** As the owner, I want a clear list of what stands between now and the public website, so that release has no surprises.
**Acceptance criteria:**
1. Vision names four looks spots to settle: the bottom of the screen, the end of a hand, the evening chooser (now The Deck) and the desktop layout. All four are built and on main.
2. The owner says whether those four count as settled.
3. The other open items below (old versions on links, work version, website) are decided or parked.
**Touches:** none yet
**Source:** vision.md "Where it's going"; commit list since 2026-10-12
**Status note:** Open question for the owner: do you consider the four looks spots settled, so we can move to the website question?

### Old versions on public links (Area C app)
**Story:** As a first-time visitor, I want to land on the real game and not mistake an old, unfinished version for it, so that the first look is the good one.
**Acceptance criteria:**
1. A visitor who finds the link to the first version or the classic edition understands it is an older version.
2. No new old versions pile up as loose pages next to the game.
3. The owner can still show where the game came from.
**Touches:** between-us-first.html, between-us-classic.html, index.html, README.md
**Source:** backlog-notes-before-2026-10-23.md "Old versions on public links" (2026-10-13)
**Status note:** The owner has not decided how these are reachable. Needs a call before the site goes public.

### Work version rework (Area C app)
**Story:** As a host at work, I want a version of the game that fits colleagues and team sessions, so that I can use it with a team.
**Acceptance criteria:**
1. To be set by the owner. No agreement exists.
**Touches:** between-us-work.html, config.js
**Source:** vision.md "App: the work version is reworked"
**Status note:** Open questions for the owner: what is wrong with the work version today, what should it do differently, and is this before or after release? The only part done is that its Dutch is gone.

### Own website (Area C app)
**Story:** As the owner, I want Between Us on its own free English website, so that I can share it where people look for good things.
**Acceptance criteria:**
1. To be set by the owner. Nothing is agreed beyond "its own website, free, English".
**Touches:** index.html, README.md, manifest.webmanifest
**Source:** vision.md "Where it's going"
**Status note:** Open questions for the owner: the name or address, who sets it up, and what a visitor sees first.

### Which categories next after round 4 (Area A deck)
**Story:** As a player, I want every category to stay wide and fun, so that no category runs dry.
**Acceptance criteria:**
1. The owner names the next categories to rework.
2. Each follows the same method: definition and app line first, then keep or go, then new cards.
**Touches:** questions.js, config.js, questions/between-us-deck.md
**Source:** project.md "standard method"; rounds 1 to 4 done
**Status note:** Not reworked yet: Quick, Warm, Unwind, Past, Deep, Raw, Shadow, Grief, Between Us, Us: Friends, Us: Love. Open question for the owner: which ones, and in what order? Unwind's app line is still the old narrow one.

### Cards picker numbers: 5 / 10 / 20 / All (Area B looks)
**Story:** As a player, I want the card-count choice to look like it belongs next to the counter under the card, so that the sheet feels like one design.
**Acceptance criteria:**
1. The owner wants the counter lettering (Poiret One) on these numbers, but wants to see it first.
2. Three options were shown: current, numbers only, numbers plus All, one counter-style control.
3. Nothing is built until the owner picks.
**Touches:** styles.css, ui.js
**Source:** agreements/2026-10-16-small-type-and-cards-numbers.md ("Still open")
**Status note:** Waiting on the owner's pick since 2026-10-16. The Deck was reworked after that, so the Keeper should re-check the mockup is still current.

### Small-type borderline list (Area B looks)
**Story:** As the owner, I want to see the small text that sits between two lettering rules, so that I decide each one.
**Acceptance criteria:**
1. The Keeper shows the borderline items as one list: Three in Federo caps, INTERMEZZO, hint lines, "Start to finish", and others from the sweep.
2. Nothing changes until the owner decides each.
**Touches:** styles.css
**Source:** agreements/2026-10-16-small-type-and-cards-numbers.md
**Status note:** The list was promised and not found shown. Unsure whether it was ever sent.

### Pause colour test switch (Area C app)
**Story:** As the owner, I want to decide between the pause taking the last card's colour or the chapter colour, so that the test switch can leave the menu.
**Acceptance criteria:**
1. The owner picks "Last card" or "Chapter".
2. The "Pause colour" switch is removed from the menu.
3. The pause then always uses the picked colour.
**Touches:** between-us.html, presentation.js, styles.css
**Source:** agreements/2026-10-19-pause-colour.md
**Status note:** The switch is still in the menu on main. The owner has not decided.

### Real-phone check of Spotlight turning (Area C app)
**Story:** As a player with a phone held sideways, I want Spotlight to turn once and the right way, so that it is readable.
**Acceptance criteria:**
1. On an Android phone with rotation lock off, tapping Sideways and turning the phone turns the screen once.
2. With rotation lock on, the Sideways word turns the card; a second tap turns it back.
3. On iPhone, the Sideways word still works and the turn direction is right.
**Touches:** presentation.js, card.js
**Source:** agreements/2026-10-20-spotlight-turns-sideways.md (double-turn fix 2026-10-21)
**Status note:** Built and tested in simulation only. Needs the owner's phone, and an iPhone, to confirm.

### Be Free wall posters (side job)
**Story:** As the owner, I want printable wall posters for the Be Free rave wall, so that I can print them.
**Acceptance criteria:**
1. Print files exist in portrait and landscape, with and without name, A4 and 3 mm bleed.
2. The owner confirms the symbol and layout are final.
**Touches:** Keeper files only (no app files)
**Source:** commits 32dc60f, 4dfe7e2, ac1b8e1 (2026-10-22 and 2026-10-23); writer-test-sidequest-2026-10-22.md
**Status note:** Print files v2 are made. Unsure whether the owner signed them off.

## Parked

### Ask-your-own-question wildcard (Area A deck)
**Story:** As a player, I want a wildcard card that tells me to ask a question of my own, so that the wish for custom questions shows up where it comes up.
**Acceptance criteria:**
1. Not decided. The owner called it an idea, not to build yet.
**Touches:** questions.js, card.js
**Source:** backlog-notes-before-2026-10-23.md "Wildcard" (2026-10-21)
**Status note:** Replaces the removed custom cards. Needs the owner to start it.

### Cross-category card overlaps (Area A deck)
**Story:** As a player, I want no two cards in different categories asking the same thing, so that nothing repeats.
**Acceptance criteria:**
1. Six overlaps are re-checked against the deck as it is now: Unwind and Warm (never mastering something), Unwind and Body (dancing for joy), Flesh and Carnal (a surprising sexual experience), the six unvoiced-want cards in Carnal, Kink and Us: Intimate, Connect and Romance (the first move), and money across Roots, Past and Values.
2. Any overlap still there goes to the owner as an issue card with three alternatives.
**Touches:** questions.js, questions/between-us-deck.md
**Source:** backlog-notes-before-2026-10-23.md "Category scope check" (2026-10-13)
**Status note:** Rounds 1 to 3 may have fixed some. Not re-checked, so unsure.

### PC layout code tidy-up (Area C app)
**Story:** As the owner, I want the wide-screen code tidied, so that later looks jobs go faster and screen readers get the right words.
**Acceptance criteria:**
1. The "click/tap to change", "Menu" and "Back" words are read by screen readers.
2. Repeated values in the wide-screen code are named once.
3. The screen looks identical before and after.
**Touches:** styles.css, ui.js, card.js
**Source:** backlog-notes-before-2026-10-23.md "PC layout code tidy-up" (reviewer, 2026-10-20)
**Status note:** Not bugs. Do it with the next looks job that touches the wide-screen block.

### Desktop screen fits the window: old branch (Area B looks)
**Story:** As a PC player, I want the whole screen to fit my window with a gap above the title, so that nothing scrolls.
**Acceptance criteria:**
1. At common desktop heights the page height equals the window height, with a clear gap above the title.
2. The owner picks the gap size from screenshots.
**Touches:** styles.css, between-us.html
**Source:** old branch, saved as tag archive/claude/determined-darwin-v7am8r (2026-10-13), agreement 2026-10-13-desktop-fits-window.md
**Status note:** Probably replaced by the PC layout (round 12) and commit 40039a0. Unsure. Needs a look at the current PC screen before dropping it.

### Logo mark options (Area B looks)
**Story:** As the owner, I want to keep the eight rounds of logo mark ideas, so that the logo can change someday.
**Acceptance criteria:**
1. Not decided. The logo is never touched unasked.
**Touches:** none
**Source:** old branch, saved as tag archive/claude/funny-cerf-xj3rr2 (2026-10-08 to 2026-10-09, preview page only)
**Status note:** Exploration only. Owner has not asked for it.

### Printed deck and offshoot (Area A deck)
**Story:** As the owner, I want a printed deck, which could also bring in money, so that the game exists on a table.
**Acceptance criteria:**
1. Not decided.
**Touches:** none yet
**Source:** vision.md "Later doors"
**Status note:** Kept open. The offshoot has no shape yet.

## Done (last 14 days)

### Players draw cards (C), 2026-10-12
**Story:** The app only says "draw" for taking a card. **Source:** 451a855

### Classic edition and first version on their own pages (C), 2026-10-12 to 2026-10-13
**Story:** The old versions stay playable on their own links. **Source:** 3439013, 1ef7daf

### Remove Dutch (A, C), 2026-10-13
**Story:** The game is English only; the Dutch text is kept in a notes file. **Source:** agreements/2026-10-13-remove-dutch.md, 567a412

### Bottom of the screen (B, C), 2026-10-13 and 2026-10-14
**Story:** Back, menu, Three, Spotlight and Twist read clearly, with hints, shaking when not usable and a "Show hints again" row. **Source:** agreements/2026-10-13-bottom-of-the-screen.md, bd4ac1d, ecfb5fb, 2f1dab3

### Card is the widest thing on the main screen (B), 2026-10-14
**Story:** The progress line and controls line up with the card edges. **Source:** agreements/2026-10-14-card-width-column.md, 8c86c2d

### Hand size, Arc and missing title (C), 2026-10-14
**Story:** A hand is always the size picked and the category title stays on the card. **Source:** agreements/2026-10-14-hand-size-and-title.md, 5e271d7, acc468c

### Line under the title matches the logo (B), 2026-10-14
**Story:** The line under the title takes the logo's centre. **Source:** agreements/2026-10-14-title-line-centre.md, 03e758d

### Category scopes rework, round 1 (A), 2026-10-14 to 2026-10-18
**Story:** Life, Home, World, Attract and the After Dark categories get new cards and app lines; Abyss is retired. **Source:** agreements/2026-10-14-category-scopes.md, 8fdff93, 85cbc2d, 183b9ed

### Three redesigned, as one card, with skip counted as seen (B, C), 2026-10-15
**Story:** Three works inside a hand and shows as one card split three ways. **Source:** agreements/2026-10-15-three-redesign.md, 2026-10-15-three-one-card.md, c5cc62f, 5f5b1d1

### End of hand becomes Intermezzo (B, C), 2026-10-15 to 2026-10-18
**Story:** A hand ends on a pause that flips to the hand's list; Save gives a state file; the end message and turn are readable. **Source:** agreements/2026-10-15-end-of-hand-intermezzo.md, 187aed4, 09603e0, a179aab

### Spotlight layout (B, C), 2026-10-16 to 2026-10-18
**Story:** Spotlight has stacked options on PC, Close at the bottom and a new flourish. **Source:** agreements/2026-10-15-spotlight-layout.md, d626805, e626608

### Small type follows the font rule (B), 2026-10-16
**Story:** Small descriptive lines use the label font. **Source:** agreements/2026-10-16-small-type-and-cards-numbers.md, c3407b8

### The bar under the mark breathes (B), 2026-10-18
**Story:** The bar under the card-back mark breathes with the diamond. **Source:** agreements/2026-10-18-breathing-bar.md, c6aaf86

### Spotlight follows the main screen (B, C), 2026-10-18
**Story:** Spotlight and the main screen share one look and do not drift. **Source:** agreements/2026-10-18-spotlight-follows-main.md, 7fd62f9

### Three works late in a round (C), 2026-10-18
**Story:** Three offers three options even late in a pass. **Source:** agreements/2026-10-18-three-late-in-pass.md, e6b2032

### PC and tablet layout (B, C), 2026-10-18 to 2026-10-21
**Story:** On a computer the card is big with the controls around it; card details and rails polished. **Source:** agreements/2026-10-18-pc-layout.md, dcc46da, 9575a63, e321789, 6ebb0b4

### The evening chooser, now The Deck (B, C), 2026-10-18 to 2026-10-21
**Story:** The sheet is named The Deck; chapters unfold into categories; presets limit what shows; Custom reads "Off script." **Source:** agreements/2026-10-18-evening-chooser.md, 17fa066, 4ad8e16, 48aed09, 199cd5a

### Preset colours (B), 2026-10-19
**Story:** Custom wears the colours of its categories; Strangers and Family get their own colours. **Source:** agreements/2026-10-18-preset-colours.md, 5c8fdce

### Pause takes the last card's colour, eased (B, C), 2026-10-19
**Story:** The pause takes the last card's colour and changes colour smoothly. **Source:** agreements/2026-10-19-pause-colour.md, 5b0f0c4, a0db97e (test switch still in menu, see Waiting)

### At most two cards per category in a hand (C), 2026-10-19
**Story:** A hand no longer stacks three or four cards from one category. **Source:** agreements/2026-10-19-category-spread.md, ddf1475

### Three options from different categories (C), 2026-10-19
**Story:** Three's options come from different categories, with freshness first. **Source:** agreements/2026-10-19-three-category-variety.md, 8f73dbb

### Automatic code checks (C), 2026-10-19
**Story:** Type check, lint and tests run on every push. **Source:** agreements/2026-10-19-code-checks.md, 5ef97ab

### Short release notes (C), 2026-10-19
**Story:** Release notes are a few headlines kept in RELEASE-NOTES-NEXT.md. **Source:** agreements/2026-10-19-short-release-notes.md, 7c71da4

### Spotlight turns for a phone held sideways (B, C), 2026-10-20 and 2026-10-21
**Story:** Spotlight turns with the phone, with a double-turn fix. **Source:** agreements/2026-10-20-spotlight-turns-sideways.md, 5fc4f14, 34c8042 (real-phone check in Waiting)

### Three after the intermezzo; app updates when it returns (C), 2026-10-20
**Story:** The first card of a new hand comes as three, and the app picks up a new version on return. **Source:** agreements/2026-10-20-three-after-intermezzo.md, 8b0ef75, 224d1f4

### Animation and design-scan fixes (B), 2026-10-21
**Story:** Draws, menus, buttons and the pause move more smoothly; helper text is easier to read. **Source:** agreements/2026-10-21-animation-and-scan-fixes.md, e2e355c, f556923

### Card swap B+C (B, C), 2026-10-21
**Story:** Next and Back swap the card in one smooth beat. **Source:** agreements/2026-10-21-animation-and-scan-fixes.md, 704a353

### Custom cards removed (C), 2026-10-21
**Story:** The Custom card feature is gone; favourites stay. **Source:** agreements/2026-10-19-old-code-cleanup.md, 27bf352

### Category scopes rework, round 2: Culture, Wish, Roots, Work, Spirit, Body (A), 2026-10-20
**Story:** Twenty-one new cards and six new app lines. **Source:** commit 60f7c5e, round2-briefs.md

### Category scopes rework, round 3: Connect, Friendship, Romance, Family (A), 2026-10-23
**Story:** Fifteen new cards, new app lines and briefs. **Source:** commit 7d0f19e, round3-briefs.md

### Release 1.7.0 (C), 2026-10-23
**Story:** The automatic release published and reset the notes. **Source:** 03f8d29
