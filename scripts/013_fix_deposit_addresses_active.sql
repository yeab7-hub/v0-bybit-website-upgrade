-- Corrective migration for deposit_addresses.
-- Standardizes the active flag column name to `is_active` and widens the
-- admin management RLS policy to include super_admin. Safe to run repeatedly.

-- 1. Ensure the table exists (no-op if it already does).
CREATE TABLE IF NOT EXISTS deposit_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  memo TEXT,
  min_deposit NUMERIC DEFAULT 0,
  confirmations INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. If an older table used `active`, rename it to `is_active`.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deposit_addresses' AND column_name = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deposit_addresses' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE deposit_addresses RENAME COLUMN active TO is_active;
  END IF;
END $$;

-- 3. Guarantee the column exists even on partially-migrated tables.
ALTER TABLE deposit_addresses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Enable RLS (no-op if already enabled).
ALTER TABLE deposit_addresses ENABLE ROW LEVEL SECURITY;

-- 5. Public read of active addresses (needed by the user deposit page).
DROP POLICY IF EXISTS "Anyone can read active deposit addresses" ON deposit_addresses;
CREATE POLICY "Anyone can read active deposit addresses" ON deposit_addresses
  FOR SELECT USING (is_active = true);

-- 6. Admins AND super_admins can manage all rows.
DROP POLICY IF EXISTS "Admins can manage deposit addresses" ON deposit_addresses;
CREATE POLICY "Admins can manage deposit addresses" ON deposit_addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );
