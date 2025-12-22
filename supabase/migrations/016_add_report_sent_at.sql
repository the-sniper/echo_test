-- Track when a tester was sent the session report
ALTER TABLE testers ADD COLUMN IF NOT EXISTS report_sent_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_testers_report_sent_at ON testers(report_sent_at);
