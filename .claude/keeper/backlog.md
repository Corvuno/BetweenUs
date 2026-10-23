# Backlog

_Updated 23 October 2026_

The one queue of work. The Keeper keeps it in order; the owner can move anything. Older detailed notes: backlog-notes-before-2026-10-23.md.

## Building now

### Self: questions about who you are, answered with a moment (Area A deck)
**Story:** As a player who draws a Self card, I get a question about my character that I can answer with a moment from my own life (a compliment I brushed off, a time I acted unlike myself, what I am stubborn about), not a summary of my personality, so that the table hears a story and learns something about me it did not know.
**Acceptance criteria:**
1. Five Self cards are gone from the deck, not benched. Self, 6, "When has having power over someone made you kinder, not crueler?"
   Self, 8, "A time you completely lost your footing — what held, and what did you rebuild first?"
   Self, 9, "What have you had to accept that you never chose?"
   Self, 11, "What's something true about you that took far too long to notice?"
   Self, 12, "What do you come back to after everything else falls away?"
2. The seven other Self cards are word for word as they are now, Self, 3, "When are you most lonely — and is anyone around when it happens?" and Self, 5, "Who decided they didn't like you — and did you let it go?" included.
3. Each of the five open slots holds a new card that the owner saw and approved in its exact words before it went in, and each one sits inside the Self brief's "About" (character, temper, pride, stubbornness, how you see yourself against how others see you).
4. No new Self card assumes a job, a partner or a big circle of friends (the brief's guardrail), and none asks about how your head works (Mind), how you became this person (Past), what you hide (Shadow) or right and wrong (Values).
5. The Self app line still reads "The person under all the parts you play", and the Self colour is unchanged.
6. The change log in questions/between-us-deck.md has one entry per swapped Self card with old text, new text and why.
**Touches:** questions.js, questions/between-us-deck.md
**Source:** agreements/round4-briefs.md "Self" and "Stay/go" (agreed 2026-10-23); same method as rounds 1 to 3
**Status note:** Brief and stay/go agreed. The five new cards are not written yet. Writer test (two writers, owner picks blind) applies.

### Mind: questions about how your head actually works (Area A deck)
**Story:** As a player who draws a Mind card, I get a question about something my head really does (the song stuck in it, where my best ideas turn up, what it takes to change my mind), so that I answer with a quirk I never said out loud, and the table finds out how I think without anyone being asked about their mental health.
**Acceptance criteria:**
1. Three Mind cards are gone from the deck, not benched. Mind, 4, "Which of your memories do you suspect you've quietly rewritten over the years?"
   Mind, 8, "What's the last thing that annoyed you that you'd be a little embarrassed to admit annoyed you?"
   Mind, 10, "What do you keep understanding differently each time you think you've worked it out?"
2. The nine other Mind cards are word for word as they are now, Mind, 2, "What do you consistently resist — and when does that break down?" included.
3. Each of the three open slots holds a new card that the owner saw and approved in its exact words before it went in, and each one sits inside the Mind brief's "About" (thinking, remembering, noticing, deciding, learning, worrying, daydreaming).
4. No new Mind card mentions mental illness, therapy or medication (the brief's guardrail), and none is about what you do to relax (Unwind), feelings right now (Raw), superstition (Spirit) or putting things off (Life).
5. In the app, the Mind line under the category name reads "How your head actually works" (it now reads "Your mind's habits, good and strange"). Mind's colour and position in the chapters are unchanged.
6. The change log has one entry per swapped Mind card with old text, new text and why.
**Touches:** questions.js, config.js, questions/between-us-deck.md
**Source:** agreements/round4-briefs.md "Mind" and "Stay/go" (agreed 2026-10-23)
**Status note:** Brief, app line and stay/go agreed. The three new cards and the config.js line change are not done yet. Writer test applies.

### Values: questions that test a principle in an everyday situation (Area A deck)
**Story:** As a player who draws a Values card, I get a question about a choice I made or would make in an ordinary situation (the wrong change in a shop, a white lie, a promise), or an open dilemma we can take a side on, so that the table sees what I hold to be right without the evening turning into a political fight.
**Acceptance criteria:**
1. Two Values cards are gone from the deck, not benched. Values, 2, "Which of your values survives worst under pressure?"
   Values, 8, "What can having money make disappear that not having it can't?"
2. The ten other Values cards are word for word as they are now, Values, 6, "What's something you pretend to have a strong opinion on, but don't care about at all?" included.
3. Each of the two open slots holds a new card that the owner saw and approved in its exact words before it went in, and each one sits inside the Values brief's "About" (right and wrong, where you got it, how it holds up in everyday situations).
4. No new Values card is about party politics or a hot-button issue, and none is about money as a story from your past (Past), belief and meaning (Spirit) or separating art from the artist (Culture).
5. The Values line under the category name still reads "Your principles, tested", and the money overlap with Roots and Past is gone from the deck because Values 8 is gone.
6. The change log has one entry per swapped Values card with old text, new text and why.
**Touches:** questions.js, questions/between-us-deck.md
**Source:** agreements/round4-briefs.md "Values" and "Stay/go" (agreed 2026-10-23)
**Status note:** Brief and stay/go agreed. The two new cards are not written yet. Writer test applies.

## Next

_Nothing queued. The old-code clean-up moved to Parked (owner, 2026-10-23)._

## Waiting on the owner

### Decision: which four looks spots count as settled (Area C app)
**Decision:** Vision lists four looks spots to settle before release: the bottom of the screen, the end of a hand (Intermezzo), the evening chooser (now The Deck) and the desktop layout. All four are built and on main. Do you count them as settled, so we can move on to the website?
**Acceptance criteria:**
1. Option: All four are settled — means the looks work for release is closed, and the Keeper moves to the old-versions and website questions.
2. Option: Some are not settled — means you name which ones, and each becomes its own item in Next with what is still wrong.
3. Option: Wait until you have used them on your own phone and PC — means this stays here and nothing else about release moves.
**Touches:** none yet
**Source:** vision.md "Where it's going"; commit list since 2026-10-12
**Status note:** Waiting on the owner's answer.

### Decision: how the old versions are reachable (Area C app)
**Decision:** The first version (between-us-first.html) and the classic edition (between-us-classic.html) have their own Play links next to the real game. When the site goes public, how should a visitor who finds them be sure it is an older version, and where may they live?
**Acceptance criteria:**
1. Option: Stay linked, each with a clear "older version" notice at the top — means a visitor who opens either page sees at once that it is not the current game.
2. Option: Reachable only from one place such as a "Where it came from" page — means no loose links beside the game, and the story of the game stays shown.
3. Option: Not linked publicly, kept only in the repository — means visitors never meet them, and the classic edition no longer illustrates how the game used to be (vision currently says it stays reachable).
**Touches:** between-us-first.html, between-us-classic.html, index.html, README.md
**Source:** backlog-notes-before-2026-10-23.md "Old versions on public links" (2026-10-13); vision.md "Where it's going"
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

### Decision: which categories get reworked after round 4 (Area A deck)
**Decision:** Not yet reworked: Quick, Warm, Unwind, Past, Deep, Raw, Shadow, Grief, Between Us, Us: Friends and Us: Love. Which ones come next, and in what order?
**Acceptance criteria:**
1. Option: You name the next group — means it gets the same method as rounds 1 to 4: app line and brief first, then stay/go, then new cards.
2. Option: Unwind goes first — means its old narrow app line is replaced in that round.
3. Option: No more rounds for now — means the deck stays as it is after round 4 and the vision line "every category is wide enough" is reviewed.
**Touches:** questions.js, config.js, questions/between-us-deck.md
**Source:** project.md "standard method"; rounds 1 to 4
**Status note:** Waiting on the owner's order. Once named, each category becomes a Building-now story of its own.

### Decision: the 5 / 10 / 20 / All picker (Area B looks)
**Decision:** On the card-count row of the sheet, do you want the counter lettering (Poiret One, as under the card) on the numbers, and which of the four mockup versions?
**Acceptance criteria:**
1. Option: Current — means the picker stays as it is today.
2. Option: Numbers only in the counter lettering — means 5, 10 and 20 change and All stays as it is.
3. Option: Numbers plus All in the counter lettering — means all four read in that lettering.
4. Option: One counter-style control — means the four choices become a single control styled like the counter under the card.
**Touches:** styles.css, ui.js
**Source:** agreements/2026-10-16-small-type-and-cards-numbers.md ("Still open"); mockup round 1
**Status note:** Waiting since 2026-10-16. The Deck was reworked after the mockup, so the Keeper re-checks that it is current before showing it again.

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
**Source:** backlog-notes-before-2026-10-23.md "Wildcard" (2026-10-21)
**Status note:** The owner called it an idea, not to build yet. Replaces the removed custom cards.

### Two cards in different categories asking the same thing (Area A deck)
**Story:** As a player drawing through a hand, I never meet two cards from different categories that ask the same thing, so that the table does not answer the same question twice.
**Acceptance criteria:**
1. Each of the six overlaps is re-checked against the deck as it is now, and each is marked "still there" or "gone": Unwind and Warm (never mastering something), Unwind and Body (dancing for joy), Flesh and Carnal (a surprising sexual experience), the six unvoiced-want cards in Carnal, Kink and Us: Intimate, Connect and Romance (the first move), and money across Roots, Past and Values.
2. Each overlap that is still there goes to the owner as one issue card with three alternatives, the current cards quoted in full.
3. No card text in questions.js changes until the owner picks the words for that slot.
**Touches:** questions.js, questions/between-us-deck.md
**Source:** backlog-notes-before-2026-10-23.md "Category scope check" (2026-10-13)
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
**Status note:** Runs on a Friday from 10:00 (Amsterdam) only when more than 15% of the week's usage is left; otherwise it waits. Harms no one meanwhile (owner, 2026-10-23).

### Tidy the wide-screen code (Area C app)
**Task:** Name the repeated values in the wide-screen code once and make "click/tap to change", "Menu" and "Back" readable by screen readers, with the screen looking identical, ready for the next looks job.
**Acceptance criteria:**
1. The three words are available to screen readers as labels (checked with the browser's accessibility view).
2. The card ratio and the Spotlight margin each appear once in the wide-screen code.
3. Screenshots of the PC screen before and after are identical.
**Touches:** styles.css, ui.js, card.js
**Source:** backlog-notes-before-2026-10-23.md "PC layout code tidy-up" (reviewer, 2026-10-20)
**Status note:** Not bugs. Done together with the next looks job that touches the wide-screen block.

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
