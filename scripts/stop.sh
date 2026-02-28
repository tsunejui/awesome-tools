#!/usr/bin/env bash
set -euo pipefail

PID=$1

if [ -f "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null; then
    kill "$(cat "$PID")" 2>/dev/null
    rm -f "$PID"
    echo "Stopped"
else
    rm -f "$PID"
    echo "Not running"
fi
