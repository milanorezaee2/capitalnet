-- ══════════════════════════════════════════════════════════════════
-- راه‌اندازی کامل پروژه جدید CapNet
-- این اسکریپت را در SQL Editor پروژه aufsubvolcbqbgdskyyf اجرا کنید
-- ══════════════════════════════════════════════════════════════════

-- ── ۱. جداول اصلی ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.roles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.admins (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  name          TEXT NOT NULL DEFAULT 'Admin',
  role_id       TEXT REFERENCES public.roles(id),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
  id            TEXT PRIMARY KEY,
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,
  company_name  TEXT,
  position      TEXT,
  industry      TEXT,
  website       TEXT,
  message       TEXT,
  password_hash TEXT,
  role_id       TEXT REFERENCES public.roles(id),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  auth_email    TEXT
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_type     TEXT,
  full_name        TEXT,
  email            TEXT,
  phone            TEXT,
  linkedin         TEXT,
  company_name     TEXT,
  sector           TEXT,
  stage            TEXT,
  capital_required TEXT,
  one_liner        TEXT,
  org_name         TEXT,
  ticket_size      TEXT,
  stage_pref       TEXT,
  geo_pref         TEXT,
  confidence       TEXT,
  message          TEXT,
  confirm_accuracy BOOLEAN NOT NULL DEFAULT false,
  deck_file        TEXT,
  reviewed         BOOLEAN NOT NULL DEFAULT false,
  notes            TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP,
  status           TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','in_review','approved','rejected')),
  admin_notes      TEXT DEFAULT '',
  deck_url         TEXT
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name   TEXT NOT NULL,
  email       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status      TEXT NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread','read','replied','archived')),
  admin_reply TEXT,
  replied_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug         TEXT UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  cover_image  TEXT,
  tags         TEXT[] DEFAULT ARRAY[]::TEXT[],
  category     TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP,
  author_name  TEXT NOT NULL DEFAULT 'تیم CapNet',
  author_role  TEXT NOT NULL DEFAULT 'تیم تحریریه',
  published_at TIMESTAMPTZ,
  read_time    TEXT NOT NULL DEFAULT '5 دقیقه',
  featured     BOOLEAN NOT NULL DEFAULT false,
  views        INTEGER NOT NULL DEFAULT 0,
  likes        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    TEXT REFERENCES public.users(id),
  admin_id   TEXT REFERENCES public.admins(id),
  status     TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  session_id TEXT,
  guest_name TEXT DEFAULT 'بازدیدکننده'
);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_session_id ON public.chat_rooms(session_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id     TEXT NOT NULL REFERENCES public.chat_rooms(id),
  sender_id   TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  message     TEXT NOT NULL DEFAULT '',
  attachment  JSONB,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'system',
  user_id    TEXT REFERENCES public.users(id),
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_ref  TEXT
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  company    TEXT,
  text       TEXT NOT NULL,
  avatar_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  page       TEXT NOT NULL,
  session_id TEXT,
  referrer   TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS public.site_content (
  id         TEXT PRIMARY KEY DEFAULT 'main',
  content    JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id    TEXT REFERENCES public.admins(id),
  action      TEXT NOT NULL,
  resource    TEXT NOT NULL,
  resource_id TEXT,
  details     JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.founder_submissions (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_type     TEXT,
  full_name        TEXT,
  email            TEXT,
  phone            TEXT,
  linkedin         TEXT,
  company_name     TEXT,
  sector           TEXT,
  stage            TEXT,
  capital_required TEXT,
  one_liner        TEXT,
  org_name         TEXT,
  ticket_size      TEXT,
  stage_pref       TEXT,
  geo_pref         TEXT,
  confidence       TEXT,
  message          TEXT,
  confirm_accuracy BOOLEAN NOT NULL DEFAULT false,
  deck_file        TEXT,
  reviewed         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── ۲. View لیدها ───────────────────────────────────────────────

CREATE OR REPLACE VIEW public.leads
  WITH (security_invoker = true)
AS
SELECT id, created_at::timestamptz AS created_at,
  profile_type, full_name, email, phone, linkedin,
  company_name, sector, stage, capital_required, one_liner,
  org_name, ticket_size, stage_pref, geo_pref, confidence,
  message, deck_url, status, admin_notes
FROM public.assessments;

-- ── ۳. تابع is_admin ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = auth.email() AND is_active = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- ── ۴. RLS فعال‌سازی ────────────────────────────────────────────

ALTER TABLE public.admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_submissions ENABLE ROW LEVEL SECURITY;

-- ── ۵. سیاست‌های RLS ────────────────────────────────────────────

-- admins
CREATE POLICY admin_read_admins      ON public.admins FOR SELECT TO authenticated USING (is_admin());

-- users
CREATE POLICY users_select_own       ON public.users FOR SELECT TO authenticated USING ((auth.uid())::text = id);
CREATE POLICY users_insert_own       ON public.users FOR INSERT TO authenticated WITH CHECK ((auth.uid())::text = id);
CREATE POLICY users_update_own       ON public.users FOR UPDATE TO authenticated USING ((auth.uid())::text = id);
CREATE POLICY admin_users_all        ON public.users FOR ALL    TO authenticated USING (is_admin());

-- roles
CREATE POLICY roles_public_read      ON public.roles FOR SELECT TO authenticated USING (true);

-- assessments
CREATE POLICY assessments_public_insert ON public.assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY assessments_select_own    ON public.assessments FOR SELECT TO authenticated USING (email = auth.email());
CREATE POLICY admin_assessments_all     ON public.assessments FOR ALL    TO authenticated USING (is_admin());

-- contact_messages
CREATE POLICY contact_public_insert  ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY contact_select_own     ON public.contact_messages FOR SELECT TO authenticated USING (email = auth.email());
CREATE POLICY admin_contact_all      ON public.contact_messages FOR ALL   TO authenticated USING (is_admin());

-- blog_posts
CREATE POLICY blog_public_read       ON public.blog_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY admin_blog_all         ON public.blog_posts FOR ALL    TO authenticated USING (is_admin());

-- chat_rooms
CREATE POLICY chat_rooms_insert      ON public.chat_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY chat_rooms_select_public ON public.chat_rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_chat_rooms_all   ON public.chat_rooms FOR ALL    TO authenticated USING (is_admin());

-- chat_messages
CREATE POLICY chat_messages_insert         ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY chat_messages_select_public  ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_chat_messages_all      ON public.chat_messages FOR ALL    TO authenticated USING (is_admin());

-- notifications
CREATE POLICY notifications_select_own   ON public.notifications FOR SELECT TO authenticated USING (user_id = (auth.uid())::text);
CREATE POLICY notifications_update_own   ON public.notifications FOR UPDATE TO authenticated USING (user_id = (auth.uid())::text);
CREATE POLICY admin_notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (is_admin());

-- site_settings
CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_site_settings_all   ON public.site_settings FOR ALL    TO authenticated USING (is_admin());

-- testimonials
CREATE POLICY testimonials_public_read  ON public.testimonials FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY admin_testimonials_all    ON public.testimonials FOR ALL    TO authenticated USING (is_admin());

-- page_views
CREATE POLICY page_views_public_insert  ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY admin_page_views_all      ON public.page_views FOR ALL    TO authenticated USING (is_admin());

-- site_content
CREATE POLICY site_content_public_read  ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY admin_site_content_all    ON public.site_content FOR ALL   TO authenticated USING (is_admin());

-- audit_logs
CREATE POLICY admin_audit_logs_all      ON public.audit_logs FOR ALL TO authenticated USING (is_admin());

-- founder_submissions
CREATE POLICY founder_submissions_public_insert ON public.founder_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY founder_submissions_select_own    ON public.founder_submissions FOR SELECT TO authenticated USING (email = auth.email());
CREATE POLICY admin_founder_submissions_all     ON public.founder_submissions FOR ALL   TO authenticated USING (is_admin());

-- ── ۶. Storage Buckets ──────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('pitch-decks', 'pitch-decks', true, 52428800,
   ARRAY['application/pdf','application/vnd.ms-powerpoint',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  ('blog-images',  'blog-images',  true, 10485760,
   ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'pitch-decks-public-read' AND tablename = 'objects') THEN
    CREATE POLICY "pitch-decks-public-read"   ON storage.objects FOR SELECT USING (bucket_id = 'pitch-decks');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'pitch-decks-public-upload' AND tablename = 'objects') THEN
    CREATE POLICY "pitch-decks-public-upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pitch-decks');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog-images-public-read' AND tablename = 'objects') THEN
    CREATE POLICY "blog-images-public-read"   ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blog-images-admin-upload' AND tablename = 'objects') THEN
    CREATE POLICY "blog-images-admin-upload"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');
  END IF;
END;
$$;

-- ── ۷. DB Trigger — کپی خودکار پروفایل از auth.users به public.users ──────
-- این Trigger در هر دو حالت (Email Confirmation فعال/غیرفعال) کار می‌کند:
--   • وقتی Email Confirmation غیرفعال است: بلافاصله بعد از signUp اجرا می‌شود
--   • وقتی Email Confirmation فعال است:   بعد از تأیید ایمیل و ورود اول اجرا می‌شود
-- این تریگر تضمین می‌کند که اطلاعات کاربر همیشه در public.users ثبت شود

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, company_name, position, created_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'position',
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    full_name    = COALESCE(EXCLUDED.full_name,    public.users.full_name),
    phone        = COALESCE(EXCLUDED.phone,        public.users.phone),
    company_name = COALESCE(EXCLUDED.company_name, public.users.company_name),
    position     = COALESCE(EXCLUDED.position,     public.users.position);
  RETURN NEW;
END;
$$;

-- Trigger روی auth.users — بعد از هر INSERT فعال می‌شود
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── ۸. ثبت ادمین اول ────────────────────────────────────────────
-- ⚠️ ایمیل ادمین را با ایمیل واقعی Supabase Auth خود جایگزین کنید

INSERT INTO public.admins (id, email, name, is_active)
VALUES (gen_random_uuid()::text, 'YOUR_ADMIN_EMAIL@gmail.com', 'Admin', true)
ON CONFLICT (email) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- پایان اسکریپت — اگر خطایی نداشت، همه چیز آماده است
-- ══════════════════════════════════════════════════════════════════
