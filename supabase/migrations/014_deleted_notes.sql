-- Table to track deleted notes with reason and who deleted
CREATE TABLE deleted_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_note_id UUID NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    scene_id UUID,
    tester_id UUID,
    audio_url TEXT,
    raw_transcript TEXT,
    edited_transcript TEXT,
    category note_category NOT NULL,
    deletion_reason TEXT NOT NULL,
    deleted_by_admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    deleted_by_email VARCHAR(255),
    original_created_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by session
CREATE INDEX idx_deleted_notes_session_id ON deleted_notes(session_id);
CREATE INDEX idx_deleted_notes_deleted_at ON deleted_notes(deleted_at);
CREATE INDEX idx_deleted_notes_deleted_by ON deleted_notes(deleted_by_admin_id);

-- Enable Row Level Security
ALTER TABLE deleted_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Deleted notes are viewable by everyone" ON deleted_notes
    FOR SELECT USING (true);

CREATE POLICY "Deleted notes can be created by anyone" ON deleted_notes
    FOR INSERT WITH CHECK (true);
