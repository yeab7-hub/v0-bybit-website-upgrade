-- Drop the existing check constraint on role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Re-create it with super_admin included
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Now set the master admin
UPDATE profiles SET role = 'super_admin' WHERE email = 'yeabtenager7@gmail.com';
