#!/bin/sh
# Runs on every message the owner sends (UserPromptSubmit hook in
# .claude/settings.json). Whatever this prints is put in front of Claude
# with that message, so the first rule of CLAUDE.md can't get buried under
# a long skill or a long conversation. Added 2026-10-14 after the rule was
# skipped in a Keeper session.
cat <<'MSG'
FIRST RULE (CLAUDE.md): DO NOT GUESS. ASK.
Before any tool call that makes or changes something (a file, a render, a script, a mockup, a commit):
1. Name, to yourself, every detail of this message that is unstated or could go more than one way.
2. If there is even one, your reply is only the questions about it, in plain sentences. Then stop.
3. Only what the owner actually said, or a lesson/agreement already on file, counts as decided.
Under /keeper: the first reply to a wish is the area sort plus questions, nothing else.
MSG
