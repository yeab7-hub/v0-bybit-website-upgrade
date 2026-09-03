-- Add Take Profit / Stop Loss thresholds to open positions.
-- Safe to re-run: uses IF NOT EXISTS.
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS take_profit numeric(20,8);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS stop_loss   numeric(20,8);

-- Records how a position was closed: 'manual', 'take_profit', 'stop_loss', or NULL for legacy rows.
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS close_reason text;

-- Speeds up the TP/SL monitor scan for positions that actually have thresholds set.
CREATE INDEX IF NOT EXISTS idx_trades_open_tpsl
  ON public.trades (user_id, status)
  WHERE status = 'open';
