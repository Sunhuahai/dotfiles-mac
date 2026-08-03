# dotfiles

Personal shell and tool configuration for macOS.

## Managed here

- `shell/`: `zsh`, `bash`
- `cli/`: `git`, `yazi`, `fastfetch`, `pi`
- `terminal/`: `tmux`, `starship`, `ghostty`
- `editors/`: `zed`, `lvim`, `kaku`
- `homebrew/`: `Brewfile`
- `scripts/`: install and maintenance helpers

Most package directories mirror the target path under `$HOME`. For example,
`cli/yazi/.config/yazi/yazi.toml` links to `~/.config/yazi/yazi.toml`.

## Pi Agent Layout

`cli/pi/.pi/agent/` tracks the reproducible Pi setup:

- five public prompt routers: `novel`, `paper`, `research`, `review`, and `syscare`
- private subagent definitions and their routing extensions
- the `PI AGENT` startup header, rounded status input frame, and quiet startup setting
- novel templates, validation tools, and shared workbench workflows

Machine-generated or sensitive Pi state remains local: `auth.json`, sessions,
model caches, package caches, and the Otty-managed integration extension.

## Zsh Layout

- `shell/zsh/.zshenv`: minimal environment loaded by every zsh process.
- `shell/zsh/.zprofile`: login shell entrypoint; loads `login.d/`.
- `shell/zsh/.zshrc`: interactive shell entrypoint; loads `rc.d/`.
- `shell/zsh/.config/zsh/login.d/`: login-only setup such as Homebrew and app paths.
- `shell/zsh/.config/zsh/rc.d/`: ordered interactive shell modules.
- `shell/zsh/.config/zsh/functions/`: function definitions loaded by `rc.d/30-functions.zsh`.

## Secrets

These stay out of git:

- `~/.zshrc.private`
- `~/.config/kaku/assistant.toml`
- `~/.config/rclone/rclone.conf`
- `~/.ssh/*`
- `~/.pi/agent/auth.json`

Examples are tracked where useful.

## Install (one-click)

From a fresh machine:

```sh
git clone git@github.com:huahai/dotfiles.git ~/dotfiles
bash ~/dotfiles/scripts/install.sh
```

Or, if you haven't cloned yet, the script will clone for you:

```sh
curl -fsSL https://raw.githubusercontent.com/huahai/dotfiles/main/scripts/install.sh | bash
```

The installer:
1. Installs base packages (zsh, git, curl, fzf, fd, rg, eza)
2. Clones dotfiles (if not already present)
3. Installs oh-my-zsh + plugins (zsh-autosuggestions, zsh-syntax-highlighting)
4. Installs starship prompt
5. Creates all symlinks via `link.sh`
6. Sets zsh as default shell

Works on **macOS** (Homebrew) and **Linux** (apt/dnf/pacman).

## Sync only (already have dependencies)

Run:

```sh
./scripts/link.sh
```

The script creates timestamped backups before replacing files with symlinks.
