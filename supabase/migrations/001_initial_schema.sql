CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE session_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE note_category AS ENUM ('bug', 'feature', 'ux', 'performance', 'other');

CREATE TABLE sessions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(255) NOT NULL, build_version VARCHAR(100), status session_status NOT NULL DEFAULT 'draft', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ);
CREATE TABLE scenes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, order_index INTEGER NOT NULL DEFAULT 0);
CREATE TABLE testers (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, invite_token VARCHAR(50) NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE notes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE, tester_id UUID NOT NULL REFERENCES testers(id) ON DELETE CASCADE, audio_url TEXT, raw_transcript TEXT, edited_transcript TEXT, category note_category NOT NULL DEFAULT 'other', auto_classified BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

CREATE INDEX idx_scenes_session_id ON scenes(session_id);
CREATE INDEX idx_testers_session_id ON testers(session_id);
CREATE INDEX idx_testers_invite_token ON testers(invite_token);
CREATE INDEX idx_notes_session_id ON notes(session_id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON scenes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON testers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON notes FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Audio files accessible" ON storage.objects FOR SELECT USING (bucket_id = 'audio-recordings');
CREATE POLICY "Anyone can upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-recordings');
