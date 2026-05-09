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
