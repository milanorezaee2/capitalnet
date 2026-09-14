-- ══════════════════════════════════════════════════════════════════
-- FIX FINAL — رفع قطعی مشکل is_admin() و نمایش کاربران
-- این SQL را کامل در Supabase Dashboard > SQL Editor اجرا کنید
-- ══════════════════════════════════════════════════════════════════

-- ── ۱. بازنویسی is_admin() — بدون نیاز به auth.users ────────────────────────
-- مشکل قبلی: SECURITY DEFINER + search_path=public باعث میشد
-- auth.email() و auth schema در دسترس نباشد
-- راه‌حل: مستقیم از auth.uid() که همیشه کار میکنه استفاده میکنیم
-- و join با auth.users را حذف کردیم — فقط از jwt claim استفاده میکنیم

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins a
    JOIN auth.users u ON u.email = a.email
    WHERE u.id = auth.uid()
      AND a.is_active = true
  );
$$;

-- ── ۲. اجازه دسترسی به تابع ─────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ── ۳. تأیید — باید true برگردد اگر session ادمین فعال باشد ──────────────────
-- (با Role postgres این همیشه false است — نرمال است)
SELECT 
  auth.uid() AS current_uid,
  is_admin()  AS am_i_admin;
