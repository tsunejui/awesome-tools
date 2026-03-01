#!/usr/bin/env bash
set -euo pipefail

APP=${1:-.}
VERSION=${2:-}

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

BACKUP_DIR="$APP/backups"

if [ -n "$VERSION" ]; then
    BACKUP="$BACKUP_DIR/$VERSION.db"
    if [ ! -f "$BACKUP" ]; then
        echo "Error: backup not found: $BACKUP" >&2
        exit 1
    fi
else
    # Pick the latest backup
    BACKUP=$(ls -t "$BACKUP_DIR"/*.db 2>/dev/null | head -1)
    if [ -z "$BACKUP" ]; then
        echo "No backups found in $BACKUP_DIR" >&2
        exit 1
    fi
    echo "Using latest: $(basename "$BACKUP" .db)"
fi

# Auto-backup current DB before restoring
if [ -f "$DB_PATH" ]; then
    mkdir -p "$BACKUP_DIR"
    PRE="$BACKUP_DIR/$(date +%Y%m%d-%H%M%S)-pre-restore.db"
    cp "$DB_PATH" "$PRE"
    echo "Current DB backed up to: $PRE"
fi

cp "$BACKUP" "$DB_PATH"
echo "Restored from: $(basename "$BACKUP" .db)"
