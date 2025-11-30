-- Make user_id nullable to allow mock companies without user accounts
ALTER TABLE company_profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow public viewing of all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON company_profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON company_profiles 
FOR SELECT 
USING (true);

-- Update insert policy to allow creating profiles without user_id
DROP POLICY IF EXISTS "Users can create their own profile" ON company_profiles;

CREATE POLICY "Users can create their own profile" 
ON company_profiles 
FOR INSERT 
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);

-- Update update policy to handle null user_id
DROP POLICY IF EXISTS "Users can update their own profile" ON company_profiles;

CREATE POLICY "Users can update their own profile" 
ON company_profiles 
FOR UPDATE 
USING (
  user_id IS NULL OR auth.uid() = user_id
);