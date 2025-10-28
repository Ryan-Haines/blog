-- Blog Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  approved INTEGER DEFAULT 0, -- 0 = pending, 1 = approved, -1 = spam
  parent_id INTEGER, -- For nested replies (future feature)
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Index for faster queries by post
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Blog Post Likes Table
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(post_slug, ip_address) -- One like per IP per post
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_post_slug ON likes(post_slug);

-- Rate limiting table (simple spam prevention)
CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_address TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'comment' or 'like'
  created_at INTEGER NOT NULL
);

-- Index for rate limit cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);

