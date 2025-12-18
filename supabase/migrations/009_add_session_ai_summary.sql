-- Add AI summary column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ai_summary TEXT;
