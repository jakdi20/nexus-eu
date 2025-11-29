-- Create enum for company size
CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-250', '251-1000', '1000+');

-- Create enum for partnership types
CREATE TYPE partnership_type AS ENUM ('supplier', 'buyer', 'cooperation', 'service_provider', 'service_seeker');

-- Create company profiles table
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size company_size NOT NULL,
  offers TEXT[], -- Array of what they offer
  seeks TEXT[], -- Array of what they seek
  partnership_types partnership_type[] NOT NULL DEFAULT ARRAY['supplier']::partnership_type[],
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
ON public.company_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own profile"
ON public.company_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.company_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for searching
CREATE INDEX idx_company_profiles_industry ON public.company_profiles(industry);
CREATE INDEX idx_company_profiles_country ON public.company_profiles(country);
CREATE INDEX idx_company_profiles_partnership_types ON public.company_profiles USING GIN(partnership_types);