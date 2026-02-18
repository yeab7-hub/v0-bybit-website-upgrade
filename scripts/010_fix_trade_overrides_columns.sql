-- Fix trade_overrides table to have the columns the app code expects
-- The table currently has: override_result, override_pnl
-- The app code expects: forced_result, multiplier, active

-- Add forced_result if missing (rename override_result)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_overrides' AND column_name = 'override_result') THEN
    ALTER TABLE trade_overrides RENAME COLUMN override_result TO forced_result;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_overrides' AND column_name = 'forced_result') THEN
    ALTER TABLE trade_overrides ADD COLUMN forced_result text DEFAULT 'loss' CHECK (forced_result IN ('win', 'loss'));
  END IF;
END $$;

-- Add multiplier column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_overrides' AND column_name = 'multiplier') THEN
    ALTER TABLE trade_overrides ADD COLUMN multiplier numeric DEFAULT 1.0;
  END IF;
END $$;

-- Ensure active column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_overrides' AND column_name = 'active') THEN
    ALTER TABLE trade_overrides ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;

-- Drop override_pnl if it exists (replaced by multiplier)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trade_overrides' AND column_name = 'override_pnl') THEN
    ALTER TABLE trade_overrides DROP COLUMN override_pnl;
  END IF;
END $$;

-- Ensure RLS policy for admin-level insert via service role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trade_overrides' AND policyname = 'admin_overrides_all') THEN
    CREATE POLICY admin_overrides_all ON trade_overrides FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
