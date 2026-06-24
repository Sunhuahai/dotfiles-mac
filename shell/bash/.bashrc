[ -f ~/.fzf.bash ] && source ~/.fzf.bash
. "$HOME/.cargo/env"

# >>> otty shell integration >>>
# Added by Otty — toggle in Settings > Shell > Shell Integration.
# Inert unless launched by Otty (it sets $OTTY_SHELL_INTEGRATION).
if [ -n "$OTTY_SHELL_INTEGRATION" ] && [ -r "$OTTY_SHELL_INTEGRATION/otty-integration.bash" ]; then
  . "$OTTY_SHELL_INTEGRATION/otty-integration.bash"
fi
# <<< otty shell integration <<<
