#!/bin/sh
# Session start: shows the last run of the product's checks on its main branch, so a red run is
# fixed before other work. The workflow file is named in .claude/keeper/checks-workflow (one
# line, e.g. "checks.yml"); without that file this prints nothing. Never blocks the session.
DIR="${CLAUDE_PROJECT_DIR:-.}"
[ -f "$DIR/.claude/keeper/checks-workflow" ] || exit 0
WF=$(head -n1 "$DIR/.claude/keeper/checks-workflow" | tr -d ' \r')
REPO=$(git -C "$DIR" remote get-url origin 2>/dev/null | sed -E 's#^.*github\.com[:/]##; s#^.*/git/##; s#\.git$##')
[ -n "$WF" ] && [ -n "$REPO" ] || exit 0
Q="repos/$REPO/actions/workflows/$WF/runs?branch=main&per_page=1"
F='.workflow_runs[0] | "\(.head_sha[0:7]) \(.status) \(.conclusion // "-") \(.display_title)"'
if command -v gh >/dev/null 2>&1; then
  R=$(timeout 15 gh api "$Q" --jq "$F" 2>/dev/null)
fi
if [ -z "$R" ] && command -v curl >/dev/null 2>&1 && command -v jq >/dev/null 2>&1; then
  R=$(timeout 15 curl -fsS "https://api.github.com/$Q" 2>/dev/null | jq -r "$F" 2>/dev/null)
fi
if [ -z "$R" ]; then
  echo "Checks on main: could not be read at session start. Look before building."
  exit 0
fi
set -- $R
SHA=$1; STATUS=$2; RESULT=$3; shift 3
case "$STATUS:$RESULT" in
  completed:success) echo "Checks on main: green (last run: $*, $SHA)." ;;
  completed:*) echo "Checks on main: RED ($RESULT) on \"$*\" ($SHA). Fix this first, before any other work." ;;
  *) echo "Checks on main: still running for \"$*\" ($SHA). Look again before landing anything that touches the same code." ;;
esac
exit 0
