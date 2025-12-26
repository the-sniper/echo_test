-- Add left_at column to track when a tester leaves a session
ALTER TABLE testers ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_testers_left_at ON testers(left_at);
