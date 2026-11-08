#!/bin/sh
# Session start: shows GitHub's last full check run on main.
# Small changes land without waiting for it, so every session looks here first
# and fixes a red run before its own work (CHECKS.md, "Which checks a build runs").
# Never blocks the session: any failure to reach GitHub prints one line and exits 0.
Q='repos/Corvuno/BetweenUs/actions/workflows/checks.yml/runs?branch=main&per_page=1'
F='.workflow_runs[0] | "\(.head_sha[0:7]) \(.status) \(.conclusion // "-") \(.display_title)"'
if command -v gh >/dev/null 2>&1; then
  R=$(timeout 15 gh api "$Q" --jq "$F" 2>/dev/null)
fi
if [ -z "$R" ] && command -v curl >/dev/null 2>&1 && command -v jq >/dev/null 2>&1; then
  R=$(timeout 15 curl -fsS "https://api.github.com/$Q" 2>/dev/null | jq -r "$F" 2>/dev/null)
fi
if [ -z "$R" ]; then
  echo "GitHub checks on main: could not be read at session start. Look before building (CHECKS.md)."
  exit 0
fi
set -- $R
SHA=$1; STATUS=$2; RESULT=$3; shift 3
case "$STATUS:$RESULT" in
  completed:success) echo "GitHub checks on main: green (last run: $*, $SHA)." ;;
  completed:*) echo "GitHub checks on main: RED ($RESULT) on \"$*\" ($SHA). Fix this first, before any other work: rerun only the failing checks locally with --only= (CHECKS.md, \"Which checks a build runs\")." ;;
  *) echo "GitHub checks on main: still running for \"$*\" ($SHA). Look again before landing anything that touches the same code." ;;
esac
exit 0
