#!/bin/bash
# Apply the claps migration to local D1 database

echo "🔄 Applying claps migration to local database..."

# Run the migration
npx wrangler d1 execute DB --local --file=MIGRATE_TO_CLAPS.sql

echo "✅ Migration complete!"
echo ""
echo "Your likes table now supports claps (up to 50 per post)."
echo "Existing likes have been set to clap_count = 1."

