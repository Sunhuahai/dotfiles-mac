# ~/.zshrc - interactive shell setup
ZSH_CONFIG_DIR="${ZSH_CONFIG_DIR:-$HOME/.config/zsh}"

for _zsh_config_file in "$ZSH_CONFIG_DIR"/rc.d/[0-9][0-9]-*.zsh(N); do
  [ -r "$_zsh_config_file" ] && source "$_zsh_config_file"
done

unset _zsh_config_file ZSH_CONFIG_DIR

# Kaku shell integration disabled; keep zsh interactive plugins minimal.
# [[ ":$PATH:" != *":$HOME/.config/kaku/zsh/bin:"* ]] && export PATH="$HOME/.config/kaku/zsh/bin:$PATH" # Kaku PATH Integration
# [[ -f "$HOME/.config/kaku/zsh/kaku.zsh" ]] && source "$HOME/.config/kaku/zsh/kaku.zsh" # Kaku Shell Integration

[[ ":$PATH:" != *":$HOME/.config/kaku/zsh/bin:"* ]] && export PATH="$HOME/.config/kaku/zsh/bin:$PATH" # Kaku PATH Integration
[[ -f "$HOME/.config/kaku/zsh/kaku.zsh" ]] && source "$HOME/.config/kaku/zsh/kaku.zsh" # Kaku Shell Integration
