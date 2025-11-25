#!/usr/bin/env zsh
# start-dev.command — Double-clickable macOS wrapper to launch start-dev.sh in Terminal
# This file is intended to be double-clicked in Finder. Terminal will open and run it.

# Resolve script directory robustly for zsh
SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Run the main start script (it now waits for user input before stopping the server)
if [ -x "./start-dev.sh" ]; then
  ./start-dev.sh
else
  echo "./start-dev.sh not found or not executable. You can run './start-dev.sh' or install Python 3 / use 'npx http-server -p 8000'."
  echo
  read -rk 1 "?Press any key to close this window..."
fi
