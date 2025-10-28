-- Migration: Convert likes to claps system (like Medium)
-- This allows users to clap up to 50 times per post

-- Add clap_count column to existing likes table
ALTER TABLE likes ADD COLUMN clap_count INTEGER DEFAULT 1;

-- Add updated_at column to track last clap time
ALTER TABLE likes ADD COLUMN updated_at INTEGER;

-- Update any existing likes to have clap_count = 1
UPDATE likes SET clap_count = 1 WHERE clap_count IS NULL;

