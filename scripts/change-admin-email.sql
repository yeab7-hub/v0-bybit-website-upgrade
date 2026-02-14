-- Promote new admin email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'yeabtenager7@gmail.com';

-- Demote old admin (optional - keep as admin if you want both)
-- UPDATE public.profiles SET role = 'user' WHERE email = 'yeabsratenager2013@gmail.com';
