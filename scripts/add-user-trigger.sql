-- ══════════════════════════════════════════════════════════════════
-- اضافه کردن DB Trigger برای ثبت خودکار کاربران در public.users
-- این اسکریپت را در Supabase Dashboard > SQL Editor اجرا کنید
-- ══════════════════════════════════════════════════════════════════

-- ── تابع Trigger ───────────────────────────────────────────────────────────
-- هر بار که کاربر جدید در auth.users ایجاد می‌شود (signUp یا تأیید ایمیل)،
-- اطلاعاتش به public.users کپی می‌شود.
-- SECURITY DEFINER: با دسترسی سازنده اجرا می‌شود، RLS دور می‌زند (مجاز)

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

-- ── Trigger روی auth.users ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── تأیید ───────────────────────────────────────────────────────────────────
SELECT tgname, tgenabled
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE pg_class.relname = 'users'
  AND pg_class.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');
