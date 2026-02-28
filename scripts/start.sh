#!/usr/bin/env bash
set -euo pipefail

APP=$1
PID=$2
LOG=$3

if [ -f "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null; then
    echo "Already running (PID $(cat "$PID"))"
    exit 0
fi

(cd "$APP" && exec npx next dev) > "$LOG" 2>&1 &
echo $! > "$PID"

# Wait for Next.js to print the port
PORT=""
for i in $(seq 1 30); do
    if LINE=$(grep -oE 'localhost:[0-9]+' "$LOG" 2>/dev/null | head -1); then
        if [ -n "$LINE" ]; then
            PORT=${LINE#localhost:}
            break
        fi
    fi
    sleep 0.3
done

# Resolve DATABASE_URL to absolute path
DB_PATH=""
if [ -f "$APP/.env" ]; then
    DB_URL=$(grep -E '^DATABASE_URL=' "$APP/.env" | head -1 | sed 's/^DATABASE_URL=//' | tr -d '"')
    DB_REL=${DB_URL#file:}
    if [ "$DB_REL" != "$DB_URL" ]; then
        PRISMA_DIR=$(cd "$APP/prisma" && pwd)
        DB_PATH="$PRISMA_DIR/${DB_REL#./}"
    else
        DB_PATH=$DB_URL
    fi
fi

echo "Started (PID $(cat "$PID"))"
echo "  Server : http://localhost:${PORT:-3000}"
if [ -n "$DB_PATH" ] && [ -f "$DB_PATH" ]; then
    echo "  DB     : $DB_PATH"
else
    echo "  DB     : ${DB_PATH:-(not set)} (not found — run just migrate-up)"
fi
echo "  Log    : $(cd "$(dirname "$LOG")" && pwd)/$(basename "$LOG")"
