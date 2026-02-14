CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  event TEXT NOT NULL,
  user_email TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  sent BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_notifications_admin_all" ON public.admin_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_notifications_service_insert" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);
