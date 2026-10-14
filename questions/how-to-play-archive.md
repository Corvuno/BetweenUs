# How to play — archive

Archived 2026-10-14 from the How to play panel, kept so it can be rewritten later.
The panel is now "Ways to play" and keeps only: the opening line, the seven ways, the note under them, and the closing line.

Each part has the raw HTML (nothing lost, SVG illustrations included) and a plain-text reading copy (illustrations shown as [illustration: …] from their aria-labels).

## Part 1 — Opening paragraphs (between the opening line and "Ways to play")

### Raw HTML

```html
    <p>Most conversations stay on the surface because nothing ever quite gives them permission to go deeper. Between Us is built to do that &mdash; a deck of questions for the kind of talk that doesn't usually happen on its own, whether it's two people or a full table.</p>
    <p>Draw a card and read it out loud. Answer it, or hand it to someone else. There's nothing to win and nothing to get right. Pass if a question doesn't land &mdash; no explanation needed, and nobody asks why.</p>
    <p>That's the whole game. Sit down, take your time, and have fun with it.</p>
```

### Reading copy

```text
Most conversations stay on the surface because nothing ever quite gives them permission to go deeper. Between Us is built to do that — a deck of questions for the kind of talk that doesn't usually happen on its own, whether it's two people or a full table.

Draw a card and read it out loud. Answer it, or hand it to someone else. There's nothing to win and nothing to get right. Pass if a question doesn't land — no explanation needed, and nobody asks why.

That's the whole game. Sit down, take your time, and have fun with it.
```

## Part 2 — Intro line of "Ways to play" (before the seven tiles)

### Raw HTML

```html
    <p>Agree on one before the first card, so everyone knows what they're in. All of them work for two people or for a table of eight.</p>
```

### Reading copy

```text
Agree on one before the first card, so everyone knows what they're in. All of them work for two people or for a table of eight.
```

## Part 3 — Everything between the "There are more ways…" note and the closing line

### Raw HTML

