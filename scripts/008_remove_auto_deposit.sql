-- Remove auto-deposit triggers that seed 10,000 USDT on signup
-- New users should start with 0 balances

DROP TRIGGER IF EXISTS on_profile_created_seed ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created_seed_balances ON public.profiles;

-- Replace the function with one that only creates zero-balance rows
CREATE OR REPLACE FUNCTION public.seed_user_balances()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.balances (user_id, asset, available, in_order)
  VALUES
    (NEW.id, 'USDT', 0, 0),
    (NEW.id, 'BTC', 0, 0),
    (NEW.id, 'ETH', 0, 0)
  ON CONFLICT (user_id, asset) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger with the zero-balance function
CREATE TRIGGER on_profile_created_seed_balances
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_user_balances();

-- Drop the old seed_demo_balances function if it exists
DROP FUNCTION IF EXISTS public.seed_demo_balances() CASCADE;
