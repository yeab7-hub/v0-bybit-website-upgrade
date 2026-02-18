-- Trade overrides table: allows admin to force win/loss on user trades
CREATE TABLE IF NOT EXISTS public.trade_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT,
  override_result TEXT NOT NULL CHECK (override_result IN ('win', 'loss')),
  override_pnl NUMERIC,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- Index for fast lookup during trade execution
CREATE INDEX IF NOT EXISTS idx_trade_overrides_active ON public.trade_overrides (user_id, active) WHERE active = true;

-- RLS
ALTER TABLE public.trade_overrides ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (admin API uses service role)
CREATE POLICY "Service role full access on trade_overrides"
  ON public.trade_overrides
  FOR ALL
  USING (true)
  WITH CHECK (true);
