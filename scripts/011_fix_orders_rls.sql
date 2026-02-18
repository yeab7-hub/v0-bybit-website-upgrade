-- Fix RLS policies on orders table to allow authenticated users to create their own trades
-- Also ensure trades and balances tables have correct insert policies

-- Orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role bypass for admin operations
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
CREATE POLICY "Service role full access orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

-- Trades table
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access trades" ON public.trades;
CREATE POLICY "Service role full access trades" ON public.trades
  FOR ALL USING (auth.role() = 'service_role');

-- Balances table
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own balances" ON public.balances;
CREATE POLICY "Users can view own balances" ON public.balances
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access balances" ON public.balances;
CREATE POLICY "Service role full access balances" ON public.balances
  FOR ALL USING (auth.role() = 'service_role');
