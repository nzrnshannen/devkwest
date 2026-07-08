-- Soft delete support for user_projects
ALTER TABLE public.user_projects
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_projects_deleted_at
  ON public.user_projects(deleted_at);

NOTIFY pgrst, 'reload schema';
