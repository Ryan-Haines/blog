#!/bin/bash

echo "🔍 Checking Local Database..."
echo ""

DB_PATH=$(find .wrangler/state/v3/d1 -name "*.sqlite" 2>/dev/null | head -n 1)

if [ -z "$DB_PATH" ]; then
  echo "❌ No database found"
  exit 1
fi

echo "Database: $DB_PATH"
echo ""
echo "=== COMMENTS ==="
sqlite3 "$DB_PATH" "SELECT id, author_name, SUBSTR(content, 1, 30) as content, approved, created_at FROM comments;"
echo ""
echo "Comment counts by status:"
sqlite3 "$DB_PATH" "SELECT approved, COUNT(*) FROM comments GROUP BY approved;"
echo ""
echo "Total comments:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM comments;"
echo ""
echo "=== LIKES ==="
sqlite3 "$DB_PATH" "SELECT * FROM likes;"
echo ""
echo "Total likes:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM likes;"

