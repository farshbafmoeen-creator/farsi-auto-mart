#!/bin/bash
# Apply all SQL migrations to self-hosted Supabase database.
# Run from project root on the server.

set -euo pipefail

CONTAINER="${DB_CONTAINER:-supabase-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "❌ Container ${CONTAINER} not running. Start it with: cd selfhost && docker compose up -d"
  exit 1
fi

MIGRATIONS_DIR="supabase/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "❌ $MIGRATIONS_DIR not found"
  exit 1
fi

echo "→ Applying migrations to $CONTAINER..."
for f in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  echo "  • $(basename "$f")"
  docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$f"
done

echo "✅ All migrations applied"
