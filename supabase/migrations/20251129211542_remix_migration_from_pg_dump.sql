CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: company_size; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.company_size AS ENUM (
    '1-10',
    '11-50',
    '51-250',
    '251-1000',
    '1000+'
);


--
-- Name: partnership_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.partnership_type AS ENUM (
    'supplier',
    'buyer',
    'cooperation',
    'service_provider',
    'service_seeker'
);


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_name text NOT NULL,
    description text,
    website text,
    country text NOT NULL,
    city text NOT NULL,
    industry text NOT NULL,
    company_size public.company_size NOT NULL,
    offers text[],
    seeks text[],
    partnership_types public.partnership_type[] DEFAULT ARRAY['supplier'::public.partnership_type] NOT NULL,
    logo_url text,
    verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    team_size integer,
    certificates text[],
    founding_year integer,
    annual_revenue_range text,
    portfolio_url text,
    verification_status text DEFAULT 'pending'::text,
    verification_badge_url text,
    CONSTRAINT company_profiles_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))
);


--
-- Name: connection_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connection_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_company_id uuid NOT NULL,
    to_company_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT connection_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id_1 uuid NOT NULL,
    company_id_2 uuid NOT NULL,
    match_score integer NOT NULL,
    match_reasons text[],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT matches_match_score_check CHECK (((match_score >= 0) AND (match_score <= 100)))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_company_id uuid NOT NULL,
    to_company_id uuid NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    file_url text,
    file_name text,
    file_type text,
    file_size integer
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false,
    related_company_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['match'::text, 'connection_request'::text, 'message'::text, 'verification'::text])))
);


--
-- Name: video_call_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_call_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id text NOT NULL,
    company_id_1 uuid NOT NULL,
    company_id_2 uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: company_profiles company_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_user_id_key UNIQUE (user_id);


--
-- Name: connection_requests connection_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connection_requests
    ADD CONSTRAINT connection_requests_pkey PRIMARY KEY (id);


--
-- Name: matches matches_company_id_1_company_id_2_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_company_id_1_company_id_2_key UNIQUE (company_id_1, company_id_2);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: video_call_sessions video_call_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_call_sessions
    ADD CONSTRAINT video_call_sessions_pkey PRIMARY KEY (id);


--
-- Name: video_call_sessions video_call_sessions_room_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_call_sessions
    ADD CONSTRAINT video_call_sessions_room_id_key UNIQUE (room_id);


--
-- Name: idx_company_profiles_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_profiles_country ON public.company_profiles USING btree (country);


--
-- Name: idx_company_profiles_industry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_profiles_industry ON public.company_profiles USING btree (industry);


--
-- Name: idx_company_profiles_partnership_types; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_profiles_partnership_types ON public.company_profiles USING gin (partnership_types);


--
-- Name: company_profiles set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: connection_requests update_connection_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_connection_requests_updated_at BEFORE UPDATE ON public.connection_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: messages update_messages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: company_profiles company_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: connection_requests connection_requests_from_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connection_requests
    ADD CONSTRAINT connection_requests_from_company_id_fkey FOREIGN KEY (from_company_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: connection_requests connection_requests_to_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connection_requests
    ADD CONSTRAINT connection_requests_to_company_id_fkey FOREIGN KEY (to_company_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: matches matches_company_id_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_company_id_1_fkey FOREIGN KEY (company_id_1) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: matches matches_company_id_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_company_id_2_fkey FOREIGN KEY (company_id_2) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: messages messages_from_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_from_company_id_fkey FOREIGN KEY (from_company_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: messages messages_to_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_to_company_id_fkey FOREIGN KEY (to_company_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: video_call_sessions video_call_sessions_company_id_1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_call_sessions
    ADD CONSTRAINT video_call_sessions_company_id_1_fkey FOREIGN KEY (company_id_1) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: video_call_sessions video_call_sessions_company_id_2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_call_sessions
    ADD CONSTRAINT video_call_sessions_company_id_2_fkey FOREIGN KEY (company_id_2) REFERENCES public.company_profiles(id) ON DELETE CASCADE;


--
-- Name: company_profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.company_profiles FOR SELECT TO authenticated USING (true);


--
-- Name: connection_requests Users can create connection requests from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create connection requests from their company" ON public.connection_requests FOR INSERT WITH CHECK ((from_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))));


--
-- Name: company_profiles Users can create their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own profile" ON public.company_profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: video_call_sessions Users can create video sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create video sessions" ON public.video_call_sessions FOR INSERT WITH CHECK ((company_id_1 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))));


--
-- Name: messages Users can send messages from their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages from their company" ON public.messages FOR INSERT WITH CHECK ((from_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))));


--
-- Name: connection_requests Users can update connection requests to their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update connection requests to their company" ON public.connection_requests FOR UPDATE USING ((to_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))));


--
-- Name: messages Users can update messages to their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update messages to their company" ON public.messages FOR UPDATE USING ((to_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: company_profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.company_profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: video_call_sessions Users can update their video sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their video sessions" ON public.video_call_sessions FOR UPDATE USING (((company_id_1 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))) OR (company_id_2 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid())))));


--
-- Name: connection_requests Users can view connection requests for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view connection requests for their company" ON public.connection_requests FOR SELECT USING (((from_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))) OR (to_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid())))));


--
-- Name: matches Users can view matches involving their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view matches involving their company" ON public.matches FOR SELECT USING (((company_id_1 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))) OR (company_id_2 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid())))));


--
-- Name: messages Users can view messages for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages for their company" ON public.messages FOR SELECT USING (((from_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))) OR (to_company_id IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid())))));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: video_call_sessions Users can view their video sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their video sessions" ON public.video_call_sessions FOR SELECT USING (((company_id_1 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid()))) OR (company_id_2 IN ( SELECT company_profiles.id
   FROM public.company_profiles
  WHERE (company_profiles.user_id = auth.uid())))));


--
-- Name: company_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: connection_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: video_call_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


