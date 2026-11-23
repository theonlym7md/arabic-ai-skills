#!/usr/bin/env sh
# Cross-platform wrapper forwarding to scripts/sweep.js
set -eu
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec node "$SCRIPT_DIR/sweep.js" "$@"
