# Backlog (history, no longer updated)

**Moved 2026-10-31: the backlog is now GitHub Issues, https://github.com/Corvuno/BetweenUs/issues**
(owner: "a real system, not a file that needs updating"). How it works: `project.md`, "The backlog".

Every open item below the line moved to its own issue on 2026-10-31, word for word:

- Next: #65 Three Spotlight tilt checks fail on main; #66 Round 8: the Us categories and new Us: Colleagues; #67 Global check of how cards ask
- Waiting on owner: #68 Which four looks spots count as settled; #69 How the old versions are reachable; #70 What the work version should become; #71 The website; #72 Small text between two lettering rules; #73 Pause colour; #74 Be Free wall posters; #75 Spotlight turns once on a real phone
- Parked: #76 Wildcard; #77 Two cards asking the same thing; #78 Finish the old-code clean-up; #79 Tidy the wide-screen code; #80 Old desktop-fits-window branch; #81 Logo mark ideas; #82 When does the app start fresh; #83 A printed deck and an offshoot
- Done before the move: #64 The Deck made for a PC

The Done list below is the record up to 2026-10-31. The open items' full text as it was is in
this file's git history.

_Updated 31 October 2026, the last update: the backlog moved to GitHub Issues_

## Waiting on the owner

### The backlog moved to GitHub Issues
**Task:** Since 31 October the backlog lives at https://github.com/Corvuno/BetweenUs/issues, where you can add, change and close items yourself. This page is no longer updated.

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
