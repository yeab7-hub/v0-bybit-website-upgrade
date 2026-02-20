-- Create verification_codes table for numeric OTP verification
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('login', 'signup')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type ON verification_codes (email, type, used);

-- Auto-cleanup old codes (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes WHERE expires_at < NOW() OR (used = TRUE AND created_at < NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role)
CREATE POLICY "Service role full access" ON verification_codes
  FOR ALL USING (true) WITH CHECK (true);
