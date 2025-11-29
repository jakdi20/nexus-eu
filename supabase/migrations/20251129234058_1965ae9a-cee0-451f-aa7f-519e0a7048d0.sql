-- Create profile_visits table to track profile views
CREATE TABLE public.profile_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  visitor_company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visitor_ip TEXT
);

-- Enable RLS
ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;

-- Users can view visits to their own profile
CREATE POLICY "Users can view visits to their company profile"
ON public.profile_visits
FOR SELECT
USING (
  company_id IN (
    SELECT id FROM company_profiles WHERE user_id = auth.uid()
  )
);

-- Anyone can insert profile visits (for tracking)
CREATE POLICY "Anyone can record profile visits"
ON public.profile_visits
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_profile_visits_company_id ON public.profile_visits(company_id);
CREATE INDEX idx_profile_visits_visited_at ON public.profile_visits(visited_at);