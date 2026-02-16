-- Add missing last_crawled_at column to customers (fix: column "last_crawled_at" does not exist)
-- Run in Neon Console: SQL Editor → paste → Run

ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_crawled_at timestamptz;
