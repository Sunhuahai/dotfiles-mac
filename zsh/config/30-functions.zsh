# Lazy conda initialization
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

# LaTeX build
texbuild() {
    local f="${1:-$LATEX_MAIN}"
    shift || true

    local name outdir exit_code

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
