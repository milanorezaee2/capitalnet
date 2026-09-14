/**
 * ─── Integration Guide for Services Page with Admin Panel ────────────────────
 * 
 * این فایل راهنمای ادغام کامل صفحه خدمات با پنل مدیریت است.
 * 
 * مراحل:
 * 1. اضافه کردن فیلدها به settingsApi.ts
 * 2. اضافه کردن به AdminPanel
 * 3. استفاده از settings در ServicePage
 */

// ═════════════════════════════════════════════════════════════════════════════

// STEP 1: ADD TO settingsApi.ts (lib/settingsApi.ts)
// ─────────────────────────────────────────────────────────────────────────────

/*
// Add to SiteSettings interface:
export interface SiteSettings {
  // ... existing fields ...
  
  // Services Page - Hero
  services_hero_badge:    string;
  services_hero_eyebrow:  string;
  services_hero_title:    string;   // EXISTS ✓
  services_hero_desc:     string;   // EXISTS ✓
  
  // Services Page - Categories
  services_categories: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;     // 'sparkles' | 'layers' | 'code'
    accent: string;   // gradient class
  }>;
  
  // Services Page - Features
  services_features: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    accent: string;   // text color class
  }>;
  
  // Services Page - Process Steps
  services_process_steps: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  
  // Services Page - Pricing Plans
  services_pricing_plans: Array<{
    id: string;
    title: string;
    price: string;
    description: string;
    features: string[];
    limitations: string[];
    featured: boolean;
    ctaLabel: string;
  }>;
  
  // Services Page - Stats
  services_statistics: Array<{
    value: string;
    label: string;
  }>;
  
  // Services Page - Settings
  services_show_portfolio:     boolean;
  services_show_case_studies:  boolean;
  services_show_testimonials:  boolean;
  services_show_team:          boolean;
  services_show_faq:           boolean;
  services_show_related:       boolean;
}

// Add to DEFAULT_SETTINGS:
const D: SiteSettings = {
  // ... existing ...
  services_hero_badge: 'Enterprise Service System',
  services_hero_eyebrow: 'راهکارهای توسعه و رشد دیجیتال',
  services_categories: [
    { id: 'strategy', title: 'استراتژی دیجیتال', description: 'تدوین مسیر رشد', icon: 'sparkles', accent: 'from-cyan-500 to-sky-500' },
    { id: 'product', title: 'طراحی محصول', description: 'تجربه کاربری', icon: 'layers', accent: 'from-violet-500 to-fuchsia-500' },
    { id: 'engineering', title: 'توسعه فنی', description: 'سازگار با React', icon: 'code', accent: 'from-amber-500 to-orange-500' },
  ],
  // ... و بقیه ...
};
*/

// ═════════════════════════════════════════════════════════════════════════════

// STEP 2: CREATE ADMIN PANEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/*
// Add to components/admin/AdminPageContentPage.tsx

