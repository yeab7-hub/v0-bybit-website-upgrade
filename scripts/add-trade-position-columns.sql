-- Add position tracking columns to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS status text DEFAULT 'closed';
ALTER TABLE trades ADD COLUMN IF NOT EXISTS close_price numeric;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone;

-- Set all existing buy trades that don't have a corresponding sell as "open"
-- For now, mark all existing trades as "closed" (historical)
UPDATE trades SET status = 'closed' WHERE status IS NULL;

-- Create index for faster position lookups
CREATE INDEX IF NOT EXISTS idx_trades_user_status ON trades(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trades_user_pair_status ON trades(user_id, pair, status);
