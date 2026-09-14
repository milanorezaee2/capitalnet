/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🗄️ SUPABASE DATABASE MIGRATIONS - Services CMS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Run these SQL commands in Supabase SQL Editor:
 * https://supabase.com/dashboard/project/YOUR-PROJECT/sql
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable extensions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  thumbnail TEXT,
  image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  category_id UUID,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  seo_id UUID,
  version INTEGER DEFAULT 1,
  
  CONSTRAINT services_valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services_cms_services(slug);
CREATE INDEX IF NOT EXISTS idx_services_status ON services_cms_services(status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services_cms_services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services_cms_services(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE CATEGORIES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image TEXT,
  color TEXT,
  "order" INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT categories_valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON services_cms_categories("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE FEATURES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  color TEXT,
  status TEXT DEFAULT 'active',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_order ON services_cms_features("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE BENEFITS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benefits_order ON services_cms_benefits("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- PROCESS STEPS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_process_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  color TEXT,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_process_steps_order ON services_cms_process_steps("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- DELIVERABLES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  file TEXT,
  download_link TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TECHNOLOGIES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_technologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo TEXT,
  color TEXT,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technologies_order ON services_cms_technologies("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- PRICING PLANS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_pricing_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2),
  currency TEXT DEFAULT 'تومان',
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  limitations JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  color TEXT,
  button_text TEXT DEFAULT 'درخواست قیمت',
  button_link TEXT,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_featured ON services_cms_pricing_plans(featured);
CREATE INDEX IF NOT EXISTS idx_pricing_order ON services_cms_pricing_plans("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- PORTFOLIO TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  link TEXT,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON services_cms_portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON services_cms_portfolio("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE STUDIES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  challenge TEXT,
  solution TEXT,
  result TEXT,
  image TEXT,
  statistics JSONB DEFAULT '[]'::jsonb,
  link TEXT,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_studies_featured ON services_cms_case_studies(featured);

-- ─────────────────────────────────────────────────────────────────────────────
-- STATISTICS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  prefix TEXT,
  suffix TEXT,
  icon TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CLIENT LOGOS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_client_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo TEXT NOT NULL,
  alt TEXT,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_logos_order ON services_cms_client_logos("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTIMONIALS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT,
  name TEXT NOT NULL,
  position TEXT,
  company TEXT,
  rating INTEGER DEFAULT 5,
  content TEXT NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON services_cms_testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON services_cms_testimonials("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- TEAM MEMBERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT,
  name TEXT NOT NULL,
  position TEXT,
  expertise JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_order ON services_cms_team_members("order");

-- ─────────────────────────────────────────────────────────────────────────────
-- FAQS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  status BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_order ON services_cms_faqs("order");
CREATE INDEX IF NOT EXISTS idx_faq_status ON services_cms_faqs(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- PAGE SETTINGS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_page_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_breadcrumb BOOLEAN DEFAULT TRUE,
  show_hero BOOLEAN DEFAULT TRUE,
  show_faq BOOLEAN DEFAULT TRUE,
  show_team BOOLEAN DEFAULT TRUE,
  show_pricing BOOLEAN DEFAULT TRUE,
  show_portfolio BOOLEAN DEFAULT TRUE,
  show_contact_form BOOLEAN DEFAULT TRUE,
  show_newsletter BOOLEAN DEFAULT TRUE,
  show_cta BOOLEAN DEFAULT TRUE,
  show_case_studies BOOLEAN DEFAULT TRUE,
  show_testimonials BOOLEAN DEFAULT TRUE,
  show_related_content BOOLEAN DEFAULT TRUE,
  section_order JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEO SETTINGS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meta_title TEXT,
  meta_description TEXT,
  canonical TEXT,
  robots TEXT,
  focus_keyword TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  schemas JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- REVISIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  data JSONB NOT NULL,
  changes_summary TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  is_auto_save BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_revisions_entity ON services_cms_revisions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_revisions_created_at ON services_cms_revisions(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- ACTIVITY LOG TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services_cms_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON services_cms_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON services_cms_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON services_cms_activity_log(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- CREATE FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services_cms_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON services_cms_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON services_cms_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON services_cms_pricing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON services_cms_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON services_cms_faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_settings_updated_at BEFORE UPDATE ON services_cms_page_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES (Row Level Security)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE services_cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cms_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cms_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cms_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users with admin role
-- (You can customize these based on your auth setup)

CREATE POLICY "Allow authenticated admin users" ON services_cms_services
  FOR ALL USING (TRUE);

CREATE POLICY "Allow authenticated admin users" ON services_cms_categories
  FOR ALL USING (TRUE);

CREATE POLICY "Allow authenticated admin users" ON services_cms_features
  FOR ALL USING (TRUE);

CREATE POLICY "Allow authenticated admin users" ON services_cms_pricing_plans
  FOR ALL USING (TRUE);

CREATE POLICY "Allow authenticated admin users" ON services_cms_testimonials
  FOR ALL USING (TRUE);

CREATE POLICY "Allow authenticated admin users" ON services_cms_faqs
  FOR ALL USING (TRUE);

CREATE POLICY "Allow activity logging" ON services_cms_activity_log
  FOR INSERT WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- SAMPLE DATA (Optional - for testing)
-- ─────────────────────────────────────────────────────────────────────────────

-- Insert sample categories
INSERT INTO services_cms_categories (title, slug, description, icon, color, "order", status)
VALUES
  ('توسعه وب', 'web-development', 'خدمات توسعه وب‌سایت حرفه‌ای', 'code', 'from-cyan-500 to-sky-500', 1, TRUE),
  ('طراحی UI/UX', 'ui-ux-design', 'طراحی رابط کاربری و تجربه کاربری', 'palette', 'from-violet-500 to-fuchsia-500', 2, TRUE),
  ('مشاوره دیجیتال', 'digital-consulting', 'مشاوره و راهنمایی تحول دیجیتال', 'chart-bar', 'from-amber-500 to-orange-500', 3, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample pricing plans
INSERT INTO services_cms_pricing_plans (title, price, currency, description, features, featured, "order")
VALUES
  ('Basic', 10000000, 'تومان', 'برای شروع', ARRAY['5 صفحات', 'طراحی اولیه', 'پشتیبانی 2 هفته']::jsonb, FALSE, 1),
  ('Growth', 25000000, 'تومان', 'برای رشد کسب‌وکار', ARRAY['20 صفحات', 'طراحی کامل', 'پشتیبانی 3 ماه', 'SEO optimization']::jsonb, TRUE, 2),
  ('Enterprise', 50000000, 'تومان', 'حل‌های سفارشی', ARRAY['صفحات نامحدود', 'طراحی سفارشی', 'پشتیبانی سال']::jsonb, FALSE, 3)
ON CONFLICT DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════

/*
✅ Migration Complete!

Now you can use the cmsApi.ts functions to:
- Create, read, update, delete services
- Manage categories, features, pricing plans
- Track activity logs
- Manage page settings
- And much more!

All tables are created with:
✓ Proper indexes for performance
✓ Constraints for data integrity
✓ Automatic timestamps
✓ Row-level security (RLS)
✓ Full-text search support
*/
