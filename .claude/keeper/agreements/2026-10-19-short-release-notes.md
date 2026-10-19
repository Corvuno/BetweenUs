# Short release notes (agreed 2026-10-19)

Wish: the 1.5.0 notes were ~30 detailed lines for a "Medium update", repeating and contradicting themselves. Owner: "way too detailed, who cares."

Agreed (area C, release machinery):
- Release notes are headlines for players: about five bullets, one per thing a player would notice, card changes as one bullet with counts, everything small folded into a final "smaller fixes" bullet. No section headings, nothing about colours, fonts, sizes or positions, no card text.
- Kept in `RELEASE-NOTES-NEXT.md`; every user-facing commit updates or merges a headline (rule added to CLAUDE.md). The release publishes it and empties it afterwards. Empty file: old Note-line notes, capped at five.
- Not changed: release sizing and version numbers; the published 1.5.0 notes stay as they are.

Built 2026-10-19 (7c71da4, bbda187, a900c4f). Reviewed; reset step hardened and tested.
