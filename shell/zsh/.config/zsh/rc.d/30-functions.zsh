# Load shell functions from ~/.config/zsh/functions/
ZSH_FUNCTIONS_DIR="${ZSH_CONFIG_DIR:-$HOME/.config/zsh}/functions"

for _zsh_function_file in "$ZSH_FUNCTIONS_DIR"/*.zsh(N); do
  [ -r "$_zsh_function_file" ] && source "$_zsh_function_file"
done

unset _zsh_function_file ZSH_FUNCTIONS_DIR
