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

# ── Generate ──────────────────────────────────────────
# Generate README for a topic by name
generate topic:
    npx tsx scripts/generate-readme.ts "{{topic}}"