function AdminServicesPage() {
  const { settings, set, loading } = useSettings();
  
  return (
    <AdminPageContentPage>
      <div className="space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Services Page - Hero</h2>
          
          <Field
            label="Badge"
            value={settings.services_hero_badge}
            onChange={v => set('services_hero_badge', v)}
            placeholder="Enterprise Service System"
          />
          
          <Field
            label="Eyebrow"
            value={settings.services_hero_eyebrow}
            onChange={v => set('services_hero_eyebrow', v)}
            placeholder="راهکارهای توسعه و رشد دیجیتال"
          />
          
          {/* ... existing title and desc fields ... */}
        </div>
        
        {/* Categories Editor */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Service Categories</h2>
          
          <ServiceCategoriesEditor
            categories={settings.services_categories}
            onChange={v => set('services_categories', v)}
          />
        </div>
        
        {/* Features Editor */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Key Features</h2>
          
          <ServiceFeaturesEditor
            features={settings.services_features}
            onChange={v => set('services_features', v)}
          />
        </div>
        
        {/* Pricing Plans Editor */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Pricing Plans</h2>
          
          <ServicePricingEditor
            plans={settings.services_pricing_plans}
            onChange={v => set('services_pricing_plans', v)}
          />
        </div>
        
      </div>
    </AdminPageContentPage>
  );
}
*/

// ═════════════════════════════════════════════════════════════════════════════

// STEP 3: UPDATE SERVICE PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/*
// Update features/services/components/ServicePage.tsx

import { SiteSettings } from '@/lib/settingsApi';

interface ServicePageProps {
  settings: SiteSettings;
}

export function ServicePage({ settings }: ServicePageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(...)]">
      {/* Use settings.services_hero_badge instead of hardcoded */}
      <Badge label={settings.services_hero_badge} />
      
      {/* Use settings.services_categories */}
      <section>
        {settings.services_categories?.map(cat => (
          <ServiceCategoryCard key={cat.id} category={cat} />
        ))}
      </section>
      
      {/* Use settings.services_features */}
      <section>
        {settings.services_features?.map(feature => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </section>
      
      {/* Use settings.services_pricing_plans */}
      <section>
        {settings.services_pricing_plans?.map(plan => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </section>
      
      {/* Show/Hide sections based on settings */}
      {settings.services_show_portfolio && <PortfolioSection />}
      {settings.services_show_faq && <FAQSection />}
      
    </div>
  );
}

// In App.tsx, ServicesPage component:
function ServicesPage({ settings }: Props) {
  return <ServicePage settings={settings} />;
}
*/

// ═════════════════════════════════════════════════════════════════════════════

// HELPER COMPONENTS FOR ADMIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

/*
function ServiceCategoriesEditor({
  categories,
  onChange,
}: {
  categories: Array<{ id: string; title: string; ... }>;
  onChange: (cats: typeof categories) => void;
}) {
  return (
    <div className="space-y-3">
      {categories?.map((cat, idx) => (
        <div key={cat.id} className="border rounded-lg p-4 space-y-2">
          <input
            value={cat.title}
            onChange={e => {
              const newCats = [...categories];
              newCats[idx].title = e.target.value;
              onChange(newCats);
            }}
            placeholder="Category Title"
          />
          <input
            value={cat.description}
            onChange={e => {
              const newCats = [...categories];
              newCats[idx].description = e.target.value;
              onChange(newCats);
            }}
            placeholder="Category Description"
          />
          <select
            value={cat.icon}
            onChange={e => {
              const newCats = [...categories];
              newCats[idx].icon = e.target.value;
              onChange(newCats);
            }}
          >
            <option value="sparkles">Sparkles</option>
            <option value="layers">Layers</option>
            <option value="code">Code</option>
          </select>
        </div>
      ))}
    </div>
  );
}
*/

// ═════════════════════════════════════════════════════════════════════════════

// DATABASE SCHEMA (Supabase migration)
// ─────────────────────────────────────────────────────────────────────────────

/*
-- Add these columns to settings table if not exists

ALTER TABLE IF EXISTS public.settings
  ADD COLUMN IF NOT EXISTS services_hero_badge TEXT DEFAULT 'Enterprise Service System',
  ADD COLUMN IF NOT EXISTS services_hero_eyebrow TEXT DEFAULT 'راهکارهای توسعه و رشد دیجیتال',
  ADD COLUMN IF NOT EXISTS services_categories JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_process_steps JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_pricing_plans JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_statistics JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_show_portfolio BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS services_show_case_studies BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS services_show_testimonials BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS services_show_team BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS services_show_faq BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS services_show_related BOOLEAN DEFAULT true;
*/

// ═════════════════════════════════════════════════════════════════════════════

// CURRENT STATUS
// ─────────────────────────────────────────────────────────────────────────────

/*
✅ DONE:
  - ServicePage component structure
  - TypeScript types
  - Default content data
  - UI with all sections
  - Responsive design
  - Animations

⏳ TODO:
  - Add fields to settingsApi.ts
  - Create Admin Panel editors
  - Update ServicePage to use settings
  - Add database columns
  - Create Supabase migrations
  - Real-time sync with admin panel
  - Add to Admin UI (AdminPageContentPage.tsx)

🎯 NEXT STEP:
  See step-by-step implementation in comments above.
  Start with STEP 1: Add fields to settingsApi.ts
*/

// ═════════════════════════════════════════════════════════════════════════════

console.log('📘 Integration Guide Loaded');
console.log('See comments above for step-by-step implementation.');
