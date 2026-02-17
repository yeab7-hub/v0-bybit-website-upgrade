-- Set the master admin role for yeabtenager7@gmail.com
UPDATE profiles
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'yeabtenager7@gmail.com';
