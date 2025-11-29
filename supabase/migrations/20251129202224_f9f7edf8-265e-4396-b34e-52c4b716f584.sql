-- Add extended fields to company_profiles
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS team_size integer,
ADD COLUMN IF NOT EXISTS certificates text[],
ADD COLUMN IF NOT EXISTS founding_year integer,
ADD COLUMN IF NOT EXISTS annual_revenue_range text,
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_badge_url text;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('match', 'connection_request', 'message', 'verification')),
  title text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  related_company_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id_1 uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  company_id_2 uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  match_score integer NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons text[],
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id_1, company_id_2)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create connection_requests table
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  to_company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Users can view matches involving their company"
ON public.matches FOR SELECT
USING (
  company_id_1 IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
  OR company_id_2 IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for connection_requests
CREATE POLICY "Users can view connection requests for their company"
ON public.connection_requests FOR SELECT
USING (
  from_company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
  OR to_company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create connection requests from their company"
ON public.connection_requests FOR INSERT
WITH CHECK (from_company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update connection requests to their company"
ON public.connection_requests FOR UPDATE
USING (to_company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid()));

-- Trigger for connection_requests updated_at
CREATE TRIGGER update_connection_requests_updated_at
BEFORE UPDATE ON public.connection_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;