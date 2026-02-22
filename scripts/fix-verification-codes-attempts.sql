-- Fix the verification_codes.attempts column to have a default value of 0
-- This prevents INSERT failures when attempts is not explicitly provided
ALTER TABLE public.verification_codes 
  ALTER COLUMN attempts SET DEFAULT 0;

-- Also ensure any existing NULL attempts are set to 0
UPDATE public.verification_codes 
  SET attempts = 0 
  WHERE attempts IS NULL;
