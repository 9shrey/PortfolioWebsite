#!/bin/sh
# Runs Blender headless. Relative --python paths are made absolute, and scripts chdir to $ROOM_REPO
# (the repo root), because Flatpak Blender starts in /app/blender.
cd "$(dirname "$0")/../.." || exit 1
REPO="$PWD"
args=""
for a in "$@"; do
  case "$a" in *.py) [ "${a#/}" = "$a" ] && a="$REPO/$a" ;; esac
  args="$args \"$a\""
done
if command -v blender >/dev/null 2>&1; then
  eval ROOM_REPO=\"$REPO\" exec blender -b $args
fi
eval exec flatpak run --env=ROOM_REPO=\"$REPO\" --filesystem=\"$REPO\" --filesystem=/tmp org.blender.Blender -b $args
