-- Safe migration script to remove email field from existing comments
-- Handles indexes properly

-- Step 1: Drop existing indexes on comments table
DROP INDEX IF EXISTS idx_comments_post_slug;
DROP INDEX IF EXISTS idx_comments_approved;
DROP INDEX IF EXISTS idx_comments_created_at;

-- Step 2: Backup existing comments table
DROP TABLE IF EXISTS comments_backup;
ALTER TABLE comments RENAME TO comments_backup;

-- Step 3: Create new comments table without email field
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  approved INTEGER DEFAULT 0,
  parent_id INTEGER,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Step 4: Copy data from backup (excluding email column)
INSERT INTO comments (id, post_slug, author_name, content, created_at, ip_address, user_agent, approved, parent_id)
SELECT id, post_slug, author_name, content, created_at, ip_address, user_agent, approved, parent_id
FROM comments_backup;

-- Step 5: Recreate indexes on new table
CREATE INDEX idx_comments_post_slug ON comments(post_slug);
CREATE INDEX idx_comments_approved ON comments(approved);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Step 6: Clean up backup (optional - uncomment if you want to remove backup)
-- DROP TABLE comments_backup;

-- Done! Your comments now don't have email field

