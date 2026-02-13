-- Add document_data jsonb column and make file_url nullable
ALTER TABLE public.kyc_documents ADD COLUMN IF NOT EXISTS document_data JSONB;
ALTER TABLE public.kyc_documents ALTER COLUMN file_url DROP NOT NULL;
