-- Add user_id to team_members to link team members to user accounts
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
