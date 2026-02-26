# ==================== Oh My Zsh ====================
export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME=""

plugins=(
  git
  zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh

# ==================== Starship ====================
eval "$(starship init zsh)"

# ==================== HomeBrew ====================
export HOMEBREW_AUTO_UPDATE_SECS=86400
export HOMEBREW_NO_ENV_HINTS=1

# ==================== PATH & Python ====================
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

# ==================== Git =======================
alias gup='git add . && git commit -m "update" && git push'

# ==================== Conda ====================
conda() {
    unset -f conda
    __conda_setup="$('/opt/homebrew/Caskroom/miniconda/base/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
    if [ $? -eq 0 ]; then
        eval "$__conda_setup"
    else
        if [ -f "/opt/homebrew/Caskroom/miniconda/base/etc/profile.d/conda.sh" ]; then
            . "/opt/homebrew/Caskroom/miniconda/base/etc/profile.d/conda.sh"
        else
            export PATH="/opt/homebrew/Caskroom/miniconda/base/bin:$PATH"
        fi
    fi
    unset __conda_setup
    conda "$@"
}

# ==================== System Path ==============
export PATH="$HOME/.local/bin:$PATH"

# ==================== FVM ======================
eval "$(fnm env --use-on-cd)"

# ==================== Kaku =====================
[[ -f "$HOME/.config/kaku/zsh/kaku.zsh" ]] && source "$HOME/.config/kaku/zsh/kaku.zsh" # Kaku Shell Integration

# ==================== LaTeX ====================
export LATEX_MAIN="main.tex"
texbuild() {
    local f="${1:-$LATEX_MAIN}"
    local base="${f%.tex}"
    mkdir -p build
    latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error -output-directory=build "$f" \
    && cp -f "build/${base}.pdf" "./${base}.pdf"
}
