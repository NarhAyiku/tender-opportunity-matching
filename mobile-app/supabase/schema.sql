-- TENDER Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,

  -- Resume/CV
  resume_url TEXT,
  resume_filename TEXT,

  -- Professional info (stored as JSONB)
  skills TEXT[] DEFAULT '{}',
  work_experiences JSONB DEFAULT '[]',
  education_entries JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  interests TEXT[] DEFAULT '{}',

  -- Social links
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,

  -- Job preferences (stored as JSONB for flexibility)
  preferences JSONB DEFAULT '{
    "desired_job_titles": [],
    "preferred_locations": [],
    "salary_min": null,
    "salary_max": null,
    "salary_currency": "USD",
    "job_levels": [],
    "work_arrangements": [],
    "opportunity_types": [],
    "preferred_industries": [],
    "company_sizes": []
  }',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. OPPORTUNITIES TABLE (Jobs/Internships)
-- ============================================
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  company_name TEXT,
  company_logo TEXT,
  location TEXT,

  -- Job details
  opportunity_type TEXT DEFAULT 'job', -- job, internship, scholarship, grant, contract
  work_arrangement TEXT DEFAULT 'onsite', -- remote, hybrid, onsite
  experience_level TEXT, -- entry, mid, senior, lead, executive
  education_level TEXT, -- high_school, associate, bachelor, master, phd

  -- Compensation
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'USD',
  salary_period TEXT DEFAULT 'year', -- hour, month, year

  -- Requirements
  required_skills TEXT[] DEFAULT '{}',
  industry TEXT,

  -- Application
  apply_url TEXT,
  apply_email TEXT,

  -- Source tracking
  source TEXT, -- jooble, adzuna, manual, recruiter
  external_id TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Everyone can read active opportunities
CREATE POLICY "Anyone can view active opportunities"
  ON public.opportunities FOR SELECT
  USING (is_active = true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON public.opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created ON public.opportunities(created_at DESC);

-- ============================================
-- 3. SWIPES TABLE (User interactions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- interested, skip, save

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one swipe per user per opportunity
  UNIQUE(user_id, opportunity_id)
);

-- Enable RLS
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own swipes
CREATE POLICY "Users can view their own swipes"
  ON public.swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swipes"
  ON public.swipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swipes"
  ON public.swipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_swipes_user ON public.swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_opportunity ON public.swipes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_swipes_action ON public.swipes(action);

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to opportunities
DROP TRIGGER IF EXISTS opportunities_updated_at ON public.opportunities;
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. ADD MISSING PROFILE COLUMNS (screening, uploads)
-- ============================================
DO $$
BEGIN
  -- Screening columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='screening_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN screening_completed BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='screening_completed_at') THEN
    ALTER TABLE public.profiles ADD COLUMN screening_completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='screening') THEN
    ALTER TABLE public.profiles ADD COLUMN screening JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='age') THEN
    ALTER TABLE public.profiles ADD COLUMN age INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='preferred_countries') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_countries TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='consent_share_documents') THEN
    ALTER TABLE public.profiles ADD COLUMN consent_share_documents BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='cv_filename') THEN
    ALTER TABLE public.profiles ADD COLUMN cv_filename TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='transcript_url') THEN
    ALTER TABLE public.profiles ADD COLUMN transcript_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='transcript_filename') THEN
    ALTER TABLE public.profiles ADD COLUMN transcript_filename TEXT;
  END IF;
END $$;

-- ============================================
-- 6. CONVERSATIONS TABLE (application tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'job',         -- job, internship, scholarship, grant
  status TEXT DEFAULT 'applied',   -- applied, viewed, shortlisted, interview, offer, rejected, hired
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, opportunity_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_opp ON public.conversations(opportunity_id);

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. CONVERSATION_EVENTS TABLE (timeline)
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  kind TEXT DEFAULT 'status_update',   -- status_update, message, system
  status TEXT,                          -- applied, viewed, shortlisted, etc.
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their conversations"
  ON public.conversation_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for their conversations"
  ON public.conversation_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_conv_events_conv ON public.conversation_events(conversation_id);

-- ============================================
-- 8. AUTO-CREATE CONVERSATION ON "interested" SWIPE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_interested_swipe()
RETURNS TRIGGER AS $$
DECLARE
  opp_type TEXT;
  conv_id UUID;
BEGIN
  -- Only act on "interested" swipes
  IF NEW.action <> 'interested' THEN
    RETURN NEW;
  END IF;

  -- Get opportunity type
  SELECT opportunity_type INTO opp_type
    FROM public.opportunities
    WHERE id = NEW.opportunity_id;

  -- Create conversation (ignore if duplicate)
  INSERT INTO public.conversations (user_id, opportunity_id, type, status, last_message_at)
  VALUES (NEW.user_id, NEW.opportunity_id, COALESCE(opp_type, 'job'), 'applied', NOW())
  ON CONFLICT (user_id, opportunity_id) DO NOTHING
  RETURNING id INTO conv_id;

  -- If conversation was created, add an "applied" event
  IF conv_id IS NOT NULL THEN
    INSERT INTO public.conversation_events (conversation_id, kind, status, message)
    VALUES (conv_id, 'status_update', 'applied', 'You applied to this opportunity');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_interested_swipe ON public.swipes;
CREATE TRIGGER on_interested_swipe
  AFTER INSERT ON public.swipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_interested_swipe();

-- ============================================
-- 9. STORAGE POLICIES (resumes & transcripts buckets)
-- ============================================
-- NOTE: You must manually create the storage buckets in the Supabase Dashboard:
--   Dashboard > Storage > New Bucket > "resumes" (private)
--   Dashboard > Storage > New Bucket > "transcripts" (private)
-- Then run the policies below.

-- Resumes bucket policies
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('transcripts', 'transcripts', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload their own resume"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own resume"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own resume"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own resume"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Transcripts bucket policies
CREATE POLICY "Users can upload their own transcript"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own transcript"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own transcript"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own transcript"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- DONE! Now seed some sample data
-- ============================================
