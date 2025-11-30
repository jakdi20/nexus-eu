-- Rename and restructure company_profiles table

-- Rename existing columns
ALTER TABLE company_profiles RENAME COLUMN city TO firmensitz;
ALTER TABLE company_profiles RENAME COLUMN company_description TO description;
ALTER TABLE company_profiles RENAME COLUMN looking_for TO seeks;

-- Change industry from array to single string (main industry)
ALTER TABLE company_profiles ALTER COLUMN industry TYPE text USING industry[1];

-- Add new columns
ALTER TABLE company_profiles ADD COLUMN legal_form text;
ALTER TABLE company_profiles ADD COLUMN contact_email text;
ALTER TABLE company_profiles ADD COLUMN contact_phone text;
ALTER TABLE company_profiles ADD COLUMN address text;

-- Drop columns that are no longer needed
ALTER TABLE company_profiles DROP COLUMN IF EXISTS slogan;
ALTER TABLE company_profiles DROP COLUMN IF EXISTS cooperation_type;

-- Update company_size enum if needed (keeping existing values for now)
-- The existing enum has: "1" | "2-10" | "11-50" | "51-250" | "250+"
-- This maps well to micro/small/medium/large concept