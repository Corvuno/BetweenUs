#!/bin/sh
# A signal, never a limit. At session start this says so when the Keeper's files have grown a
# lot since the last upkeep, so it can be looked at. It blocks nothing and is silent otherwise.
#   keeper-size.sh            compare with the sizes recorded at the last upkeep
#   keeper-size.sh --record   record the sizes as they are now (done at each upkeep)
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
BASE=".claude/keeper/sizes.txt"
now() {
  for f in CLAUDE.md .claude/skills/keeper/*.md .claude/keeper/*.md .claude/agents/*.md; do
    [ -f "$f" ] && printf '%s %s\n' "$(wc -c < "$f" | tr -d ' ')" "$f"
  done
  return 0
}
if [ "$1" = "--record" ]; then
  now > "$BASE" && echo "Keeper sizes recorded."
  exit 0
fi
[ -f "$BASE" ] || exit 0
now | awk -v base="$BASE" '
  BEGIN { while ((getline line < base) > 0) { split(line, a, " "); old[a[2]] = a[1]; oldtotal += a[1] } }
  { total += $1; grow = $1 - old[$2]; if (grow > most) { most = grow; which = $2 } }
  END {
    if (oldtotal > 0 && total * 100 > oldtotal * 115) {
      printf "The Keeper'"'"'s files have grown %d%% since the last upkeep (%d to %d characters; most in %s). Nothing is blocked; worth a look: was something added that should have replaced what was there?\n", (total - oldtotal) * 100 / oldtotal, oldtotal, total, which
    }
  }'
exit 0
