#!/bin/bash

echo "🗑️  Resetting Local Database"
echo "=============================="
echo ""
echo "This will:"
echo "  - Delete all comments"
echo "  - Delete all likes"
echo "  - Delete all rate limits"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Finding local D1 database..."

# Find the SQLite database file
DB_PATH=$(find .wrangler/state/v3/d1 -name "*.sqlite" 2>/dev/null | head -n 1)

if [ -z "$DB_PATH" ]; then
  echo "❌ No local database found!"
  echo "Run: npm run dev"
  echo "Then try again."
  exit 1
fi

echo "✅ Found: $DB_PATH"
echo ""
echo "Deleting all data..."

# Delete all comments
sqlite3 "$DB_PATH" "DELETE FROM comments;"
COMMENTS_DELETED=$?

# Delete all likes  
sqlite3 "$DB_PATH" "DELETE FROM likes;"
LIKES_DELETED=$?

# Delete all rate limits
sqlite3 "$DB_PATH" "DELETE FROM rate_limits;"
RATE_LIMITS_DELETED=$?

if [ $COMMENTS_DELETED -eq 0 ] && [ $LIKES_DELETED -eq 0 ] && [ $RATE_LIMITS_DELETED -eq 0 ]; then
  echo ""
  echo "✅ Database reset complete!"
  echo ""
  echo "Verifying..."
  echo ""
  
  COMMENT_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM comments;")
  LIKE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM likes;")
  
  echo "Comments: $COMMENT_COUNT"
  echo "Likes: $LIKE_COUNT"
  echo ""
  
  if [ "$COMMENT_COUNT" -eq 0 ] && [ "$LIKE_COUNT" -eq 0 ]; then
    echo "✨ Database is clean! You can now test fresh."
    echo ""
    echo "Next steps:"
    echo "  1. Refresh your browser"
    echo "  2. Post a test comment"
    echo "  3. Check the admin panel"
  else
    echo "⚠️  Warning: Some data still exists"
  fi
else
  echo "❌ Error resetting database"
  exit 1
fi

