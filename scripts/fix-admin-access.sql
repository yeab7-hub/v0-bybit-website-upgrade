-- Create a SECURITY DEFINER function to check admin role
-- This bypasses RLS so admin policies don't recurse on profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Now update ALL admin policies to use is_admin() instead of the sub-query

-- ============ PROFILES ============
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE
  USING (public.is_admin());

-- ============ BALANCES ============
DROP POLICY IF EXISTS "balances_admin_select" ON balances;
DROP POLICY IF EXISTS "admins_read_all_balances" ON balances;
CREATE POLICY "balances_admin_select" ON balances FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "balances_admin_update" ON balances;
DROP POLICY IF EXISTS "admins_update_all_balances" ON balances;
CREATE POLICY "balances_admin_update" ON balances FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_insert_balances" ON balances;
CREATE POLICY "balances_admin_insert" ON balances FOR INSERT
  WITH CHECK (public.is_admin());

-- ============ TRANSACTIONS ============
DROP POLICY IF EXISTS "transactions_admin_select" ON transactions;
DROP POLICY IF EXISTS "admins_read_all_transactions" ON transactions;
CREATE POLICY "transactions_admin_select" ON transactions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "transactions_admin_update" ON transactions;
DROP POLICY IF EXISTS "admins_update_all_transactions" ON transactions;
CREATE POLICY "transactions_admin_update" ON transactions FOR UPDATE
  USING (public.is_admin());

-- ============ ORDERS ============
DROP POLICY IF EXISTS "orders_admin_select" ON orders;
CREATE POLICY "orders_admin_select" ON orders FOR SELECT
  USING (public.is_admin());

-- ============ TRADES ============
DROP POLICY IF EXISTS "trades_admin_select" ON trades;
CREATE POLICY "trades_admin_select" ON trades FOR SELECT
  USING (public.is_admin());

-- ============ SUPPORT TICKETS ============
DROP POLICY IF EXISTS "tickets_admin_select" ON support_tickets;
CREATE POLICY "tickets_admin_select" ON support_tickets FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "tickets_admin_update" ON support_tickets;
CREATE POLICY "tickets_admin_update" ON support_tickets FOR UPDATE
  USING (public.is_admin());

-- ============ SUPPORT MESSAGES ============
DROP POLICY IF EXISTS "messages_admin_select" ON support_messages;
CREATE POLICY "messages_admin_select" ON support_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "messages_admin_insert" ON support_messages;
CREATE POLICY "messages_admin_insert" ON support_messages FOR INSERT
  WITH CHECK (public.is_admin());

-- ============ ACTIVITY LOGS ============
DROP POLICY IF EXISTS "activity_admin_select" ON activity_logs;
CREATE POLICY "activity_admin_select" ON activity_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "activity_admin_insert" ON activity_logs;
CREATE POLICY "activity_admin_insert" ON activity_logs FOR INSERT
  WITH CHECK (true);

-- ============ ADMIN NOTIFICATIONS ============
DROP POLICY IF EXISTS "admin_notifications_admin_all" ON admin_notifications;
DROP POLICY IF EXISTS "admin_read_notifications" ON admin_notifications;
DROP POLICY IF EXISTS "admin_update_notifications" ON admin_notifications;
CREATE POLICY "admin_notifications_select" ON admin_notifications FOR SELECT
  USING (public.is_admin());
CREATE POLICY "admin_notifications_update" ON admin_notifications FOR UPDATE
  USING (public.is_admin());

-- ============ DEPOSIT ADDRESSES ============
DROP POLICY IF EXISTS "Admins can manage deposit addresses" ON deposit_addresses;
CREATE POLICY "deposit_addresses_admin_all" ON deposit_addresses FOR ALL
  USING (public.is_admin());

-- ============ KYC DOCUMENTS ============
DROP POLICY IF EXISTS "kyc_docs_admin_select" ON kyc_documents;
CREATE POLICY "kyc_docs_admin_select" ON kyc_documents FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "kyc_docs_admin_update" ON kyc_documents;
CREATE POLICY "kyc_docs_admin_update" ON kyc_documents FOR UPDATE
  USING (public.is_admin());
