# ~/.zshrc — loads modular config from ~/.config/zsh/
ZSH_CONFIG_DIR="$HOME/.config/zsh"
for file in "$ZSH_CONFIG_DIR"/[0-9][0-9]-*.zsh(N); do
  [ -r "$file" ] && source "$file"
done
unset file ZSH_CONFIG_DIR
