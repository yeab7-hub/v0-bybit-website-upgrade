-- Transactions table for deposits, withdrawals, and transfers with admin approval
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
  asset text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  fee numeric DEFAULT 0,
  network text,
  address text,
  tx_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);

-- RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY transactions_select_own ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions (deposit/withdrawal requests)
CREATE POLICY transactions_insert_own ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own pending transactions
CREATE POLICY transactions_update_own ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Admins can view all transactions
CREATE POLICY transactions_admin_select ON public.transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any transaction (approve/reject)
CREATE POLICY transactions_admin_update ON public.transactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
