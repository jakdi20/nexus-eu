-- Create messages table for chat functionality
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  to_company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view messages where their company is sender or receiver
CREATE POLICY "Users can view messages for their company"
ON public.messages
FOR SELECT
USING (
  from_company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
  OR to_company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can send messages from their company
CREATE POLICY "Users can send messages from their company"
ON public.messages
FOR INSERT
WITH CHECK (
  from_company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can update messages to their company (mark as read)
CREATE POLICY "Users can update messages to their company"
ON public.messages
FOR UPDATE
USING (
  to_company_id IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;