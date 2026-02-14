-- Create deposit_addresses table for admin-managed wallet addresses
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

-- Create unique constraint on symbol + network
ALTER TABLE deposit_addresses DROP CONSTRAINT IF EXISTS deposit_addresses_symbol_network_key;
ALTER TABLE deposit_addresses ADD CONSTRAINT deposit_addresses_symbol_network_key UNIQUE (symbol, network);

-- Seed default addresses
INSERT INTO deposit_addresses (symbol, name, network, address, memo, min_deposit, confirmations) VALUES
  ('BTC', 'Bitcoin', 'Bitcoin', '167LPdGeuot8RbFDjvyzUPaNLkaad23UcN', NULL, 0.0001, 2),
  ('ETH', 'Ethereum', 'ERC20', '0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa', NULL, 0.001, 12),
  ('USDT', 'Tether', 'TRC20', 'TNhptVGH9BBDWQf37PMiqGX6zopKLySfEN', NULL, 1, 20),
  ('USDT', 'Tether', 'ERC20', '0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa', NULL, 1, 20),
  ('SOL', 'Solana', 'Solana', '46Ciw3Gzc1EcsV7mM3ut6LeBgfZMj6uGj4WFumgoiTGb', NULL, 0.01, 32),
  ('XRP', 'XRP', 'XRP', '167LPdGeuot8RbFDjvyzUPaNLkaad23UcN', 'Required', 1, 1),
  ('ADA', 'Cardano', 'Cardano', '167LPdGeuot8RbFDjvyzUPaNLkaad23UcN', NULL, 1, 15),
  ('BNB', 'BNB', 'BEP20', '0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa', NULL, 0.01, 15),
  ('DOGE', 'Dogecoin', 'Dogecoin', '167LPdGeuot8RbFDjvyzUPaNLkaad23UcN', NULL, 10, 6),
  ('AVAX', 'Avalanche', 'C-Chain', '0xd2aca02c90d3cd259b5e79f7ed000388a903f7aa', NULL, 0.1, 12)
ON CONFLICT (symbol, network) DO NOTHING;

-- Enable RLS
ALTER TABLE deposit_addresses ENABLE ROW LEVEL SECURITY;

-- Everyone can read active addresses (needed for wallet page)
DROP POLICY IF EXISTS "Anyone can read active deposit addresses" ON deposit_addresses;
CREATE POLICY "Anyone can read active deposit addresses" ON deposit_addresses
  FOR SELECT USING (is_active = true);

-- Only admins can insert/update/delete
DROP POLICY IF EXISTS "Admins can manage deposit addresses" ON deposit_addresses;
CREATE POLICY "Admins can manage deposit addresses" ON deposit_addresses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
