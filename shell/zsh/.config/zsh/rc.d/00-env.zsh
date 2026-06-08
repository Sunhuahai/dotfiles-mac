export EDITOR="nvim"
export VISUAL="nvim"
export LANG="en_US.UTF-8"
export LATEX_MAIN="main.tex"
# Homebrew — harmless if brew isn't installed
if command -v brew &>/dev/null || [ "$(uname -s)" = Darwin ]; then
  export HOMEBREW_AUTO_UPDATE_SECS=86400
  export HOMEBREW_NO_ENV_HINTS=1
fi
