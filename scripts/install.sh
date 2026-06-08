#!/usr/bin/env bash
# dotfiles one-click installer — works on macOS and Linux
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { printf "${BLUE}==>${NC} %s\n" "$*"; }
ok()    { printf "${GREEN}  ✓${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}  !${NC} %s\n" "$*"; }
err()   { printf "${RED}  ✗${NC} %s\n" "$*" >&2; }
abort() { err "$*"; exit 1; }

# ── OS detection ────────────────────────────────────────────────────
OS="$(uname -s)"
case "$OS" in
  Darwin)  OS=macos ;;
  Linux)   OS=linux ;;
  *)       abort "Unsupported OS: $OS" ;;
esac

DOTFILES="${DOTFILES:-$HOME/dotfiles}"
REPO_URL="${REPO_URL:-git@github.com:huahai/dotfiles.git}"

echo ""
printf "${GREEN}┌────────────────────────────────────────────┐${NC}\n"
printf "${GREEN}│${NC}       ${YELLOW}dotfiles installer${NC}                       ${GREEN}│${NC}\n"
printf "${GREEN}│${NC}       OS: %-34s ${GREEN}│${NC}\n" "$OS"
printf "${GREEN}└────────────────────────────────────────────┘${NC}\n"
echo ""

# ── Step 1: Install base packages ───────────────────────────────────
info "Installing base packages..."

install_pkg() {
  local pkg="$1"
  case "$OS" in
    macos)
      if ! command -v brew &>/dev/null; then
        warn "Homebrew not found, installing..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      fi
      brew install "$pkg" 2>/dev/null || warn "Failed to install $pkg (non-critical)"
      ;;
    linux)
      if command -v apt-get &>/dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq "$pkg" 2>/dev/null || warn "Failed to install $pkg via apt"
      elif command -v dnf &>/dev/null; then
        sudo dnf install -y "$pkg" 2>/dev/null || warn "Failed to install $pkg via dnf"
      elif command -v pacman &>/dev/null; then
        sudo pacman -S --noconfirm "$pkg" 2>/dev/null || warn "Failed to install $pkg via pacman"
      else
        warn "No supported package manager found — please install $pkg manually"
      fi
      ;;
  esac
}

# Essentials
install_pkg zsh
install_pkg git
install_pkg curl

# Optional but recommended
install_pkg fzf
install_pkg fd
install_pkg ripgrep
install_pkg eza

ok "Base packages done"

# ── Step 2: Clone dotfiles if not already present ───────────────────
if [ ! -d "$DOTFILES" ]; then
  info "Cloning dotfiles..."
  git clone "$REPO_URL" "$DOTFILES" || abort "Failed to clone dotfiles"
  ok "Cloned to $DOTFILES"
else
  ok "dotfiles already at $DOTFILES"
fi

# ── Step 3: Install oh-my-zsh ───────────────────────────────────────
info "Setting up oh-my-zsh..."
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  RUNZSH=no KEEP_ZSHRC=yes \
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" || warn "oh-my-zsh install had non-zero exit"
  ok "oh-my-zsh installed"
else
  ok "oh-my-zsh already installed"
fi

# ── Step 4: Install zsh plugins ─────────────────────────────────────
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
PLUGIN_DIR="$ZSH_CUSTOM/plugins"
mkdir -p "$PLUGIN_DIR"

install_zsh_plugin() {
  local name="$1"
  local repo="$2"
  local dest="$PLUGIN_DIR/$name"
  if [ -d "$dest" ]; then
    ok "Plugin $name already installed"
  else
    git clone --depth=1 "https://github.com/$repo.git" "$dest" && ok "Plugin $name installed" || warn "Failed to install $name"
  fi
}

info "Installing zsh plugins..."
install_zsh_plugin zsh-autosuggestions   zsh-users/zsh-autosuggestions
install_zsh_plugin zsh-syntax-highlighting zsh-users/zsh-syntax-highlighting
# zsh-autocomplete is heavy; only install if you really want it
# install_zsh_plugin zsh-autocomplete       marlonrichert/zsh-autocomplete

# ── Step 5: Install starship ────────────────────────────────────────
info "Setting up starship..."
if command -v starship &>/dev/null; then
  ok "starship already installed ($(starship --version 2>/dev/null || true))"
else
  if command -v brew &>/dev/null && [ "$OS" = macos ]; then
    brew install starship && ok "starship installed via brew"
  else
    curl -sS https://starship.rs/install.sh | sh -s -- -y && ok "starship installed via script"
  fi
fi

# ── Step 6: Symlink dotfiles ────────────────────────────────────────
info "Creating symlinks..."
cd "$DOTFILES"
bash "$DOTFILES/scripts/link.sh" && ok "Symlinks created" || warn "Some symlinks may have failed"

# ── Step 7: Set zsh as default shell ────────────────────────────────
info "Setting zsh as default shell..."
ZSH_BIN="$(command -v zsh)"
if [ "$SHELL" != "$ZSH_BIN" ]; then
  if [ "$OS" = linux ]; then
    sudo chsh -s "$ZSH_BIN" "$USER" && ok "Default shell changed to $ZSH_BIN"
  else
    chsh -s "$ZSH_BIN" && ok "Default shell changed to $ZSH_BIN"
  fi
else
  ok "zsh already the default shell"
fi

# ── Done ────────────────────────────────────────────────────────────
echo ""
printf "${GREEN}┌────────────────────────────────────────────┐${NC}\n"
printf "${GREEN}│${NC}         All done!                            ${GREEN}│${NC}\n"
printf "${GREEN}│${NC}   Start a new terminal or run:               ${GREEN}│${NC}\n"
printf "${GREEN}│${NC}     exec zsh -l                               ${GREEN}│${NC}\n"
printf "${GREEN}└────────────────────────────────────────────┘${NC}\n"
echo ""
