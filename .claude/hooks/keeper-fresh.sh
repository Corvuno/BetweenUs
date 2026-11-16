#!/bin/sh
# Session start: brings this product's copy of the generic Keeper up to date with
# https://github.com/Corvuno/Keeper, so a conversation never runs on an old Keeper. The product's
# "Keeper refresh" job does the same on a timer, but the timer can be hours late. Only the copied
# files change. Silent when up to date; never blocks the session.
# The braces make the shell read the whole script before running it: this file replaces itself.
{
  DIR="${CLAUDE_PROJECT_DIR:-.}"
  LIST="$DIR/.claude/keeper-core.txt"
  SRC="https://github.com/Corvuno/Keeper.git"
  [ -f "$LIST" ] && command -v git >/dev/null 2>&1 || exit 0
  HAVE=$(sed -n 's/^# Source commit: //p' "$LIST" | head -n1)
  NOW=$(timeout 20 git ls-remote "$SRC" refs/heads/main 2>/dev/null | cut -c1-40)
  if [ -z "$NOW" ]; then
    echo "The Keeper's source could not be reached at session start, so its files here may be behind (they are from $HAVE)."
    exit 0
  fi
  case "$NOW" in "${HAVE:-none}"*) exit 0 ;; esac
  TMP=$(mktemp -d 2>/dev/null) || exit 0
  if timeout 90 git clone -q --depth 1 "$SRC" "$TMP/keeper" 2>/dev/null \
     && sh "$TMP/keeper/install.sh" "$TMP/keeper" "$DIR" >/dev/null 2>&1; then
    NEW=$(sed -n 's/^# Source commit: //p' "$LIST" | head -n1)
    echo "The Keeper's files here were behind and have just been brought up to date (from $HAVE to $NEW). Read them from disk now, not from memory. They show as changed files under .claude: land them with your next push as \"Keeper refreshed to $NEW\" with the line \"No issue: automatic refresh of the generic Keeper files from Corvuno/Keeper.\", and tell the owner in one line that the Keeper was updated."
  else
    echo "The Keeper's files here are behind (they are from $HAVE) and could not be updated at session start. Start this product's \"Keeper refresh\" job by hand before other work."
  fi
  rm -rf "$TMP"
  exit 0
}
