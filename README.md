# dotfiles

Personal shell and tool configuration for macOS.

## Managed here

- Shell: `zsh`, `bash`
- CLI tools: `git`, `tmux`, `starship`, `ghostty`, `yazi`, `fastfetch`
- Editors: `zed`, `lvim`
- App config: `kaku`
- Packages: `Brewfile`

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

