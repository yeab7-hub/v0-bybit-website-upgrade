-- Drop existing policies first, then recreate
DO $$ BEGIN
  -- balances policies
  DROP POLICY IF EXISTS "balances_select_own" ON public.balances;
  DROP POLICY IF EXISTS "balances_insert_own" ON public.balances;
  DROP POLICY IF EXISTS "balances_update_own" ON public.balances;
  -- orders policies
  DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
  DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
  DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
  -- trades policies
  DROP POLICY IF EXISTS "trades_select_own" ON public.trades;
  DROP POLICY IF EXISTS "trades_insert_own" ON public.trades;
  -- support_tickets policies
  DROP POLICY IF EXISTS "tickets_select_own" ON public.support_tickets;
  DROP POLICY IF EXISTS "tickets_insert_own" ON public.support_tickets;
  DROP POLICY IF EXISTS "tickets_update_own" ON public.support_tickets;
  DROP POLICY IF EXISTS "tickets_admin_all" ON public.support_tickets;
  -- support_messages policies
  DROP POLICY IF EXISTS "messages_select_own" ON public.support_messages;
  DROP POLICY IF EXISTS "messages_insert_own" ON public.support_messages;
  DROP POLICY IF EXISTS "messages_admin_all" ON public.support_messages;
  DROP POLICY IF EXISTS "messages_admin_insert" ON public.support_messages;
END $$;

-- Create tables if not exist
CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  available NUMERIC(20,8) NOT NULL DEFAULT 0,
  locked NUMERIC(20,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, asset)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop-limit')),
  price NUMERIC(20,8),
  stop_price NUMERIC(20,8),
  amount NUMERIC(20,8) NOT NULL,
  filled NUMERIC(20,8) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'filled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  pair TEXT NOT NULL,
  side TEXT NOT NULL,
  price NUMERIC(20,8) NOT NULL,
  amount NUMERIC(20,8) NOT NULL,
  total NUMERIC(20,8) NOT NULL,
  fee NUMERIC(20,8) NOT NULL DEFAULT 0,
  pnl NUMERIC(20,8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Balances policies
CREATE POLICY "balances_select_own" ON public.balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "balances_insert_own" ON public.balances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "balances_update_own" ON public.balances FOR UPDATE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "trades_select_own" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trades_insert_own" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support tickets - users see own, admins see all
CREATE POLICY "tickets_select_own" ON public.support_tickets FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "tickets_insert_own" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_own" ON public.support_tickets FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Support messages - users see own ticket messages, admins see all
CREATE POLICY "messages_select_own" ON public.support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "messages_insert_own" ON public.support_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- Trigger to seed balances for new users
CREATE OR REPLACE FUNCTION public.seed_user_balances()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.balances (user_id, asset, available) VALUES
    (NEW.id, 'USDT', 10000),
    (NEW.id, 'BTC', 0),
    (NEW.id, 'ETH', 0),
    (NEW.id, 'SOL', 0),
    (NEW.id, 'XRP', 0),
    (NEW.id, 'DOGE', 0)
  ON CONFLICT (user_id, asset) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_seed_balances ON public.profiles;
CREATE TRIGGER on_profile_created_seed_balances
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_user_balances();
