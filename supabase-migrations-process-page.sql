-- ============================================================================
-- Enterprise Process Page - Supabase Database Schema
-- Complete database structure for process page management
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- MAIN PROCESS PAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  locale VARCHAR(10) NOT NULL DEFAULT 'fa',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  seo_settings JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_locale CHECK (locale IN ('fa', 'en'))
);

-- Create index for faster lookups
CREATE INDEX idx_process_pages_slug ON process_pages(slug);
CREATE INDEX idxProcess_pages_locale ON process_pages(locale);
CREATE INDEX idx_process_pages_status ON process_pages(status);
CREATE INDEX idx_process_pages_published ON process_pages(published_at) WHERE status = 'published';

-- ============================================================================
-- HERO SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_hero (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 1,
  
  -- Badge
  badge_enabled BOOLEAN DEFAULT false,
  badge_text VARCHAR(100),
  badge_variant VARCHAR(20) DEFAULT 'primary',
  
  -- Content
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  
  -- CTAs
  primary_cta JSONB NOT NULL DEFAULT '{"text": "", "url": "", "variant": "primary", "size": "lg"}',
  secondary_cta JSONB,
  
  -- Media
  media_type VARCHAR(20) DEFAULT 'image',
  media_asset_id UUID,
  video_url TEXT,
  poster_image_id UUID,
  
  -- Statistics
  statistics_enabled BOOLEAN DEFAULT false,
  statistics JSONB,
  
  -- Trust indicators
  trust_indicators JSONB,
  
  -- Background
  background_type VARCHAR(20) DEFAULT 'gradient',
  background_value TEXT,
  background_overlay TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_hero_page ON process_hero(process_page_id);

-- ============================================================================
-- OVERVIEW SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_overview (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 2,
  
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT[],
  methodology TEXT,
  benefits TEXT[],
  value_proposition TEXT,
  
  media_asset_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_overview_page ON process_overview(process_page_id);

-- ============================================================================
-- TIMELINE SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 3,
  
  title TEXT NOT NULL,
  description TEXT,
  variant VARCHAR(20) DEFAULT 'vertical',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_timeline_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timeline_id UUID NOT NULL REFERENCES process_timeline(id) ON DELETE CASCADE,
  
  order_num INTEGER NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  
  icon VARCHAR(100),
  icon_type VARCHAR(20),
  image_id UUID,
  
  duration VARCHAR(50),
  duration_value INTEGER,
  
  outputs TEXT[],
  responsibilities TEXT[],
  
  status VARCHAR(20),
  dependencies UUID[],
  
  milestone BOOLEAN DEFAULT false,
  deliverables UUID[],
  team_roles UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_timeline_page ON process_timeline(process_page_id);
CREATE INDEX idx_process_timeline_steps_timeline ON process_timeline_steps(timeline_id);

-- ============================================================================
-- WORKFLOW SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_workflow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 4,
  
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'flowchart',
  layout VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_workflow_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES process_workflow(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  
  position JSONB NOT NULL, -- {x: number, y: number}
  style JSONB,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_workflow_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES process_workflow(id) ON DELETE CASCADE,
  
  from_node UUID NOT NULL,
  to_node UUID NOT NULL,
  
  label TEXT,
  type VARCHAR(20) DEFAULT 'solid',
  animated BOOLEAN DEFAULT false,
  condition TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_workflow_page ON process_workflow(process_page_id);
CREATE INDEX idx_process_workflow_nodes_workflow ON process_workflow_nodes(workflow_id);
CREATE INDEX idx_process_workflow_connections_workflow ON process_workflow_connections(workflow_id);

-- ============================================================================
-- DELIVERABLES SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 5,
  
  title TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_deliverable_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverables_id UUID NOT NULL REFERENCES process_deliverables(id) ON DELETE CASCADE,
  
  step_id UUID REFERENCES process_timeline_steps(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  format VARCHAR(50),
  quantity INTEGER,
  
  specifications TEXT[],
  
  preview_id UUID,
  download_url TEXT,
  
  included BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_deliverables_page ON process_deliverables(process_page_id);
CREATE INDEX idx_process_deliverable_items_deliverables ON process_deliverable_items(deliverables_id);

-- ============================================================================
-- TIMELINE SCHEDULE SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_timeline_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 6,
  
  title TEXT NOT NULL,
  description TEXT,
  
  total_duration VARCHAR(50),
  total_duration_value INTEGER,
  
  gantt_chart BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_timeline_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES process_timeline_schedule(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  
  duration VARCHAR(50),
  duration_value INTEGER,
  
  steps UUID[],
  dependencies UUID[],
  
  color VARCHAR(20),
  milestone BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_timeline_schedule_page ON process_timeline_schedule(process_page_id);
CREATE INDEX idx_process_timeline_phases_schedule ON process_timeline_phases(schedule_id);

-- ============================================================================
-- TEAM SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 7,
  
  title TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_team_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES process_team(id) ON DELETE CASCADE,
  
  step_id UUID REFERENCES process_timeline_steps(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  expertise TEXT[],
  
  avatar_id UUID,
  bio TEXT,
  responsibilities TEXT[],
  
  linkedin_url TEXT,
  email TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_team_page ON process_team(process_page_id);
CREATE INDEX idx_process_team_roles_team ON process_team_roles(team_id);

-- ============================================================================
-- TECHNOLOGIES SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_technologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 8,
  
  title TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_technology_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technologies_id UUID NOT NULL REFERENCES process_technologies(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_technology_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES process_technology_categories(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  version VARCHAR(50),
  
  icon VARCHAR(100),
  logo_id UUID,
  
  website TEXT,
  documentation_url TEXT,
  
  proficiency VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_technologies_page ON process_technologies(process_page_id);
CREATE INDEX idx_process_technology_categories_technologies ON process_technology_categories(technologies_id);
CREATE INDEX idx_process_technology_items_category ON process_technology_items(category_id);

-- ============================================================================
-- QUALITY ASSURANCE SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_quality_assurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 9,
  
  title TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_qa_processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qa_id UUID NOT NULL REFERENCES process_quality_assurance(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  
  tools TEXT[],
  standards TEXT[],
  frequency VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_quality_assurance_page ON process_quality_assurance(process_page_id);
CREATE INDEX idx_process_qa_processes_qa ON process_qa_processes(qa_id);

-- ============================================================================
-- STATISTICS SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 10,
  
  title TEXT NOT NULL,
  description TEXT,
  layout VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_statistic_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  statistics_id UUID NOT NULL REFERENCES process_statistics(id) ON DELETE CASCADE,
  
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  prefix VARCHAR(10),
  suffix VARCHAR(10),
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  animated BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_statistics_page ON process_statistics(process_page_id);
CREATE INDEX idx_process_statistic_items_statistics ON process_statistic_items(statistics_id);

-- ============================================================================
-- TESTIMONIALS SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 11,
  
  title TEXT NOT NULL,
  description TEXT,
  layout VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_testimonial_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  testimonials_id UUID NOT NULL REFERENCES process_testimonials(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  
  avatar_id UUID,
  rating INTEGER NOT NULL,
  max_rating INTEGER DEFAULT 5,
  
  text TEXT NOT NULL,
  project_type VARCHAR(100),
  date DATE,
  
  linkedin_url TEXT,
  website_url TEXT,
  
  featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_testimonials_page ON process_testimonials(process_page_id);
CREATE INDEX idx_process_testimonial_items_testimonials ON process_testimonial_items(testimonials_id);

-- ============================================================================
-- FAQ SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 12,
  
  title TEXT NOT NULL,
  description TEXT,
  layout VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID NOT NULL REFERENCES process_faq(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  order_num INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_faq_page ON process_faq(process_page_id);
CREATE INDEX idx_process_faq_items_faq ON process_faq_items(faq_id);

-- ============================================================================
-- CTA SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_cta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 13,
  
  variant VARCHAR(20) DEFAULT 'banner',
  title TEXT NOT NULL,
  description TEXT,
  
  primary_cta JSONB NOT NULL DEFAULT '{"text": "", "url": "", "variant": "primary", "size": "lg"}',
  secondary_cta JSONB,
  
  background JSONB,
  dismissible BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_cta_page ON process_cta(process_page_id);

-- ============================================================================
-- CONTACT SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_contact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 14,
  
  title TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_contact_form (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES process_contact(id) ON DELETE CASCADE,
  
  fields JSONB NOT NULL DEFAULT '[]',
  submit_button JSONB NOT NULL DEFAULT '{"text": "ارسال", "variant": "primary", "size": "lg"}',
  success_message TEXT DEFAULT 'فرم با موفقیت ارسال شد',
  error_message TEXT,
  privacy_policy TEXT,
  recaptcha_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_contact_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES process_contact(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon VARCHAR(100),
  link TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_contact_page ON process_contact(process_page_id);
CREATE INDEX idx_process_contact_form_contact ON process_contact_form(contact_id);
CREATE INDEX idx_process_contact_info_contact ON process_contact_info(contact_id);
CREATE INDEX idx_process_submissions_page ON process_submissions(process_page_id);

-- ============================================================================
-- RELATED SERVICES SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_related_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 15,
  
  title TEXT NOT NULL,
  description TEXT,
  max_items INTEGER DEFAULT 3,
  layout VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_related_services_page ON process_related_services(process_page_id);

-- ============================================================================
-- RELATED BLOG SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_related_blog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 16,
  
  title TEXT NOT NULL,
  description TEXT,
  max_items INTEGER DEFAULT 3,
  layout VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_related_content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to parent table (services or blog)
  parent_table VARCHAR(50) NOT NULL,
  parent_id UUID NOT NULL,
  
  type VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  
  image_id UUID,
  category VARCHAR(100),
  date DATE,
  read_time VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_related_blog_page ON process_related_blog(process_page_id);
CREATE INDEX idx_process_related_content_items_parent ON process_related_content_items(parent_table, parent_id);

-- ============================================================================
-- NEWSLETTER SECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_newsletter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_page_id UUID NOT NULL REFERENCES process_pages(id) ON DELETE CASCADE,
  
  enabled BOOLEAN DEFAULT true,
  order_num INTEGER DEFAULT 17,
  
  title TEXT NOT NULL,
  description TEXT,
  
  form JSONB NOT NULL DEFAULT '{"email_placeholder": "ایمیل خود را وارد کنید", "submit_button": {"text": "عضویت", "variant": "primary", "size": "lg"}, "success_message": "عضویت شما با موفقیت انجام شد", "privacy_policy": ""}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS process_social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newsletter_id UUID NOT NULL REFERENCES process_newsletter(id) ON DELETE CASCADE,
  
  platform VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(100),
  label TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  email TEXT NOT NULL UNIQUE,
  process_page_id UUID REFERENCES process_pages(id) ON DELETE SET NULL,
  
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_process_newsletter_page ON process_newsletter(process_page_id);
CREATE INDEX idx_process_social_links_newsletter ON process_social_links(newsletter_id);
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_active ON newsletter_subscriptions(active) WHERE active = true;

-- ============================================================================
-- MEDIA ASSETS TABLE (Shared across all sections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  url TEXT NOT NULL,
  alt TEXT,
  type VARCHAR(20) NOT NULL, -- image, video, icon, illustration
  
  width INTEGER,
  height INTEGER,
  mime_type VARCHAR(100),
  size BIGINT,
  
  optimized_url TEXT,
  webp_url TEXT,
  avif_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_assets_type ON media_assets(type);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_process_pages_updated_at BEFORE UPDATE ON process_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_hero_updated_at BEFORE UPDATE ON process_hero
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_overview_updated_at BEFORE UPDATE ON process_overview
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_timeline_updated_at BEFORE UPDATE ON process_timeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_timeline_steps_updated_at BEFORE UPDATE ON process_timeline_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_workflow_updated_at BEFORE UPDATE ON process_workflow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_workflow_nodes_updated_at BEFORE UPDATE ON process_workflow_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_deliverables_updated_at BEFORE UPDATE ON process_deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_deliverable_items_updated_at BEFORE UPDATE ON process_deliverable_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_timeline_schedule_updated_at BEFORE UPDATE ON process_timeline_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_timeline_phases_updated_at BEFORE UPDATE ON process_timeline_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_team_updated_at BEFORE UPDATE ON process_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_team_roles_updated_at BEFORE UPDATE ON process_team_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_technologies_updated_at BEFORE UPDATE ON process_technologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_technology_categories_updated_at BEFORE UPDATE ON process_technology_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_technology_items_updated_at BEFORE UPDATE ON process_technology_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_quality_assurance_updated_at BEFORE UPDATE ON process_quality_assurance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_qa_processes_updated_at BEFORE UPDATE ON process_qa_processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_statistics_updated_at BEFORE UPDATE ON process_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_statistic_items_updated_at BEFORE UPDATE ON process_statistic_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_testimonials_updated_at BEFORE UPDATE ON process_testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_testimonial_items_updated_at BEFORE UPDATE ON process_testimonial_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_faq_updated_at BEFORE UPDATE ON process_faq
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_faq_items_updated_at BEFORE UPDATE ON process_faq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_cta_updated_at BEFORE UPDATE ON process_cta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_contact_updated_at BEFORE UPDATE ON process_contact
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_contact_form_updated_at BEFORE UPDATE ON process_contact_form
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_related_services_updated_at BEFORE UPDATE ON process_related_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_related_blog_updated_at BEFORE UPDATE ON process_related_blog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_related_content_items_updated_at BEFORE UPDATE ON process_related_content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_newsletter_updated_at BEFORE UPDATE ON process_newsletter
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE process_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_timeline_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_workflow_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_deliverable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_timeline_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_technology_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_technology_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_quality_assurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_qa_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_statistic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_testimonial_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_cta ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_contact_form ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_related_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_related_blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_related_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Public read access for published pages
CREATE POLICY "Public read access for published process pages"
  ON process_pages FOR SELECT
  USING (status = 'published');

-- Public read access for all related tables through process_pages
CREATE POLICY "Public read access for hero"
  ON process_hero FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM process_pages WHERE process_pages.id = process_hero.process_page_id AND process_pages.status = 'published'
  ));

CREATE POLICY "Public read access for overview"
  ON process_overview FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM process_pages WHERE process_pages.id = process_overview.process_page_id AND process_pages.status = 'published'
  ));

-- Similar policies for all other tables would be added here
-- For brevity, showing the pattern - apply to all related tables

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE process_pages IS 'Main process pages table';
COMMENT ON TABLE process_hero IS 'Hero section for process pages';
COMMENT ON TABLE process_overview IS 'Overview section for process pages';
COMMENT ON TABLE process_timeline IS 'Timeline section for process pages';
COMMENT ON TABLE process_timeline_steps IS 'Individual timeline steps';
COMMENT ON TABLE process_workflow IS 'Workflow diagram section';
COMMENT ON TABLE process_workflow_nodes IS 'Workflow nodes';
COMMENT ON TABLE process_workflow_connections IS 'Workflow connections';
COMMENT ON TABLE process_deliverables IS 'Deliverables section';
COMMENT ON TABLE process_deliverable_items IS 'Individual deliverable items';
COMMENT ON TABLE process_timeline_schedule IS 'Timeline schedule section';
COMMENT ON TABLE process_timeline_phases IS 'Timeline phases';
COMMENT ON TABLE process_team IS 'Team section';
COMMENT ON TABLE process_team_roles IS 'Team member roles';
COMMENT ON TABLE process_technologies IS 'Technologies section';
COMMENT ON TABLE process_technology_categories IS 'Technology categories';
COMMENT ON TABLE process_technology_items IS 'Individual technology items';
COMMENT ON TABLE process_quality_assurance IS 'Quality assurance section';
COMMENT ON TABLE process_qa_processes IS 'QA processes';
COMMENT ON TABLE process_statistics IS 'Statistics section';
COMMENT ON TABLE process_statistic_items IS 'Statistic items';
COMMENT ON TABLE process_testimonials IS 'Testimonials section';
COMMENT ON TABLE process_testimonial_items IS 'Individual testimonials';
COMMENT ON TABLE process_faq IS 'FAQ section';
COMMENT ON TABLE process_faq_items IS 'FAQ items';
COMMENT ON TABLE process_cta IS 'CTA section';
COMMENT ON TABLE process_contact IS 'Contact section';
COMMENT ON TABLE process_contact_form IS 'Contact form configuration';
COMMENT ON TABLE process_contact_info IS 'Contact information items';
COMMENT ON TABLE process_submissions IS 'Form submissions';
COMMENT ON TABLE process_related_services IS 'Related services section';
COMMENT ON TABLE process_related_blog IS 'Related blog section';
COMMENT ON TABLE process_related_content_items IS 'Related content items';
COMMENT ON TABLE process_newsletter IS 'Newsletter section';
COMMENT ON TABLE process_social_links IS 'Social media links';
COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter subscriptions';
COMMENT ON TABLE media_assets IS 'Shared media assets table';
