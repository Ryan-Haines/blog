#!/bin/bash

echo "Testing database directly..."
echo ""

# Check if local database exists
if [ -d ".wrangler/state/v3/d1" ]; then
  echo "✅ Local D1 database found"
else
  echo "❌ Local D1 database NOT found"
  echo "Run: wrangler d1 execute blog-db --file=./schema.sql"
  exit 1
fi

echo ""
echo "To view comments in the database, run:"
echo "  sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite 'SELECT * FROM comments'"
echo ""
echo "To view likes:"
echo "  sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite 'SELECT * FROM likes'"
echo ""
echo "To get stats:"
echo "  sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite 'SELECT approved, COUNT(*) as count FROM comments GROUP BY approved'"