```html
    <h4>Going through the app</h4>
    <div class="hp-step"><span class="hp-num">1</span><div class="hp-body"><p><strong>Set the room.</strong> The three words at the top &mdash; <span class="ui">Categories</span> <span class="ui">Shuffle</span> <span class="ui">Cards</span> &mdash; are the whole setup. Open Categories and pick something to <em>start from</em>: Everything, New people, Friends, Date, Partner, Late night, Solo, Work, Family, or one of the two lists. Each switches on what fits that room and marks what's within reach. Below sits every category: choose one to add or drop it, hold it to read what it holds without changing anything.</p></div></div>
    <div class="hp-step"><span class="hp-num">2</span><div class="hp-body"><p><strong>Choose how you draw.</strong> Shuffle sets the order, Cards sets how many you draw at once &mdash; 5, 10, 20, or the whole selection. Five is a conversation; twenty is an evening.</p></div></div>
    <div class="hp-step"><span class="hp-num">3</span><div class="hp-body"><p><strong>Play.</strong> <span class="ui">Draw card</span> starts it, and the card itself does the rest:</p>
      <div class="hp-gest">
        <div class="hp-g">
          <svg viewBox="0 0 44 44" role="img" aria-label="Tap the card, or swipe left, for the next question.">
            <rect x="11" y="8" width="22" height="28" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/>
            <line x1="30" y1="22" x2="18" y2="22" stroke="#e8c97a" stroke-width="1.4"/>
            <polygon points="15,22 21,19 21,25" fill="#e8c97a"/>
          </svg>
          <span>Next</span>
        </div>
        <div class="hp-g">
          <svg viewBox="0 0 44 44" role="img" aria-label="Swipe right to go back a card.">
            <rect x="11" y="8" width="22" height="28" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/>
            <line x1="14" y1="22" x2="26" y2="22" stroke="#e8c97a" stroke-width="1.4"/>
            <polygon points="29,22 23,19 23,25" fill="#e8c97a"/>
          </svg>
          <span>Back</span>
        </div>
        <div class="hp-g">
          <svg viewBox="0 0 44 44" role="img" aria-label="Swipe down to skip a card, with a moment to undo.">
            <rect x="11" y="8" width="22" height="28" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/>
            <line x1="22" y1="13" x2="22" y2="27" stroke="#e8c97a" stroke-width="1.4"/>
            <polygon points="22,30 19,24 25,24" fill="#e8c97a"/>
          </svg>
          <span>Skip</span>
        </div>
        <div class="hp-g">
          <svg viewBox="0 0 44 44" role="img" aria-label="Tap the star to keep a card in your favourites.">
            <rect x="11" y="8" width="22" height="28" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/>
            <text x="22" y="28" text-anchor="middle" font-family="'Jost',sans-serif" font-size="16" fill="#e8c97a">&#9733;</text>
          </svg>
          <span>Keep</span>
        </div>
      </div>
      <p class="hp-sub">Tap or click the card, or swipe. With a keyboard the arrow keys do the same, and &#8595; skips.</p>
      <p class="hp-sub"><span class="ui">Twist</span>, next to Full Screen, gives the card a different lens before you've answered it &mdash; how you'd have answered this five years ago, what someone close to you would notice first, what you'd say if it cost you nothing. Tap it and the card's own count swaps to the lens for that draw; tap again for a different one. Optional, and it never survives the next card.</p></div></div>
    <div class="hp-step"><span class="hp-num">4</span><div class="hp-body"><p><strong>Let the hand end.</strong> When the hand runs out, the card turns gold and shows you where you went: the categories you covered and anything you starred. Stop there. Stand up, stretch, get some air, let the last answer settle &mdash; a hand has an end for a reason, and the deck will wait. Rolling straight into the next one is how a table stops listening.</p></div></div>
    <div class="hp-step"><span class="hp-num">5</span><div class="hp-body"><p><strong>Keep what's worth keeping.</strong> The menu (&#8801;) holds the log of everything drawn this session, the cards you starred, a save so you can pick the deck up later, your own written cards, the language switch, and Reshuffle &mdash; a fresh shuffle without changing anything else.</p></div></div>

    <h4>Filters, and lists</h4>
    <figure>
      <svg viewBox="0 0 240 104" role="img" aria-label="A filter draws one card at random from several categories at once; a list runs from card one to the end, in order.">
        <text x="56" y="12" text-anchor="middle" font-family="'Jost',sans-serif" font-size="8" letter-spacing="1.6" fill="currentColor" opacity=".5">FILTER</text>
        <circle cx="14" cy="30" r="4" fill="#d58b34"/>
        <circle cx="35" cy="26" r="4" fill="#669bbb"/>
        <circle cx="56" cy="30" r="4" fill="#65c9b0"/>
        <circle cx="77" cy="26" r="4" fill="#96b87b"/>
        <circle cx="98" cy="30" r="4" fill="#df7a91"/>
        <path d="M14 36 L50 60 M35 32 L52 60 M56 36 L56 60 M77 32 L61 60 M98 36 L63 60" stroke="currentColor" stroke-width="1" opacity=".25" fill="none"/>
        <rect x="46" y="62" width="20" height="26" rx="2" fill="rgba(201,168,76,.14)" stroke="#c9a84c" stroke-width="1.2"/>
        <text x="56" y="100" text-anchor="middle" font-family="'Jost',sans-serif" font-size="7.5" letter-spacing="1" fill="currentColor" opacity=".45">ANY ORDER</text>
        <line x1="120" y1="8" x2="120" y2="96" stroke="currentColor" stroke-width="1" opacity=".14"/>
        <text x="182" y="12" text-anchor="middle" font-family="'Jost',sans-serif" font-size="8" letter-spacing="1.6" fill="currentColor" opacity=".5">LIST</text>
        <rect x="134" y="34" width="16" height="24" rx="2" fill="rgba(201,168,76,.14)" stroke="#c9a84c" stroke-width="1.2"/>
        <text x="142" y="50" text-anchor="middle" font-family="'Jost',sans-serif" font-size="9" fill="#e8c97a">1</text>
        <rect x="156" y="34" width="16" height="24" rx="2" fill="none" stroke="#c9a84c" stroke-width="1.1" opacity=".6"/>
        <text x="164" y="50" text-anchor="middle" font-family="'Jost',sans-serif" font-size="9" fill="#e8c97a" opacity=".7">2</text>
        <rect x="178" y="34" width="16" height="24" rx="2" fill="none" stroke="#c9a84c" stroke-width="1.1" opacity=".45"/>
        <text x="186" y="50" text-anchor="middle" font-family="'Jost',sans-serif" font-size="9" fill="#e8c97a" opacity=".55">3</text>
        <rect x="200" y="34" width="16" height="24" rx="2" fill="none" stroke="#c9a84c" stroke-width="1.1" opacity=".3"/>
        <text x="208" y="50" text-anchor="middle" font-family="'Jost',sans-serif" font-size="9" fill="#e8c97a" opacity=".4">4</text>
        <text x="228" y="50" text-anchor="middle" font-family="'Jost',sans-serif" font-size="9" fill="currentColor" opacity=".4">&#8230;</text>
        <text x="182" y="100" text-anchor="middle" font-family="'Jost',sans-serif" font-size="7.5" letter-spacing="1" fill="currentColor" opacity=".45">IN ORDER</text>
      </svg>
      <figcaption>A filter mixes categories &middot; a list runs first card to last</figcaption>
    </figure>
    <p>Nearly every category is a filter: switch a few on and the deck draws from all of them at once. Two are not. <strong class="hp-colbert">Colbert</strong> and <strong class="hp-aron">The 36</strong> are question <em>lists</em> &mdash; fixed sets, written to be played from the first card to the last, each with its own pace. They're marked with a &#9656; wherever they appear.</p>
    <p>Choose either under <em>Start from</em> and it takes the deck over: fifteen questions in their original order for Colbert, thirty-six rising ones for The 36 &mdash; the closeness study, meant to be done in one sitting, with one other person. Mixed in among other categories they're simply more cards; on their own, they're the evening. (Magical behaves the same way if you pick it alone.)</p>

    <h4>Categories and After Dark</h4>
    <p>The grid runs from light to deep &mdash; Openers, Question lists, Days &amp; world, Inner, People, Deep water. Anything marked &#10022; is adult territory and stays out of every deck until you turn <strong>After Dark</strong> on yourself. The small &#10022; beside that button is a bias rather than a switch: with it on, spicy cards get woven through a round instead of filling it. Modes with nothing of it inside &mdash; Work, Family, New people, Solo &mdash; lock it away entirely; everywhere else it's yours to decide.</p>

    <h4>Shuffle</h4>
    <div class="hp-shuf">
      <svg viewBox="0 0 96 30" role="img" aria-label="Random: card depth scattered at random.">
        <circle cx="6" cy="20" r="2.6" fill="currentColor"/><circle cx="18" cy="7" r="2.6" fill="currentColor"/>
        <circle cx="30" cy="23" r="2.6" fill="currentColor"/><circle cx="42" cy="11" r="2.6" fill="currentColor"/>
        <circle cx="54" cy="25" r="2.6" fill="currentColor"/><circle cx="66" cy="9" r="2.6" fill="currentColor"/>
        <circle cx="78" cy="19" r="2.6" fill="currentColor"/><circle cx="90" cy="13" r="2.6" fill="currentColor"/>
      </svg>
      <div class="hp-shuf-t"><b>Random</b>Fully random &mdash; anything goes.</div>
    </div>
    <div class="hp-shuf">
      <svg viewBox="0 0 96 30" role="img" aria-label="Deep: cards trend steadily deeper.">
        <polyline points="6,23 18,20 30,17 42,14 54,11 66,9 78,7 90,5" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".3"/>
        <circle cx="6" cy="23" r="2.6" fill="currentColor"/><circle cx="18" cy="20" r="2.6" fill="currentColor"/>
        <circle cx="30" cy="17" r="2.6" fill="currentColor"/><circle cx="42" cy="14" r="2.6" fill="currentColor"/>
        <circle cx="54" cy="11" r="2.6" fill="currentColor"/><circle cx="66" cy="9" r="2.6" fill="currentColor"/>
        <circle cx="78" cy="7" r="2.6" fill="currentColor"/><circle cx="90" cy="5" r="2.6" fill="currentColor"/>
      </svg>
      <div class="hp-shuf-t"><b>Deep</b>Leans toward the harder, more vulnerable cards.</div>
    </div>
    <div class="hp-shuf">
      <svg viewBox="0 0 96 30" role="img" aria-label="Breadth: one card from every active category, cycling.">
        <circle cx="6" cy="15" r="2.8" fill="#d58b34"/><circle cx="18" cy="15" r="2.8" fill="#f3c33c"/>
        <circle cx="30" cy="15" r="2.8" fill="#669bbb"/><circle cx="42" cy="15" r="2.8" fill="#65c9b0"/>
        <circle cx="54" cy="15" r="2.8" fill="#96b87b"/><circle cx="66" cy="15" r="2.8" fill="#df7a91"/>
        <circle cx="78" cy="15" r="2.8" fill="#8066e1"/><circle cx="90" cy="15" r="2.8" fill="#4dbebe"/>
      </svg>
      <div class="hp-shuf-t"><b>Breadth</b>One card from every active category, cycling.</div>
    </div>
    <div class="hp-shuf">
      <svg viewBox="0 0 96 30" role="img" aria-label="Arc: a warm start, deeper water, then a cool-down, repeating.">
        <path d="M5 24 C 20 24 22 6 48 6 S 76 24 91 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
        <circle cx="5" cy="24" r="2.6" fill="currentColor"/><circle cx="26" cy="9" r="2.6" fill="currentColor"/>
        <circle cx="48" cy="6" r="2.6" fill="currentColor"/><circle cx="70" cy="9" r="2.6" fill="currentColor"/>
        <circle cx="91" cy="24" r="2.6" fill="currentColor"/>
      </svg>
      <div class="hp-shuf-t"><b>Arc</b>A warm start, deeper water, a cool-down &mdash; then it climbs again. The four dots under the card show where you are.</div>
    </div>
    <p>Cards you've already drawn move to the back, so each new hand gives you unseen questions until the selection runs dry. The lists ignore all of this: they play in their own order, always.</p>

    <h4>Full screen</h4>
    <p>The <span class="ui">Full screen</span> button leaves you the card and nothing else &mdash; for the middle of a table, or any screen the room can see. The right side of the card takes you to the next question, the left edge back, and swiping works too. Everything else fades away after a few seconds, and the screen won't sleep. Close, or Esc, brings the app back.</p>

    <h4>Your own cards</h4>
    <p><span class="ui">Custom card</span> in the menu adds a question of your own &mdash; English, Dutch, or both &mdash; to whichever category you file it under, and it gets drawn like any other. Cards you write, and the session log, can be exported to a file and handed to someone else's copy.</p>
```

