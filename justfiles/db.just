APP := "."

# ── Migration ──────────────────────────────────────────
# Apply pending migrations (creates new migration if schema changed)
migrate-up:
    npx prisma generate && npx prisma migrate dev

# Create a migration file without applying
migrate-create name="migration":
    npx prisma migrate dev --create-only --name {{name}}

# Reset DB: drop all data and re-apply migrations
migrate-reset:
    npx prisma migrate reset --force

# ── Data ───────────────────────────────────────────────
# Seed DB with example topic
db-seed:
    npx tsx prisma/seed.ts

# Delete all data from DB (auto-backups first, keeps schema + migrations)
db-clear:
    scripts/db-clear.sh {{APP}}

# ── Backup ────────────────────────────────────────────
# Backup current DB with timestamp
db-backup:
    scripts/db-backup.sh {{APP}}

# List all DB backups
db-backups:
    @ls -lh {{APP}}/backups/*.db 2>/dev/null || echo "No backups found."

# Restore DB from backup (latest by default, or specify version like 20260301-120000)
db-restore version="":
    scripts/db-restore.sh {{APP}} "{{version}}"

# ── Generate ──────────────────────────────────────────
# Generate README for a topic by name
generate topic:
    npx tsx scripts/generate-readme.ts "{{topic}}"
