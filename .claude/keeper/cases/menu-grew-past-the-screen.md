# The menu grew past the screen

Resolved.

- What happened: Three got a line in the phone's menu and the menu got a third group. The sheet
  became taller than it may be, so it scrolled and its last two items (Ways to play, Show hints
  again) sat below the edge. The Keeper looked at a picture in which the foot was cut off and
  passed it.
- What the owner expected: a menu that shows everything it holds. "That's for one ugly, and two:
  you can't see it, so the last two items are lost."
- Cause: a mechanical slip. The item's "Done when" lines said what the menu holds, not that it
  fits, and nothing measured it.
- Changed: the menu's gaps follow one rhythm that steps down on shorter screens, and a test fails
  when any line or the foot falls outside the screen on three phone sizes
  (`design/under-card.md`, "Menu").
