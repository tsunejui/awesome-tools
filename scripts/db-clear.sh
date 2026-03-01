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

# Auto-backup before clearing
scripts/db-backup.sh "$APP"

# Delete all data from user tables (keep _prisma_migrations)
TABLES=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma%' AND name NOT LIKE 'sqlite_%';")

if [ -z "$TABLES" ]; then
    echo "No user tables found."
    exit 0
fi

for TABLE in $TABLES; do
    sqlite3 "$DB_PATH" "DELETE FROM \"$TABLE\";"
done

echo "Cleared all data from: $TABLES"
