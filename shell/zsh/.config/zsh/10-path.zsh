path=(${path:#/opt/homebrew/bin} ${path:#/opt/homebrew/sbin})
path=(/opt/homebrew/bin /opt/homebrew/sbin "$HOME/.local/bin" $path)
typeset -U path PATH
export PATH
