# OrbStack integration（环境相关）
source ~/.orbstack/shell/init.zsh 2>/dev/null || :

# Homebrew .NET
export DOTNET_ROOT="/opt/homebrew/opt/dotnet/libexec"
export PATH="/opt/homebrew/opt/dotnet/bin:$PATH"

# dotnet global tools
export PATH="$PATH:$HOME/.dotnet/tools"

# Added by Obsidian
export PATH="$PATH:/Applications/Obsidian.app/Contents/MacOS"

