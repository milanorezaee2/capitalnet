-- Migration: Create notifications table and RLS policies
-- Adjust jwt claim checks below to match your auth JWT claims if different

-- Ensure pgcrypto (or uuid-ossp) is available for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb,
  target_role text DEFAULT 'admin',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_target_role_idx ON public.notifications (target_role);

-- Enable row level security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: allow admins to SELECT notifications
-- Replace current_setting('jwt.claims.role', true) = 'admin' with your project's JWT claim if different
CREATE POLICY allow_admin_select ON public.notifications
  FOR SELECT
  USING (current_setting('jwt.claims.role', true) = 'admin');

-- Policy: allow authenticated users or server to INSERT notification records
-- This allows clients/server code to insert notifications. Adjust conditions as needed.
CREATE POLICY allow_insert_authenticated ON public.notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR current_setting('jwt.claims.role', true) = 'service');

-- Policy: allow admins to UPDATE (e.g., mark read)
CREATE POLICY allow_admin_update ON public.notifications
  FOR UPDATE
  USING (current_setting('jwt.claims.role', true) = 'admin')
  WITH CHECK (current_setting('jwt.claims.role', true) = 'admin');

-- Optional: allow admins to DELETE (if you want)
CREATE POLICY allow_admin_delete ON public.notifications
  FOR DELETE
  USING (current_setting('jwt.claims.role', true) = 'admin');

-- Notes:
-- 1) If your project encodes role in a different claim (e.g., "role" under jwt.claims or a custom key), replace the current_setting checks accordingly.
-- 2) If you want only server-side inserts, restrict INSERT to a service role or server-side function.
