-- Seed USDT balance for existing users who don't have one yet
INSERT INTO balances (user_id, asset, available, in_order)
SELECT p.id, 'USDT', 10000.00, 0
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM balances b WHERE b.user_id = p.id AND b.asset = 'USDT'
);

-- Add foreign key from support_tickets to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'support_tickets_user_id_fkey'
    AND table_name = 'support_tickets'
  ) THEN
    ALTER TABLE support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
