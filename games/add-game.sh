#!/bin/sh
# Add a Charge! Games game to Stage Ready with the Family Church Students skin.
# usage: sh games/add-game.sh <slug>      (slug = the game's folder on the Charge site, e.g. who-am-i)
# Creates games/<slug>/, games/<slug>/controller/ and games/<slug>/table/ as copies of games/shell.html.
# Until the game is live on the Charge site, the pages show "This game is coming soon".
set -e
[ -n "$1" ] || { echo "usage: sh games/add-game.sh <slug>"; exit 1; }
cd "$(dirname "$0")"
for d in "$1" "$1/controller" "$1/table"; do mkdir -p "$d"; cp shell.html "$d/index.html"; done
echo "added games/$1/ (screen, controller, table). Link it from resources.json if Jake wants it in Tools."
