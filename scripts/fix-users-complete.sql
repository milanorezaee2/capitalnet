-- ══════════════════════════════════════════════════════════════════
-- FIX COMPLETE — رفع کامل مشکل نمایش کاربران در پنل ادمین
-- این فایل را کامل در Supabase Dashboard > SQL Editor اجرا کنید
-- ══════════════════════════════════════════════════════════════════

-- ── ۱. اضافه کردن ستون last_login_at (اگر وجود ندارد) ──────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- ── ۲. پاک کردن همه Policy های قدیمی جدول users ────────────────────────────
-- (از نو می‌سازیم تا هیچ تناقضی نباشد)
DROP POLICY IF EXISTS users_select_own       ON public.users;
DROP POLICY IF EXISTS users_insert_own       ON public.users;
DROP POLICY IF EXISTS users_update_own       ON public.users;
DROP POLICY IF EXISTS admin_users_all        ON public.users;
DROP POLICY IF EXISTS users_delete_own       ON public.users;
DROP POLICY IF EXISTS admin_users_select     ON public.users;
DROP POLICY IF EXISTS admin_users_insert     ON public.users;
DROP POLICY IF EXISTS admin_users_update     ON public.users;
DROP POLICY IF EXISTS admin_users_delete     ON public.users;

-- ── ۳. RLS فعال (اگر خاموش شده) ────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ── ۴. Policy های جدید و درست ──────────────────────────────────────────────

-- کاربر می‌تواند پروفایل خودش را ببیند
CREATE POLICY users_select_own
  ON public.users FOR SELECT
  TO authenticated
  USING ((auth.uid())::text = id);

-- کاربر می‌تواند پروفایل خودش را insert کند (برای upsert در لاگین)
CREATE POLICY users_insert_own
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid())::text = id);

-- کاربر می‌تواند پروفایل خودش را آپدیت کند
CREATE POLICY users_update_own
  ON public.users FOR UPDATE
  TO authenticated
  USING ((auth.uid())::text = id)
  WITH CHECK ((auth.uid())::text = id);

-- ادمین می‌تواند همه کاربران را ببیند (SELECT جداگانه با USING)
CREATE POLICY admin_users_select
  ON public.users FOR SELECT
  TO authenticated
  USING (is_admin());

-- ادمین می‌تواند کاربر اضافه کند
CREATE POLICY admin_users_insert
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ادمین می‌تواند هر کاربری را آپدیت کند
CREATE POLICY admin_users_update
  ON public.users FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ادمین می‌تواند کاربر حذف کند
CREATE POLICY admin_users_delete
  ON public.users FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── ۵. Trigger برای کپی خودکار از auth.users به public.users ───────────────
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── ۶. Import کاربران قدیمی که در auth.users هستند ولی در public.users نیستند
INSERT INTO public.users (id, email, full_name, phone, company_name, position, created_at)
SELECT
  id::text,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'phone',
  raw_user_meta_data->>'company_name',
  raw_user_meta_data->>'position',
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email        = EXCLUDED.email,
  full_name    = COALESCE(EXCLUDED.full_name,    public.users.full_name),
  phone        = COALESCE(EXCLUDED.phone,        public.users.phone),
  company_name = COALESCE(EXCLUDED.company_name, public.users.company_name),
  position     = COALESCE(EXCLUDED.position,     public.users.position);

-- ── ۷. تأیید نهایی ───────────────────────────────────────────────────────────
SELECT 'users in public.users:' AS info, COUNT(*) AS total FROM public.users;
SELECT 'users in auth.users:'   AS info, COUNT(*) AS total FROM auth.users;
