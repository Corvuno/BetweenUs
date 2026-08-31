# Working conventions

- The owner does not want to interact with code, ever. Don't hand them a
  diff to review, ask them to run a command, or leave work sitting on a
  branch waiting for them to merge it. Build the thing, verify it actually
  works (run it, screenshot it, whatever the change calls for), and land it
  on `main` yourself. "Fix it" means finish the job end-to-end, not produce
  something for the owner to go finish.
- Push finished work straight to `main`. Don't open a pull request unless
  explicitly asked to — the user doesn't want to be asked "should I open a
  PR?" each time.
- This applies even when the session itself was launched with instructions to
  develop on a named feature branch and never push elsewhere (this happens —
  some invocations of Claude Code on the web are pre-configured that way).
  Those instructions cover where to commit *while working*; they are not
  permission to leave the result stranded on a branch or an open PR waiting
  on the owner. Finish on that branch, then merge/fast-forward it into
  `main` and push `main` yourself, the same session, without being asked
  again — that's what "land it on `main` yourself" above means in practice.
- Once a change is actually decided — the owner approved a specific card, gave a
  correction to fix, or otherwise made the call — make it, commit it, and push it.
  Don't stop to confirm first; that's a separate failure mode from editing without
  permission in the first place, and the owner has said explicitly not to do it.

## Talk to me, don't just execute

A request isn't only a ticket to close. Before or while building: say if something
seems off, redundant, or in tension with an earlier call — don't quietly build it
and let the owner find out later. Volunteer opinions and alternatives unprompted,
not just when asked for "options." Periodically zoom out and ask whether the
cumulative direction is actually working, not just whether the latest piece is
done. Telling the owner an idea seems wrong, or proposing a different one, is
expected, not overstepping — the owner does not know everything either, and has
said explicitly this is wanted, not just tolerated.

Design decisions — interface or deck/question structure alike — get validated
before they're built: present options with the reasoning behind each, and wait
for a call, rather than picking one and shipping it. This applies in every thread
working on this repo, not just the one where it was written down. It's separate
from card question text, which already has its own stricter sign-off rule below
(propose-only, three alternatives, never a single pick) — this covers everything
else that's a judgment call, not a clear bug fix or something the owner already
explicitly decided.

None of this undoes the rule above that a decided change gets built and pushed
without re-confirming — push back and offer options *before* or *during* the
decision; once it's actually made, execute cleanly.

## Running more than one Claude Code session at once

**What's actually going on:** every Claude Code session works on this project by
downloading a copy of the code, changing it, and then pushing those changes back to
the one shared copy online (`main`) — the same "shared copy" every session reads from
and writes to. If two sessions are both changing the same part of the code at close to
the same time, whichever one pushes second has to reconcile its changes with what the
first one already pushed. Usually that's automatic and invisible. Sometimes — when both
sessions touched the exact same lines — it isn't, and the second session has to stop
and manually sort out which change wins where. That's what happened this session: a
different Claude Code session fixed the same bug we did, and separately, a different
session restyled the exact screen area we were rebuilding at the same time.

Nothing broke because of it — both times it got sorted out and double-checked before
being pushed — but it's wasted effort, and if it landed wrong nobody would necessarily
notice until later. It's avoidable.

**For you (no coding needed):**
- If you're running two Claude Code sessions on this repo at the same time, tell each
  one plainly what part of the app it owns (e.g. "you handle the deck subtitles, you
  handle the card animations") so they're not likely to touch the same files.
- If you're not sure whether two tasks overlap, just run them one after another
  instead of at the same time — slower, but it can't collide.
- If a session tells you it hit a conflict with another session's work, that's it
  self-reporting exactly this — nothing to fix on your end, just good to know two
  sessions were active on overlapping ground.

**For any Claude session reading this file:** before starting a large or structural
change (touching many files, or a shared/foundational file like `config.js`), fetch
`origin/main` and skim the last handful of commits first. If another session has
recent or unfamiliar-looking work in the same area, say so before proceeding rather
than finding out at push time.

# Between Us — working rules for this repo

## Card changes require explicit owner sign-off, every time

Never edit, swap, or add a deck card's question text (in `questions/between-us-deck.md`
or in `questions.js`) without the owner's explicit permission for that specific change.
This applies even when the owner has asked in general terms for "more light," "a light
pass," or similar — a general request to improve the deck is not permission to write
specific cards into it.

Instead, when a card change seems warranted, raise it as a proposal and stop — do not
touch the files. For every card you think should change, produce one issue card in
exactly this format:

```
[Category], [number], [current question text]
Reason for change: [why this card should move]
Alternative 1: [candidate replacement question]
Alternative 2: [candidate replacement question]
Alternative 3: [candidate replacement question]
```

One issue card per proposed change, three alternatives each — never pick a single
winner yourself. Only write a swap into the deck files after the owner has replied
picking (or rewriting) one of the alternatives for that specific slot.

**NEVER PUSH A QUESTION WITHOUT CONSULTING THE OWNER FIRST. NEVER.** There used to be an
exception here for when the owner names a specific card and says what's wrong with it —
that exception is revoked. It was used to justify picking replacement text unilaterally
and shipping it, twice in a row, on the same slot, without the owner ever having seen the
actual words before they went live. The owner naming a bad card and saying so is
permission to remove it — it is not permission to also pick what replaces it. Even then,
show the proposed replacement text and get it approved before it's written into
`questions.js` or the deck file. No exception, no "this one's obviously fine," no
"they'll probably like this one." Every single card, every single time, the owner sees
the exact final words before they're pushed.

This does not restrict engineering/app-mechanic work (like the Twist modifier layer) —
only the deck's own card content.

## Open, position-inviting questions are not a flaw

Don't cite "reads like a debate" or "asks for a position instead of a story" as a reason to
flag a card. The owner has said explicitly that these are a deliberate, valued card type in
this deck — *"debating is cool, it lets people take a position, a well constructed open
question does more than a thousand specific ones"* — there to break up the monotone feel of
a deck that's otherwise all personal-anecdote prompts. Culture 9 (the art/artist dichotomy)
and Romance 6 (which relationship rule you question) are examples the owner has explicitly
defended on this basis. Judge these cards on the same tests as any other — is it interesting,
is it distinctive, does it duplicate another card — not on whether it invites a position
rather than a story.

## No dating-profile questions

If a candidate card reads like something off a dating-app prompt list ("what's your
warning label," "what's your red flag," "three words that describe you") — a device
borrowed from somewhere else rather than written for this deck — it's disqualified before
any other test runs, regardless of how well it otherwise scores on light/surprising/story.
Screen for this before proposing a card, not after the owner catches it.

## Always cite cards in full

Whenever a card is mentioned for any reason — a proposal, a collision, an example — cite
it as `Category, number, "question text"`, every time, not just category+number and not
just the text. The owner has no lookup table and isn't expected to build one; the full
citation is what makes a reply readable without cross-referencing the deck file.

## Keeping `questions/between-us-deck.md` and `questions.js` in sync

The deck's editorial source (`questions/between-us-deck.md`, with the BENCH and change
log) and the app's actual card data (`questions.js`) have to match exactly — same 34
categories, same 12 cards each, same text, in the same order. Whenever a card changes in
one, change it in the other in the same commit. If there's ever doubt they've drifted,
diff them category by category before touching either.
