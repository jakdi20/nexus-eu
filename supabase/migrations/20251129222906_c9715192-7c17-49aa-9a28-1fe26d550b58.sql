-- Update the company_size enum to match new values
-- Drop the old enum constraint and create new one
ALTER TABLE company_profiles
ALTER COLUMN company_size DROP DEFAULT;

-- Create new enum type with new values
DO $$
BEGIN
  -- Drop old enum if it exists
  DROP TYPE IF EXISTS company_size_new CASCADE;
  
  -- Create new enum
  CREATE TYPE company_size_new AS ENUM ('1', '2-10', '11-50', '51-250', '250+');
  
  -- Alter column to use new enum
  ALTER TABLE company_profiles 
  ALTER COLUMN company_size TYPE company_size_new 
  USING CASE 
    WHEN company_size::text = '1-10' THEN '2-10'::company_size_new
    WHEN company_size::text = '11-50' THEN '11-50'::company_size_new
    WHEN company_size::text = '51-250' THEN '51-250'::company_size_new
    WHEN company_size::text = '251-1000' THEN '250+'::company_size_new
    WHEN company_size::text = '1000+' THEN '250+'::company_size_new
    ELSE '11-50'::company_size_new
  END;
  
  -- Drop old enum type
  DROP TYPE IF EXISTS company_size CASCADE;
  
  -- Rename new type to old name
  ALTER TYPE company_size_new RENAME TO company_size;
  
  -- Set default
  ALTER TABLE company_profiles
  ALTER COLUMN company_size SET DEFAULT '11-50'::company_size;
END $$;