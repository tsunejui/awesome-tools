#!/usr/bin/env bash
set -euo pipefail

APP=${1:-.}

if [ ! -f "$APP/.env" ]; then
    echo "Error: $APP/.env not found" >&2
    exit 1
fi

DB_URL=$(grep -E '^DATABASE_URL=' "$APP/.env" | head -1 | sed 's/^DATABASE_URL=//' | tr -d '"')
DB_REL=${DB_URL#file:}
if [ "$DB_REL" != "$DB_URL" ]; then
    PRISMA_DIR=$(cd "$APP/prisma" && pwd)
    DB_PATH="$PRISMA_DIR/${DB_REL#./}"
else
    DB_PATH=$DB_URL
fi

if [ ! -f "$DB_PATH" ]; then
    echo "Error: DB not found at $DB_PATH" >&2
    exit 1
fi

BACKUP_DIR="$APP/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DEST="$BACKUP_DIR/$TIMESTAMP.db"

cp "$DB_PATH" "$DEST"

SIZE=$(ls -lh "$DEST" | awk '{print $5}')
echo "Backup created: $DEST ($SIZE)"
