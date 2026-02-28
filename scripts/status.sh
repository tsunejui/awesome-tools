#!/usr/bin/env bash
set -euo pipefail

PID=$1
APP=${2:-}
LOG=${3:-}

if [ -f "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null; then
    echo "Running (PID $(cat "$PID"))"

    if [ -n "$LOG" ] && [ -f "$LOG" ]; then
        PORT=$(grep -oE 'localhost:[0-9]+' "$LOG" 2>/dev/null | head -1 | sed 's/localhost://')
        echo "  Server : http://localhost:${PORT:-3000}"
    fi

    if [ -n "$APP" ] && [ -f "$APP/.env" ]; then
        DB_URL=$(grep -E '^DATABASE_URL=' "$APP/.env" | head -1 | sed 's/^DATABASE_URL=//' | tr -d '"')
        DB_REL=${DB_URL#file:}
        if [ "$DB_REL" != "$DB_URL" ]; then
            PRISMA_DIR=$(cd "$APP/prisma" && pwd)
            DB_PATH="$PRISMA_DIR/${DB_REL#./}"
        else
            DB_PATH=$DB_URL
        fi
        if [ -n "$DB_PATH" ] && [ -f "$DB_PATH" ]; then
            echo "  DB     : $DB_PATH"
        else
            echo "  DB     : ${DB_PATH:-(not set)} (not found — run just migrate-up)"
        fi
    fi

    [ -n "$LOG" ] && echo "  Log    : $(cd "$(dirname "$LOG")" && pwd)/$(basename "$LOG")"
else
    rm -f "$PID"
    echo "Not running"
fi
