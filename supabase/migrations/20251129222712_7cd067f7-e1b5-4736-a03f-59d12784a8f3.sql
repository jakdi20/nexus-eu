-- Update company_profiles table with new simplified structure
-- Drop old columns that are being replaced
ALTER TABLE company_profiles
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS partnership_types,
DROP COLUMN IF EXISTS offers,
DROP COLUMN IF EXISTS seeks,
DROP COLUMN IF EXISTS team_size,
DROP COLUMN IF EXISTS founding_year,
DROP COLUMN IF EXISTS portfolio_url,
DROP COLUMN IF EXISTS certificates,
DROP COLUMN IF EXISTS annual_revenue_range;

-- Add new simplified columns
ALTER TABLE company_profiles
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS offers TEXT,
ADD COLUMN IF NOT EXISTS looking_for TEXT,
ADD COLUMN IF NOT EXISTS cooperation_type TEXT[];

-- Add constraints
ALTER TABLE company_profiles
ADD CONSTRAINT company_description_length CHECK (char_length(company_description) <= 500);

-- Update industry column to support multi-select (array)
-- First, convert existing single values to array
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'company_profiles' 
    AND column_name = 'industry' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE company_profiles 
    ALTER COLUMN industry TYPE TEXT[] 
    USING ARRAY[industry]::TEXT[];
  END IF;
END $$;

-- Make sure industry is not null
ALTER TABLE company_profiles
ALTER COLUMN industry SET NOT NULL;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_industry ON company_profiles USING GIN(industry);
CREATE INDEX IF NOT EXISTS idx_company_profiles_cooperation_type ON company_profiles USING GIN(cooperation_type);
CREATE INDEX IF NOT EXISTS idx_company_profiles_country ON company_profiles(country);
CREATE INDEX IF NOT EXISTS idx_company_profiles_city ON company_profiles(city);