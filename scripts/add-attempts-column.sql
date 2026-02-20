-- Add attempts column to verification_codes table for brute-force protection
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0;
