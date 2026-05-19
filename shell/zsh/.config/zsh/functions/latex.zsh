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
