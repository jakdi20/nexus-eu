-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', false);

-- RLS policies for chat files
CREATE POLICY "Users can upload files to their conversations"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view files in their conversations"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-files'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR auth.uid()::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add file support to messages table
ALTER TABLE public.messages
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_size INTEGER;

-- Create video call sessions table
CREATE TABLE public.video_call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE,
  company_id_1 UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  company_id_2 UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their video sessions
CREATE POLICY "Users can view their video sessions"
ON public.video_call_sessions
FOR SELECT
USING (
  company_id_1 IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
  OR company_id_2 IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can create video sessions
CREATE POLICY "Users can create video sessions"
ON public.video_call_sessions
FOR INSERT
WITH CHECK (
  company_id_1 IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can update their video sessions
CREATE POLICY "Users can update their video sessions"
ON public.video_call_sessions
FOR UPDATE
USING (
  company_id_1 IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
  OR company_id_2 IN (
    SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
  )
);

-- Enable realtime for video sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_call_sessions;