-- Add read column to admin_notifications if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.admin_notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add RLS policies for admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_notifications" ON public.admin_notifications;
CREATE POLICY "admin_read_notifications" ON public.admin_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_notifications" ON public.admin_notifications;
CREATE POLICY "admin_update_notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow service role to insert
DROP POLICY IF EXISTS "service_insert_notifications" ON public.admin_notifications;
CREATE POLICY "service_insert_notifications" ON public.admin_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);
