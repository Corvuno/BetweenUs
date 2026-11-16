# The note (one short line that says what just happened)

One element, `#note` (`.note` in `styles.css`), the app's one way of saying something short. It is the
old "Undo skip" line made shared: same box, same type. `showNote(text, { undo })`,
`hideNote()` and `retireNote()` are in `presentation.js`.

## Words
- Save (the file: menu, end of a hand, Download the list in Played): "Saved as a file"
- Save for later: "Kept in Played"
- Clear the list: "List cleared" + Undo
- Delete a saved evening: "Evening deleted" + Undo
- Start over: "Every card back in" + Undo
- Open a list with a file that isn't a Between Us list: "That file isn't a Between Us list"

A note shows only when the action did something: Save with an empty list says nothing.

## Look
- Box: `--card-bg`, 1px border `rgba(201,168,76,.5)`, shadow `0 4px 24px rgba(0,0,0,.5)`, no radius,
  `min-height` 48px, 24px side padding, 18px between the words and Undo.
- Words: Jost, `--fs-1`, `--track-1`, uppercase, `--gold-l`, centred. Undo: the same type in
  `--gold`, underlined (1px, offset 6px), `--cream` on mouse hover; the button is 48px tall with the
  box, so the tap area is large enough.
- The box is as wide as its words and at most the screen's width minus 16px each side; a long
  note (the file one on a 360px phone) wraps rather than leaving the screen.

## Place
- `position:fixed`, horizontally centred, at the top: 16px or the notch's inset plus 8px, whichever is
  more. One element in the page, `z-index` 1000: above the dimming overlay, every sheet and the
  full-screen Spotlight.
- That is over the title area, where no control sits: it never covers Next card, Spotlight, Menu,
  Back or a sheet's buttons, so a tap meant for them cannot land on Undo. It never reaches the question.
  Checked on 360x640, 412x915 and 1440x900, with no sheet open and with Played open (the checks assert
  that its box overlaps no visible button, link or field, and not the question). With the computer's
  side panel open the note's edge can touch the panel's edge, never its buttons.

## Timings
- Appears and leaves with opacity and a 6px drop (from above), 250ms `--ease-out`. Under reduced motion: opacity
  only, 250ms linear, no movement.
- A plain note stays 2.5s; a note with Undo 5s.
- A new note replaces the one showing, its Undo with it. Tapping Undo puts what was there back and
  the note leaves at once. Anything that changes what Undo would bring back removes the note with
  Undo: a card shown, a new hand, a list or evening opened. A plain note is not removed by those.

## Reading aloud
`role="status"`, `aria-live="polite"`. While not showing it is `inert`, so its Undo cannot be reached.

## Rename (Played, saved evenings)
Rename turns the evening's name into an input in the same place, in the same type as the name
(`.play-save-name`, `--fs-6`, Cormorant Garamond, `--cream`), with a 1px `--celadon-dim` line under it.
The text is selected. Enter or tapping elsewhere keeps the new name; Escape or an empty name keeps the
old one. 80 characters at most (the same cap as a name taken from a file).
