-- Add more tracking fields to profile_visits
ALTER TABLE public.profile_visits
ADD COLUMN referrer_url TEXT,
ADD COLUMN visitor_country TEXT,
ADD COLUMN visitor_city TEXT;

-- Create index for country/city queries
CREATE INDEX idx_profile_visits_country ON public.profile_visits(visitor_country);
CREATE INDEX idx_profile_visits_city ON public.profile_visits(visitor_city);