-- Add AI summary column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS ai_summary TEXT;
