# Python
alias py='python3'
alias pip='python3 -m pip'
alias pycheck='python3 -m pip check'
alias pywhich='which -a python python3 pip pip3'

# Git
alias gac='git add . && git commit -m "update"'
alias gup='git add . && git commit -m "update" && git push'
alias dotup='git -C ~/dotfiles add -A && git -C ~/dotfiles commit -m "update" && git -C ~/dotfiles push'

# rsync
alias rsync='rsync --exclude=.DS_Store --exclude=node_modules --exclude=.cache'

# Apps (macOS only)
if [ "$(uname -s)" = Darwin ] && [ -x '/Applications/Bear.app/Contents/MacOS/bearcli' ]; then
  alias bearcli='/Applications/Bear.app/Contents/MacOS/bearcli'
fi
