-- Add slogan field to company_profiles
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS slogan TEXT;