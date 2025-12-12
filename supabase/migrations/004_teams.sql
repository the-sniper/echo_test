-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_email ON team_members(email);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for MVP)
CREATE POLICY "Teams are viewable by everyone" ON teams
    FOR SELECT USING (true);

CREATE POLICY "Teams can be created by anyone" ON teams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Teams can be updated by anyone" ON teams
    FOR UPDATE USING (true);

CREATE POLICY "Teams can be deleted by anyone" ON teams
    FOR DELETE USING (true);

CREATE POLICY "Team members are viewable by everyone" ON team_members
    FOR SELECT USING (true);

CREATE POLICY "Team members can be created by anyone" ON team_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Team members can be updated by anyone" ON team_members
    FOR UPDATE USING (true);

CREATE POLICY "Team members can be deleted by anyone" ON team_members
    FOR DELETE USING (true);
