#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date +%Y%m%d%H%M%S)"

link_file() {
  local src="$1"
  local dst="$2"
  local dst_dir

  dst_dir="$(dirname "$dst")"
  mkdir -p "$dst_dir"

  if [[ -L "$dst" ]]; then
    rm "$dst"
  elif [[ -e "$dst" ]]; then
    mv "$dst" "${dst}.bak.${STAMP}"
  fi

  ln -s "$src" "$dst"
  printf 'linked %s -> %s\n' "$dst" "$src"
}

link_file "$ROOT/homebrew/Brewfile" "$HOME/.Brewfile"

link_file "$ROOT/shell/zsh/.zshrc" "$HOME/.zshrc"
link_file "$ROOT/shell/zsh/.zprofile" "$HOME/.zprofile"
link_file "$ROOT/shell/zsh/.zshenv" "$HOME/.zshenv"
link_file "$ROOT/shell/zsh/.config/zsh" "$HOME/.config/zsh"
link_file "$ROOT/shell/bash/.bash_profile" "$HOME/.bash_profile"
link_file "$ROOT/shell/bash/.bashrc" "$HOME/.bashrc"
link_file "$ROOT/shell/bash/.profile" "$HOME/.profile"

link_file "$ROOT/cli/git/.gitconfig" "$HOME/.gitconfig"
link_file "$ROOT/cli/git/.config/git/ignore" "$HOME/.config/git/ignore"
link_file "$ROOT/cli/yazi/.config/yazi/yazi.toml" "$HOME/.config/yazi/yazi.toml"
link_file "$ROOT/cli/yazi/.config/yazi/keymap.toml" "$HOME/.config/yazi/keymap.toml"
link_file "$ROOT/cli/yazi/.config/yazi/theme.toml" "$HOME/.config/yazi/theme.toml"
link_file "$ROOT/cli/yazi/.config/yazi/flavors/kaku-dark.yazi/flavor.toml" "$HOME/.config/yazi/flavors/kaku-dark.yazi/flavor.toml"
link_file "$ROOT/cli/yazi/.config/yazi/flavors/kaku-light.yazi/flavor.toml" "$HOME/.config/yazi/flavors/kaku-light.yazi/flavor.toml"
link_file "$ROOT/cli/fastfetch/.config/fastfetch/config.jsonc" "$HOME/.config/fastfetch/config.jsonc"

link_file "$ROOT/terminal/tmux/.tmux.conf" "$HOME/.tmux.conf"
link_file "$ROOT/terminal/starship/.config/starship.toml" "$HOME/.config/starship.toml"
link_file "$ROOT/terminal/ghostty/.config/ghostty/config" "$HOME/.config/ghostty/config"
link_file "$ROOT/terminal/ghostty/.config/ghostty/themes/atom-one-dark" "$HOME/.config/ghostty/themes/atom-one-dark"
link_file "$ROOT/terminal/ghostty/.config/ghostty/themes/claude-code-light" "$HOME/.config/ghostty/themes/claude-code-light"

link_file "$ROOT/editors/zed/.config/zed/settings.json" "$HOME/.config/zed/settings.json"
link_file "$ROOT/editors/lvim/.config/lvim/config.lua" "$HOME/.config/lvim/config.lua"
link_file "$ROOT/editors/kaku/.config/kaku/kaku.lua" "$HOME/.config/kaku/kaku.lua"
