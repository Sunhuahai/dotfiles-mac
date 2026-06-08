# Cross-platform path setup
case "$(uname -s)" in
  Darwin)
    path=(${path:#/opt/homebrew/bin} ${path:#/opt/homebrew/sbin})
    path=(/opt/homebrew/bin /opt/homebrew/sbin "$HOME/.local/bin" $path)
    ;;
  Linux)
    # Linuxbrew (if installed)
    if [ -d /home/linuxbrew/.linuxbrew/bin ]; then
      path=(${path:#/home/linuxbrew/.linuxbrew/bin} ${path:#/home/linuxbrew/.linuxbrew/sbin})
      path=(/home/linuxbrew/.linuxbrew/bin /home/linuxbrew/.linuxbrew/sbin "$HOME/.local/bin" $path)
    else
      path=("$HOME/.local/bin" $path)
    fi
    ;;
esac
typeset -U path PATH
export PATH
