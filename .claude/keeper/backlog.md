# Backlog

_Updated 31 October 2026_

The one queue of work. The Keeper keeps it in order; the owner can move anything.

## Building now

_Nothing is being built right now._

## Next

### Three Spotlight tilt checks fail on main (Area C app)
**Task:** Three automatic checks fail on every run on main (30 October): "Spotlight tilt: on its side turns the content…", "Spotlight tilt: closing within the hold time…" and "Spotlight on a phone that turns its own screen…". Find out whether the test or the app is wrong, and fix it without loosening what the checks ask.
**Source:** found 2026-10-30 while landing the phone centring fix; they fail on main without that fix too.
**Status note:** Not started; the owner hasn't decided yet.

### Round 8: the Us categories and new Us: Colleagues (Area A deck, Area C app)
**Story:** The three Us categories get the standard method, and a new category, Us: Colleagues (line "About working together, directly", band 4, on in the Coworkers preset), gets twelve cards.
**Status note:** Part 1 built 2026-10-31 (e677e18): three cards, Between Us line, Us: Love band 5. Part 2: Us: Colleagues 5 and 7 still to pick, then its colour (shown first) and the build.
**Source:** owner 2026-10-29

### Global check of how cards ask (Area A deck)
**Story:** After the rounds, every category is checked against house style 13 (varied card forms; no category ends with fewer non-question cards) and the depth rule (each card within one step of its band). Also: the "us" cards (Culture 7, Home 10, Roots 8, Carnal 2) and whether house style rule 12 ("no me") stays.
**Source:** owner 2026-10-27 to 10-29

## Waiting on the owner

### Decision: which four looks spots count as settled (Area C app)
**Decision:** Vision lists four looks spots to settle before release: the bottom of the screen, the end of a hand (Intermezzo), the evening chooser (now The Deck) and the desktop layout. All four are built and on main. Do you count them as settled, so we can move on to the website?
**Acceptance criteria:**
1. Option: All four are settled — means the looks work for release is closed, and the Keeper moves to the old-versions and website questions.
2. Option: Some are not settled — means you name which ones, and each becomes its own item in Next with what is still wrong.
3. Option: Wait until you have used them on your own phone and PC — means this stays here and nothing else about release moves.
**Touches:** none yet
**Source:** vision.md "Where it's going"; commit list since 2026-10-12
**Status note:** Waiting on the owner's answer. Partly answered 2026-10-29: The Deck on PC is not settled (owner: it "looks like it came straight out of a phone"); a PC layout for it is being talked through.

### Decision: how the old versions are reachable (Area C app)
**Decision:** The first version (between-us-first.html) and the classic edition (between-us-classic.html) have their own Play links next to the real game. When the site goes public, how should a visitor who finds them be sure it is an older version, and where may they live?
**Acceptance criteria:**
1. Option: Stay linked, each with a clear "older version" notice at the top — means a visitor who opens either page sees at once that it is not the current game.
2. Option: Reachable only from one place such as a "Where it came from" page — means no loose links beside the game, and the story of the game stays shown.
3. Option: Not linked publicly, kept only in the repository — means visitors never meet them, and the classic edition no longer illustrates how the game used to be (vision currently says it stays reachable).
**Touches:** between-us-first.html, between-us-classic.html, index.html, README.md
**Source:** backlog note "Old versions on public links" (2026-10-13); vision.md "Where it's going"
**Status note:** Options are the Keeper's reading of the 2026-10-13 note, not yet shown to the owner. Needs a call before the site goes public.

### Decision: what the work version should become (Area C app)
**Decision:** between-us-work.html is meant for colleagues and team sessions, and vision says it is reworked. What is wrong with it today, what should it do differently, and does this happen before or after release?
**Acceptance criteria:**
1. Option: Rework before release — means it joins the release list and gets its own agreement first.
2. Option: Rework after release — means it stays as it is now (English only, Dutch already removed) for the first public version.
3. Option: Your own answer on what is wrong today — means the Keeper turns it into a story from a host at a work session.
**Touches:** between-us-work.html, config.js
**Source:** vision.md "App: the work version is reworked"
**Status note:** No agreement exists. Only the Dutch removal is done.

