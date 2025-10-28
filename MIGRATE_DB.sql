-- Migration script to remove email field from existing comments
-- Run this if you already have comments in your database
-- This is optional - new comments just won't collect emails

-- Step 1: Backup existing comments table
DROP TABLE IF EXISTS comments_backup;
ALTER TABLE comments RENAME TO comments_backup;

-- Step 2: Create new comments table without email field
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

-- Step 3: Copy data from backup (excluding email column)
INSERT INTO comments (id, post_slug, author_name, content, created_at, ip_address, user_agent, approved, parent_id)
SELECT id, post_slug, author_name, content, created_at, ip_address, user_agent, approved, parent_id
FROM comments_backup;

-- Step 4: Recreate indexes (IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Step 5: Clean up backup (optional - uncomment if you want to remove backup)
-- DROP TABLE comments_backup;

-- Done! Your comments now don't have email field

