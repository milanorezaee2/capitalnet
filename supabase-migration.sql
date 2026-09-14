-- ============================================================
-- Capital Network — Supabase Migration
-- Paste this into: Supabase Dashboard > SQL Editor > New query
-- Then click "Run"
-- ============================================================

-- ============================================================
-- CHANGE 2: Add chat_enabled to site_settings
-- ============================================================
INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('chat_enabled', 'true', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = NOW();

-- ============================================================
-- CHANGE 4: Social network keys + active toggles
-- ============================================================
INSERT INTO public.site_settings (key, value, updated_at)
VALUES
  ('social_telegram',         '',      NOW()),
  ('social_whatsapp',         '',      NOW()),
  ('social_facebook',         '',      NOW()),
  ('social_tiktok',           '',      NOW()),
  ('social_github',           '',      NOW()),
  ('social_twitter_active',   'false', NOW()),
  ('social_linkedin_active',  'false', NOW()),
  ('social_instagram_active', 'false', NOW()),
  ('social_youtube_active',   'false', NOW()),
  ('social_telegram_active',  'false', NOW()),
  ('social_whatsapp_active',  'false', NOW()),
  ('social_facebook_active',  'false', NOW()),
  ('social_tiktok_active',    'false', NOW()),
  ('social_github_active',    'false', NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- CHANGE 6: Header and footer content fields
-- ============================================================
INSERT INTO public.site_settings (key, value, updated_at)
VALUES
  ('header_logo_url',        '',                         NOW()),
  ('header_site_name',       'Capital Network',          NOW()),
  ('header_cta_text',        'ثبت‌نام',                  NOW()),
  ('header_cta_url',         '/register',                NOW()),
  ('footer_copyright',       '© 1404 Capital Network',  NOW()),
  ('footer_description',     'حرفه‌ای‌ترین پلتفرم ارتباط سرمایه‌گذاران و استارتاپ‌ها', NOW()),
  ('footer_contact_email',   'invest@capitalnetwork.ir', NOW()),
  ('footer_contact_phone',   '+98 21 1234 5678',         NOW()),
  ('footer_contact_address', '',                         NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- OPTIONAL — CHANGE 1: Clean leads table
-- WARNING: Uncomment ONE of these only after taking a backup.
-- ============================================================

-- Option A: Delete all rows but keep table structure
-- TRUNCATE TABLE public.assessments;

-- Option B: Drop table completely
-- DROP TABLE IF EXISTS public.assessments CASCADE;

-- ============================================================
-- Verify: show all site_settings rows
-- ============================================================
SELECT key, value, updated_at
FROM public.site_settings
ORDER BY key;