### Decision: the website (Area C app)
**Decision:** Vision says Between Us gets its own free English website, shared where people look for good things. What is its name or address, who sets it up, and what does a visitor see first?
**Acceptance criteria:**
1. Option: Name or address — means you give it, or ask the Keeper for choices to look at.
2. Option: Who sets it up — means you say whether the Keeper builds it or you do it elsewhere, and the touches list is fixed after that.
3. Option: What a visitor sees first — means you say whether it is the game itself (vision: "you open it and draw") or a landing page before it.
**Touches:** index.html, README.md, manifest.webmanifest
**Source:** vision.md "Where it's going"
**Status note:** Nothing is agreed beyond "its own website, free, English". Options are the open parts, not Keeper proposals.

### Decision: small text that sits between two lettering rules (Area B looks)
**Decision:** The rule is: sentence-case lines in Federo, caps names in Jost. Some small texts fit neither clearly. For each, which lettering should it have?
**Acceptance criteria:**
1. Option: Three, in Federo caps — means you pick Federo or Jost caps.
2. Option: INTERMEZZO — means you pick the same way.
3. Option: Hint lines — means you pick the same way.
4. Option: "Start to finish" — means you pick the same way.
5. Option: Any further items from the sweep — means the Keeper shows them in the same list, each on its own line.
**Touches:** styles.css
**Source:** agreements/2026-10-16-small-type-and-cards-numbers.md
**Status note:** The list was promised and not found shown. Unsure whether it was ever sent, so the Keeper sends it again; nothing changes until each is decided.

### Decision: pause colour, last card or chapter (Area C app)
**Decision:** At the end of a hand, should the pause (Intermezzo) take the colour of the last card drawn or of the chapter? The test switch "Pause colour" is still in the menu, set to "Last card".
**Acceptance criteria:**
1. Option: Last card — means the pause always has the colour of the card just before it, and the "Pause colour" row disappears from the menu.
2. Option: Chapter — means the pause always has the chapter colour, and the "Pause colour" row disappears from the menu.
3. Option: Keep testing — means the switch stays in the menu, and the question comes back here.
**Touches:** between-us.html, presentation.js, styles.css
**Source:** agreements/2026-10-19-pause-colour.md
**Status note:** The switch is on main and the owner has not decided. Once decided, the switch comes out and the pause uses the pick.

### Decision: are the Be Free wall posters final (side job)
**Decision:** The print files v2 for the Be Free rave wall exist. Are the symbol and layout final?
**Acceptance criteria:**
1. Option: Final — means the files (portrait and landscape, with and without name, A4 with 3 mm bleed) are the print set and this item is closed.
2. Option: Change the symbol — means a new round of mockups at its own link, and the old round stays as it is.
3. Option: Change the layout — means the same, for the layout.
**Touches:** Keeper files only (no app files)
**Source:** commits 32dc60f, 4dfe7e2, ac1b8e1; writer-test-sidequest-2026-10-22.md
**Status note:** Unsure whether the owner already signed off v2. The Keeper asks once.

### Spotlight turns once on a real phone (Area C app)
**Story:** As a player holding my phone sideways in Spotlight, the screen turns once and the right way round, so that I can read the card without turning my head or fighting the screen.
**Acceptance criteria:**
1. On an Android phone with rotation lock off, tapping Sideways and then turning the phone turns the Spotlight screen once, not twice.
2. With rotation lock on, tapping the word Sideways turns the card a quarter turn so it reads with the phone on its side; the word then reads Upright, and a second tap turns it back.
3. On an iPhone, the word Sideways is on the right edge, no permission popup appears, and the turn direction reads correctly (top of the card to the left).
4. Leaving Spotlight always returns to upright.
**Touches:** presentation.js, card.js
**Source:** agreements/2026-10-20-spotlight-turns-sideways.md (double-turn fix 2026-10-21)
**Status note:** Built and tested in simulation only. Needs the owner's Android phone and an iPhone to confirm.

## Parked

### Wildcard: a card that tells you to ask your own question (Area A deck)
**Story:** As a player who has a question of my own for the person across the table, I draw a wildcard in the deck that tells me to ask it, so that I get the custom-question moment inside the game without a menu to find.
**Acceptance criteria:**
1. The deck contains a wildcard card that tells the player to ask a question of their own.
2. The Custom-card feature stays gone from the menu; the Favourites row stays as it is.
3. Where the wildcard sits (which category or none), how many there are, and its exact wording are decided with the owner before anything is written.
**Touches:** questions.js, card.js
**Source:** owner, 2026-10-21, when the custom cards were removed
**Status note:** The owner called it an idea, not to build yet. Replaces the removed custom cards.

