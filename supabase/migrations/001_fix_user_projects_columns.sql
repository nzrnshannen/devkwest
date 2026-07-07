-- Fix: align user_projects with DevKwest app schema
-- Run this in Supabase → SQL Editor if you see:
--   "Could not find the 'career' column of 'user_projects' in the schema cache"
--
-- Safe to run multiple times (uses IF NOT EXISTS).

-- Ensure users table exists (required for foreign key)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_projects if missing entirely
CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  career TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  framework TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  project_title TEXT NOT NULL DEFAULT '',
  time_estimate TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  github_url TEXT,
  live_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any missing columns on an existing table
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS career TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS framework TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS project_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS project_title TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS time_estimate TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS live_url TEXT;
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.user_projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.user_projects
  DROP CONSTRAINT IF EXISTS user_projects_status_check;

ALTER TABLE public.user_projects
  ADD CONSTRAINT user_projects_status_check
  CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_status ON public.user_projects(status);
CREATE INDEX IF NOT EXISTS idx_user_projects_created_at ON public.user_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_user_projects_language ON public.user_projects(language);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_projects_updated_at ON public.user_projects;
CREATE TRIGGER set_user_projects_updated_at
  BEFORE UPDATE ON public.user_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own projects" ON public.user_projects;
CREATE POLICY "Users can view own projects"
  ON public.user_projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.user_projects;
CREATE POLICY "Users can insert own projects"
  ON public.user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.user_projects;
CREATE POLICY "Users can update own projects"
  ON public.user_projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.user_projects;
CREATE POLICY "Users can delete own projects"
  ON public.user_projects FOR DELETE USING (auth.uid() = user_id);

-- Refresh PostgREST schema cache (Supabase API)
NOTIFY pgrst, 'reload schema';
