-- Add monetization columns to company_profiles
ALTER TABLE public.company_profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMP WITH TIME ZONE;

-- Create index for faster sponsored queries
CREATE INDEX IF NOT EXISTS idx_company_profiles_sponsored ON public.company_profiles(is_sponsored, sponsored_until);

-- Create a table for simulated transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('premium', 'sponsored')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (
  company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- Users can create transactions for their own company
CREATE POLICY "Users can create transactions for their company"
ON public.transactions
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- Create index for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);