### Two cards in different categories asking the same thing (Area A deck)
**Story:** As a player drawing through a hand, I never meet two cards from different categories that ask the same thing, so that the table does not answer the same question twice.
**Acceptance criteria:**
1. Each of the six overlaps is re-checked against the deck as it is now, and each is marked "still there" or "gone": Unwind and Warm (never mastering something), Unwind and Body (dancing for joy), Flesh and Carnal (a surprising sexual experience), the six unvoiced-want cards in Carnal, Kink and Us: Intimate, Connect and Romance (the first move), and money across Roots, Past and Values.
2. Each overlap that is still there goes to the owner as one issue card with three alternatives, the current cards quoted in full.
3. No card text in questions.js changes until the owner picks the words for that slot.
**Touches:** questions.js, questions/between-us-deck.md
**Source:** whole-deck scope check, 2026-10-13 (the card texts as they were then are in git history, file backlog-notes-before-2026-10-23.md)
**Status note:** Rounds 1 to 3 may have fixed some, and round 4 removes Values 8 (money). Not re-checked, so unsure.

### Finish the old-code clean-up (Area C app)
**Task:** Fix the old code's remaining check findings file by file, so that new work starts from a clean base and nothing hidden breaks the app.
**Acceptance criteria:**
1. The files go smallest first. Findings that touch behaviour (unused code, swallowed errors, over-complex parts) go first.
2. The pure type noise comes last, as its own round after all files.
3. After every file, the app looks and behaves the same for players: the tester tries a few sets by hand and the reviewer reads the change once.
4. The list of known findings in checks-baseline.json gets shorter by exactly what was fixed, and nothing new appears.
5. If a fix would need a new message or choice for the player, it goes back to the owner as a question and is not done.
**Touches:** card.js, presentation.js, ui.js, deck.js, other .js files, checks-baseline.json
**Source:** agreements/2026-10-19-old-code-cleanup.md, 2026-10-19-code-checks.md; 2026-10-20 note on two open findings in the screen-turning code
**Status note:** Runs on its own every Friday at 09:42 (Amsterdam), with a fixer of some technical depth, to use the week's leftover usage; a phone notification says what it did (owner, 2026-10-23). Harms no one meanwhile.
**Progress (2026-10-30):** done: library.js, state.js, card.js (behaviour findings). Built and reviewed clean, waiting on the tester: gilt.js, selection.js, deck.js, on branch keeper/cleanup-deck-gilt-selection (stopped at 11:00 by the owner). Left: session.js, ui.js, presentation.js, then the type noise.

