-- Add join_code column to sessions for session-level joining
-- This replaces the individual tester invite tokens

-- Add the column
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_sessions_join_code ON sessions(join_code);

-- Generate join codes for existing sessions (6 char alphanumeric)
UPDATE sessions 
SET join_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE join_code IS NULL;

-- Make join_code NOT NULL for future inserts
ALTER TABLE sessions ALTER COLUMN join_code SET NOT NULL;