### Reading copy

```text
## Going through the app

1. Set the room. The three words at the top — Categories Shuffle Cards — are the whole setup. Open Categories and pick something to start from: Everything, New people, Friends, Date, Partner, Late night, Solo, Work, Family, or one of the two lists. Each switches on what fits that room and marks what's within reach. Below sits every category: choose one to add or drop it, hold it to read what it holds without changing anything.

2. Choose how you draw. Shuffle sets the order, Cards sets how many you draw at once — 5, 10, 20, or the whole selection. Five is a conversation; twenty is an evening.

3. Play. Draw card starts it, and the card itself does the rest:

[illustration: Tap the card, or swipe left, for the next question.]

Next

[illustration: Swipe right to go back a card.]

Back

[illustration: Swipe down to skip a card, with a moment to undo.]

Skip

[illustration: Tap the star to keep a card in your favourites.]

Keep

Tap or click the card, or swipe. With a keyboard the arrow keys do the same, and ↓ skips.

Twist, next to Full Screen, gives the card a different lens before you've answered it — how you'd have answered this five years ago, what someone close to you would notice first, what you'd say if it cost you nothing. Tap it and the card's own count swaps to the lens for that draw; tap again for a different one. Optional, and it never survives the next card.

4. Let the hand end. When the hand runs out, the card turns gold and shows you where you went: the categories you covered and anything you starred. Stop there. Stand up, stretch, get some air, let the last answer settle — a hand has an end for a reason, and the deck will wait. Rolling straight into the next one is how a table stops listening.

5. Keep what's worth keeping. The menu (≡) holds the log of everything drawn this session, the cards you starred, a save so you can pick the deck up later, your own written cards, the language switch, and Reshuffle — a fresh shuffle without changing anything else.

## Filters, and lists

[illustration: A filter draws one card at random from several categories at once; a list runs from card one to the end, in order.]

A filter mixes categories · a list runs first card to last

Nearly every category is a filter: switch a few on and the deck draws from all of them at once. Two are not. Colbert and The 36 are question lists — fixed sets, written to be played from the first card to the last, each with its own pace. They're marked with a ▸ wherever they appear.

Choose either under Start from and it takes the deck over: fifteen questions in their original order for Colbert, thirty-six rising ones for The 36 — the closeness study, meant to be done in one sitting, with one other person. Mixed in among other categories they're simply more cards; on their own, they're the evening. (Magical behaves the same way if you pick it alone.)

## Categories and After Dark

The grid runs from light to deep — Openers, Question lists, Days & world, Inner, People, Deep water. Anything marked ✦ is adult territory and stays out of every deck until you turn After Dark on yourself. The small ✦ beside that button is a bias rather than a switch: with it on, spicy cards get woven through a round instead of filling it. Modes with nothing of it inside — Work, Family, New people, Solo — lock it away entirely; everywhere else it's yours to decide.

## Shuffle

[illustration: Random: card depth scattered at random.]

Random
Fully random — anything goes.

[illustration: Deep: cards trend steadily deeper.]

Deep
Leans toward the harder, more vulnerable cards.

[illustration: Breadth: one card from every active category, cycling.]

Breadth
One card from every active category, cycling.

[illustration: Arc: a warm start, deeper water, then a cool-down, repeating.]

Arc
A warm start, deeper water, a cool-down — then it climbs again. The four dots under the card show where you are.

Cards you've already drawn move to the back, so each new hand gives you unseen questions until the selection runs dry. The lists ignore all of this: they play in their own order, always.

## Full screen

The Full screen button leaves you the card and nothing else — for the middle of a table, or any screen the room can see. The right side of the card takes you to the next question, the left edge back, and swiping works too. Everything else fades away after a few seconds, and the screen won't sleep. Close, or Esc, brings the app back.

## Your own cards

Custom card in the menu adds a question of your own — English, Dutch, or both — to whichever category you file it under, and it gets drawn like any other. Cards you write, and the session log, can be exported to a file and handed to someone else's copy.
```