### Tidy the wide-screen code (Area C app)
**Task:** Name the repeated values in the wide-screen code once and make "click/tap to change", "Menu" and "Back" readable by screen readers, with the screen looking identical, ready for the next looks job.
**Acceptance criteria:**
1. The three words are available to screen readers as labels (checked with the browser's accessibility view).
2. The card ratio and the Spotlight margin each appear once in the wide-screen code.
3. Screenshots of the PC screen before and after are identical.
**Touches:** styles.css, ui.js, card.js
**Source:** reviewer, 2026-10-20 (PC layout review)
**Status note:** Not bugs. Done together with the next looks job that touches the wide-screen block. The reviewer's smaller points go along: repeated calc(var(--k)*Npx) values could use helper variables; setWideScale's numbers need names and could sit with the other resize code; a comment near the old desktop .c-accent rules pointing to the WIDE SCREENS block.

### Check the old desktop-fits-window branch (Area B looks)
**Task:** Look at the current PC screen at common window heights and decide whether the old branch is replaced, so that nothing gets built twice.
**Acceptance criteria:**
1. The PC screen is checked at three common heights, and for each it is noted whether the page height equals the window height.
2. If it fits at all three, the old tag archive/claude/determined-darwin-v7am8r is left as an archive and this item is closed.
3. If it does not fit, the gap above the title is shown in screenshots to the owner, who picks it.
**Touches:** styles.css, between-us.html
**Source:** old branch, tag archive/claude/determined-darwin-v7am8r (2026-10-13), agreement 2026-10-13-desktop-fits-window.md
**Status note:** Probably replaced by the PC layout (round 12) and commit 40039a0. Unsure, needs the look.

### Decision: logo mark ideas (Area B looks)
**Decision:** Eight rounds of logo mark ideas are saved. Do you want to look at them again, or keep them put away?
**Acceptance criteria:**
1. Option: Keep put away — means the logo stays as it is and this stays parked.
2. Option: Show them again — means the Keeper puts the saved preview page back in front of you, and nothing in the app changes until you pick.
**Touches:** none
**Source:** old branch, tag archive/claude/funny-cerf-xj3rr2 (2026-10-08 to 2026-10-09, preview page only)
**Status note:** Exploration only. The logo is never touched unasked.

### Decision: when does the app start fresh? (Area C app)
**Decision:** Seen (and skipped) cards count across presets, category changes, reloads and days; a fresh pass only starts when every card in the selection is seen, or when the history is cleared by hand. On a phone with hundreds of hands that can leave a lopsided unseen pool (2026-10-24: five Quick, four Warm, one Grief with Everything + Arc). What should reset the seen memory, and what does the player see of it?
**Acceptance criteria:**
1. Option: Leave it as it is — means seen cards keep counting until the selection is used up or cleared.
2. Option: A reset on a moment you name (a preset change, a new day, a category running out) — means the Keeper turns it into a story with what the player sees.
**Touches:** deck.js, presentation.js
**Source:** owner, 2026-10-24: "we'd have to look into what makes a clean slate and restarts… for now I understand what happens." (deck.js `_startFreshPassIfSpent`, presentation.js `btnClearLog`)
**Status note:** Parked by the owner until it comes back.

### Decision: a printed deck and an offshoot (Area A deck)
**Decision:** Vision keeps a printed deck (which could also bring in money) and an offshoot open. Do you want to start talking about either?
**Acceptance criteria:**
1. Option: Not now — means both stay parked.
2. Option: Printed deck — means a talk about what is printed, and the Keeper opens a story from there.
3. Option: Offshoot — means a talk first about what it is, because it has no shape yet.
**Touches:** none yet
**Source:** vision.md "Later doors"
**Status note:** Kept open.

## Done (last 14 days)

### Fix: "Who's here" on its own line in the PC Deck panel (B), 2026-10-31
**Story:** The Who's here caption no longer sits between the presets on a computer. **Source:** owner 2026-10-31, 8ca0bbb

### Phone screen no longer jumps at the end of a hand (B), 2026-10-31
**Story:** With the phone layout centred, the screen moved when a button row changed height: Change/Save coming in at the end of a hand with Save's hint still showing, or a hint going away after first use. Hints that have gone away now keep their space, so the screen stays put; a new automatic check guards it. **Source:** owner, 2026-10-31 ("if Save has its tooltip still active and Spotlight/Three/Twist don't, it will move"); commit 2672d33

### App centred top-to-bottom on tall phones (B), 2026-10-30
**Story:** On a tall phone, and above all in the installed app (no address bar), everything hung at the top with an empty band under the buttons. It is now centred, like tablets and computers already were; short phones and landscape are unchanged. **Source:** owner, 2026-10-30 (screenshot, chose "centre" over "pin the buttons to the bottom"); commit ca74f21

### Arc is the base (C), 2026-10-30
**Story:** In Arc the shape always wins; every other rule works inside it. No-repeat swaps only within the same depth; the After Dark opener swap only when the shape holds (else the card stays); Three offers cards at the planned depth before anything else, unseen before seen within it. Dials and the After Dark mix only choose cards, never the shape. **Source:** owner, 2026-10-30, this thread; commit on main

### No new check findings can land on main (C, Keeper), 2026-10-30
**Story:** The Arc build had turned main's checks red with 3 new type findings; fixed. A push lock now refuses any push to main with a new finding, switched on in every session, and the rule is in the Keeper's landing step and every builder's instructions. **Source:** owner, 2026-10-30 ("builders don't introduce new issues again"); commits 6b26e05, 2d0496e, b687cb1

### Categories and chapters in their own file (A, C), 2026-10-30
**Story:** The categories, their attributes and the chapters moved from config.js to categories.js, next to questions.js; config.js keeps the app's settings. Nothing a player sees changed. **Source:** owner, 2026-10-30; agreements/2026-10-30-categories-file.md; commit 6810260

### Spotlight test no longer fails at random (C), 2026-10-30
**Story:** The check read the screen one frame before the browser's turn arrived; it now waits for it. Test-only: no player ever saw a wrong frame (checked over 160 runs). Failed about 1 in 14 runs before, 0 in 100 after. **Source:** owner, 2026-10-30; commit 5aeecf7

### Old-code clean-up: state.js and card.js, custom cards removed (C), 2026-10-29
**Story:** Swallowed storage errors in hints and favourites now logged; one tangled card function split; the custom card option and its drawer removed (no one used it). **Source:** owner, 2026-10-21 and 2026-10-29; commits 4ac2cd3, 628c48e, c320ccf, 48c67ef

### Arc follows the number of cards (C), 2026-10-30
**Story:** In Arc a hand of 10 or 20 is one arc, not arcs of five: warm-up 3, deep 5, wind-down 2 for 10; warm-up 4, deep 13, wind-down 3 for 20. Deep means the deepest categories switched on. No category twice in a row unless the selection leaves no way around it. All is Wild-only; arriving in Arc with All lands on 20. Classic and first untouched (legacy). **Source:** owner, 2026-10-30, this thread; commit on main

### Round 7: Arrive — Quick, Warm and Unwind 5 (A), 2026-10-30
**Story:** 4 cards; Quick and Warm briefs; Warm 7 and Unwind 5 merged into one Unwind card. **Source:** round 7 commit on main

### The Deck made for a PC (B, C), 2026-10-29
**Story:** On a computer The Deck opens as a panel beside the card, presets on top and Draw at the foot, chapters still unfolding; phones and tablets unchanged. **Source:** round 1 https://claude.ai/artifact/1HmzTTizJ2isar3oaWy4m7 (Rethink picked), 94561b4

### Round 6: After Dark and Romance 9 (A), 2026-10-29
**Story:** 13 cards in Carnal, Bare, Flesh and Romance; Carnal, Bare and Flesh briefs updated; bench +3 −2. **Source:** round 6 commit on main

### Every session is the Keeper; review before test; a slim edition for small fixes (Keeper), 2026-10-29
**Task:** Every session starts as the Keeper; a small fix reads only the background it needs; the reviewer checks the code before the tester plays it; small fixes get a slim review and test, new features the full one. **Source:** owner, upkeep thread

### Decision: the 5 / 10 / 20 / All picker stays as it is (B), 2026-10-29
**Decided:** Owner, 2026-10-29: the picker as it is today is accepted; no counter lettering. Closes the open point from agreements/2026-10-16-small-type-and-cards-numbers.md.

### Flesh shows under Everything again (A, C), 2026-10-29
**Story:** Flesh was the one category Everything hid; it now sits with the other After Dark categories, off until chosen. **Source:** 7b06925

### End of a hand: the card closes into Intermezzo (B), 2026-10-28
**Story:** After the last card's message the card closes itself into the pause, with a held empty beat, instead of turning. **Source:** agreements/2026-10-15-end-of-hand-intermezzo.md (2026-10-28 section), cfcea26

### Slower, calmer motion (B), 2026-10-27
**Story:** The first draw, the card turn and the menus take their time again; changing card is easier to see. **Source:** agreements/2026-10-21-animation-and-scan-fixes.md ("Tempo"), 1710b9e

### Decision: no depth score per card (A, C), 2026-10-26
**Story:** No per-card score; every card sits within one step of its category's band instead (project.md). **Source:** 4a658a0

### Round 5: Into the Deep (A), 2026-10-27
**Story:** 17 new cards in Past, Deep, Raw, Shadow, Grief, plus Self 8 and Body 6; four new app lines; five briefs; house style 13 (vary how a card asks); depth rule (cards within one step of the band). **Source:** 4222824

### Bug: After Dark no longer turns a preset into Custom (C), 2026-10-26
**Story:** Adding or removing After Dark categories a preset offers keeps the preset; Us: Intimate in Balanced and Everything still turns it Custom. Tested and reviewed clean. **Source:** 9404fce

### Round 4: Self, Mind and Values (A), 2026-10-24
**Story:** Ten new cards, Mind line "How your head actually works", three briefs; bench cleaned from 89 to 19. **Source:** ddb328b, 3dee66c

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
**Story:** Twenty-one new cards and six new app lines. **Source:** commit 60f7c5e, agreements/2026-10-14-category-scopes.md

### Category scopes rework, round 3: Connect, Friendship, Romance, Family (A), 2026-10-23
**Story:** Fifteen new cards, new app lines and briefs. **Source:** commit 7d0f19e, agreements/2026-10-14-category-scopes.md

### Release 1.7.0 (C), 2026-10-23
**Story:** The automatic release published and reset the notes. **Source:** 03f8d29
