-- Promote the first registered user to admin
-- Run this AFTER you sign up with your first account
-- This makes the earliest-registered user an admin
UPDATE public.profiles
SET role = 'admin'
WHERE created_at = (
  SELECT MIN(created_at) FROM public.profiles
);
