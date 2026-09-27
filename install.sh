#!/usr/bin/env bash
# Install the skills in this repository for one or more coding agents.
#
#   ./install.sh                 # link into every agent found on this machine
#   ./install.sh claude codex    # only these agents
#   ./install.sh --copy cursor   # copy instead of symlink (for machines without the clone)
#   ./install.sh --uninstall     # remove the links/copies this script made
#
# Agents and their user-level skill folders:
#   claude  ~/.claude/skills      codex   ~/.codex/skills
#   cursor  ~/.cursor/skills      agents  ~/.agents/skills   (shared folder read by several agents)
# Symlinks keep every agent on the same copy, so `git pull` updates all of them.
set -euo pipefail

repo="$(cd "$(dirname "$0")" && pwd)"
mode=link; uninstall=0; wanted=()
for a in "$@"; do
  case "$a" in
    --copy) mode=copy ;;
    --uninstall) uninstall=1 ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) wanted+=("$a") ;;
  esac
done

dir_for() {
  case "$1" in
    claude) echo "$HOME/.claude/skills" ;;
    codex)  echo "$HOME/.codex/skills" ;;
    cursor) echo "$HOME/.cursor/skills" ;;
    agents) echo "$HOME/.agents/skills" ;;
    *) echo "unknown agent '$1' (use claude, codex, cursor or agents)" >&2; exit 1 ;;
  esac
}

if [ ${#wanted[@]} -eq 0 ]; then
  for a in claude codex cursor agents; do [ -d "$(dirname "$(dir_for $a)")" ] && wanted+=("$a"); done
  [ ${#wanted[@]} -eq 0 ] && { echo "No agent folders found; pass one explicitly, e.g. ./install.sh claude" >&2; exit 1; }
fi

for skill in "$repo"/skills/*/; do
  name="$(basename "$skill")"; skill="${skill%/}"
  [ -f "$skill/SKILL.md" ] || continue
  for a in "${wanted[@]}"; do
    dest="$(dir_for "$a")/$name"
    if [ $uninstall -eq 1 ]; then
      if [ -L "$dest" ] || [ -f "$dest/.installed-from-generative-painting-skills" ]; then rm -rf "$dest"; echo "removed  $dest"; fi
      continue
    fi
    mkdir -p "$(dirname "$dest")"
    if [ -e "$dest" ] || [ -L "$dest" ]; then
      if [ -L "$dest" ] || [ -f "$dest/.installed-from-generative-painting-skills" ]; then rm -rf "$dest"
      else echo "skip     $dest (exists and was not installed by this script)"; continue; fi
    fi
    if [ "$mode" = copy ]; then
      cp -R "$skill" "$dest" && touch "$dest/.installed-from-generative-painting-skills"
      rm -rf "$dest/engine/node_modules"
    else
      ln -s "$skill" "$dest"
    fi
    echo "$mode     $dest"
  done
done
[ $uninstall -eq 1 ] || echo "Done. Restart your agent, then ask e.g. \"make a watercolour film about wildflowers\"."
