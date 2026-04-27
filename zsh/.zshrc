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

# ==================== System Path =================
export PATH="$HOME/.local/bin:$PATH"
export OLLAMA_MODELS=/Users/huahai/models/LLM/

# ==================== HomeBrew ====================
export HOMEBREW_AUTO_UPDATE_SECS=86400
export HOMEBREW_NO_ENV_HINTS=1

# ==================== PATH & Python ===============
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"

alias py='python3'
alias pip='python3 -m pip'
alias pycheck='python3 -m pip check'
alias pywhich='which -a python python3 pip pip3'

# ==================== Git =========================
alias gac='git add . && git commit -m "update"'
alias gup='git add . && git commit -m "update" && git push'
alias dotup='git -C ~/dotfiles add -A && git -C ~/dotfiles commit -m "update" && git -C ~/dotfiles push'

# ==================== Conda =======================
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

cen() {
  select env in $(conda env list | awk '{print $1}' | grep -v "#"); do
    conda activate "$env"
    break
  done
}

# ==================== code ai ==================
export PATH=/Users/huahai/.opencode/bin:$PATH

# ==================== LaTeX ====================
export LATEX_MAIN="main.tex"

texbuild() {
    local f="${1:-$LATEX_MAIN}"
    shift || true

    local name
    local outdir
    local exit_code

    name="$(basename "$f" .tex)"
    outdir="build/${name}"

    mkdir -p "$outdir"

    latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error \
        -output-directory="$outdir" "$f" "$@"
    exit_code=$?

    if [ "$exit_code" -eq 0 ]; then
        cp -f "${outdir}/${name}.pdf" "./${name}.pdf"
    else
        echo "Build failed. First real TeX errors:"
        grep -nE '^!|LaTeX Error|Undefined control sequence|Runaway argument|Emergency stop' \
            "${outdir}/${name}.log" | head -40
    fi

    return "$exit_code"
}

# =================== Private ====================
[ -f "$HOME/.zshrc.private" ] && source "$HOME/.zshrc.private"

[[ ":$PATH:" != *":$HOME/.config/kaku/zsh/bin:"* ]] && export PATH="$HOME/.config/kaku/zsh/bin:$PATH" # Kaku PATH Integration
[[ -f "$HOME/.config/kaku/zsh/kaku.zsh" ]] && source "$HOME/.config/kaku/zsh/kaku.zsh" # Kaku Shell Integration

alias rsync='rsync --exclude=.DS_Store --exclude=node_modules --exclude=.cache'
