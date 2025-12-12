-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE session_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE note_category AS ENUM ('bug', 'feature', 'ux', 'performance', 'other');

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    build_version VARCHAR(100),
    status session_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- Scenes table
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- Testers table
CREATE TABLE testers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    invite_token VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    tester_id UUID NOT NULL REFERENCES testers(id) ON DELETE CASCADE,
    audio_url TEXT,
    raw_transcript TEXT,
    edited_transcript TEXT,
    category note_category NOT NULL DEFAULT 'other',
    auto_classified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_scenes_session_id ON scenes(session_id);
CREATE INDEX idx_testers_session_id ON testers(session_id);
CREATE INDEX idx_testers_invite_token ON testers(invite_token);
CREATE INDEX idx_notes_session_id ON notes(session_id);
CREATE INDEX idx_notes_scene_id ON notes(scene_id);
CREATE INDEX idx_notes_tester_id ON notes(tester_id);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (simplified for MVP - no auth)
-- In production, these should be more restrictive

-- Sessions: Anyone can read, only authenticated admins can write
CREATE POLICY "Sessions are viewable by everyone" ON sessions
    FOR SELECT USING (true);

CREATE POLICY "Sessions can be created by anyone" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated by anyone" ON sessions
    FOR UPDATE USING (true);

-- Scenes: Follow session access
CREATE POLICY "Scenes are viewable by everyone" ON scenes
    FOR SELECT USING (true);

CREATE POLICY "Scenes can be created by anyone" ON scenes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Scenes can be updated by anyone" ON scenes
    FOR UPDATE USING (true);

CREATE POLICY "Scenes can be deleted by anyone" ON scenes
    FOR DELETE USING (true);

-- Testers: Can be created and read
CREATE POLICY "Testers are viewable by everyone" ON testers
    FOR SELECT USING (true);

CREATE POLICY "Testers can be created by anyone" ON testers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Testers can be updated by anyone" ON testers
    FOR UPDATE USING (true);

-- Notes: Follow session/tester access
CREATE POLICY "Notes are viewable by everyone" ON notes
    FOR SELECT USING (true);

CREATE POLICY "Notes can be created by anyone" ON notes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Notes can be updated by anyone" ON notes
    FOR UPDATE USING (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for audio bucket
CREATE POLICY "Audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-recordings');

CREATE POLICY "Anyone can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-recordings');
