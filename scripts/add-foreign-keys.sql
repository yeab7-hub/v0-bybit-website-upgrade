-- Add missing foreign key constraints so PostgREST joins work correctly
-- These are safe: they only add constraints if they don't already exist

DO $$
BEGIN
  -- transactions.user_id -> profiles.id (references auth.users via profiles)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'transactions' 
    AND constraint_name = 'transactions_user_id_fkey_profiles'
  ) THEN
    -- First check if the FK to auth.users exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' 
      AND table_name = 'transactions' 
      AND constraint_name = 'transactions_user_id_fkey'
    ) THEN
      ALTER TABLE public.transactions 
        ADD CONSTRAINT transactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- kyc_documents.user_id -> profiles.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'kyc_documents' 
    AND constraint_name = 'kyc_documents_user_id_fkey_profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' 
      AND table_name = 'kyc_documents' 
      AND constraint_name = 'kyc_documents_user_id_fkey'
    ) THEN
      ALTER TABLE public.kyc_documents 
        ADD CONSTRAINT kyc_documents_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;
