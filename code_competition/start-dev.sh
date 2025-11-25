#!/usr/bin/env zsh
# start-dev.sh — macOS / zsh version of start-dev.ps1
# Starts a local Python HTTP server serving the script's directory and opens the default browser.

PORT=8000

# Determine the script directory robustly for zsh/bash
if [ -n "$ZSH_VERSION" ]; then
  # zsh: ${(%):-%x} expands to the script path
  SCRIPT_DIR="$(cd "$(dirname "${(%):-%x}")" && pwd)"
else
  # fallback for bash/sh when invoked there
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

# Prefer python3, fall back to python
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Unable to find Python 3. Please install Python 3 or run 'npx http-server -p $PORT' (Node)."
  exit 1
fi

# Start the server in the background from the project directory
cd "$SCRIPT_DIR" || exit 1
# Before starting, stop any existing server listening on the same port to avoid duplicates
if command -v lsof >/dev/null 2>&1; then
  EXISTING_PIDS=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN || true)
  if [ -n "$EXISTING_PIDS" ]; then
    echo "Found existing server(s) on port $PORT: $EXISTING_PIDS. Stopping..."
    for pid in $EXISTING_PIDS; do
      kill "$pid" 2>/dev/null || true
    done
    # give them a moment to shut down gracefully
    sleep 1
    # if any remain, force kill
    REMAIN=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN || true)
    if [ -n "$REMAIN" ]; then
      echo "Forcing stop of remaining PIDs: $REMAIN"
      for pid in $REMAIN; do
        kill -9 "$pid" 2>/dev/null || true
      done
    fi
  fi
fi

# Start server in background and capture its PID
$PY -m http.server $PORT >/dev/null 2>&1 &
SERVER_PID=$!

# Give the server a moment to start
sleep 1

# Open the default browser on macOS; if 'open' is unavailable, print the URL
if command -v open >/dev/null 2>&1; then
  open "http://localhost:$PORT/index.html"
else
  echo "Server started. Open: http://localhost:$PORT/index.html"
fi

echo ""
echo "Python HTTP Server running on port $PORT (PID: $SERVER_PID)"
echo "Press any key to stop the server and close..."

# Wait for user input
read -k1 -s

# Stop the server
echo ""
echo "Stopping server (PID: $SERVER_PID)..."
if ps -p $SERVER_PID > /dev/null 2>&1; then
  kill $SERVER_PID 2>/dev/null
  sleep 1
  # Verify it stopped, force kill if necessary
  if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "Forcing server shutdown..."
    kill -9 $SERVER_PID 2>/dev/null
  fi
  echo "Server stopped."
else
  echo "Server was already stopped."
fi

# Double-check and cleanup any remaining processes on the port
if command -v lsof >/dev/null 2>&1; then
  REMAINING=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$REMAINING" ]; then
    echo "Cleaning up remaining processes on port $PORT: $REMAINING"
    for pid in $REMAINING; do
      kill -9 "$pid" 2>/dev/null || true
    done
  fi
fi

echo "Cleanup complete."
exit 0
