# ~/.zprofile - login shell setup
ZSH_CONFIG_DIR="${ZSH_CONFIG_DIR:-$HOME/.config/zsh}"

for _zsh_login_file in "$ZSH_CONFIG_DIR"/login.d/[0-9][0-9]-*.zsh(N); do
  [ -r "$_zsh_login_file" ] && source "$_zsh_login_file"
done

unset _zsh_login_file ZSH_CONFIG_DIR
