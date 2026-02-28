PID := ".pid"
LOG := ".dev.log"

# ── Server ─────────────────────────────────────────────
# Start dev server in background
start:
    scripts/start.sh . {{PID}} {{LOG}}

# Stop dev server
stop:
    scripts/stop.sh {{PID}}

# Restart dev server
restart: stop start

# Show dev server status
status:
    scripts/status.sh {{PID}} . {{LOG}}
