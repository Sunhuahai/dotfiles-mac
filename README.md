# dotfiles

Personal shell and tool configuration for macOS.

## Managed here

- `shell/`: `zsh`, `bash`
- `cli/`: `git`, `yazi`, `fastfetch`
- `terminal/`: `tmux`, `starship`, `ghostty`
- `editors/`: `zed`, `lvim`, `kaku`
- `homebrew/`: `Brewfile`
- `scripts/`: install and maintenance helpers

Most package directories mirror the target path under `$HOME`. For example,
`cli/yazi/.config/yazi/yazi.toml` links to `~/.config/yazi/yazi.toml`.

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

Examples are tracked where useful.

## Sync

Run:

```sh
./scripts/link.sh
```

The script creates timestamped backups before replacing files with symlinks.
