// ─── Service Page — Editorial Layout ────────────────────────────────────────
import { useState, useEffect, useMemo } from 'react';
import { useLanguage, deepTranslate } from '@/i18n';
import InlineBannerRenderer from '../../../components/InlineBannerRenderer';
import type { InlineBanner } from '../../../lib/settingsApi';
import { useServiceSEO, useFAQSchema } from '../hooks';
import { Hero } from './sections/Hero';
import { Pricing } from './sections/Pricing';
import { Testimonials } from './sections/Testimonials';
import { FAQSection } from './sections/FAQSection';
import { Contact } from './sections/Contact';
import { NewsletterSection } from './sections/Newsletter';
import { GlobalEnhancements } from './ui/GlobalEnhancements';
import { CustomSectionRenderer } from './sections/CustomSectionRenderer';
import { ServicesOverview } from './sections/ServicesOverview';
import { loadServiceContent } from '../data/serviceContentStore';
import type { EnterpriseServicePageContent } from '../types/enterprise';

export interface ServicePageProps {
  onNavigate?: (page: string) => void;
  banners?: InlineBanner[];
}

// Fixed sections in page-order with position keys
// Positions: 0=hero, 10=pricing, 20=testimonials, 30=faq, 40=contact, 50=newsletter
// Custom sections can be inserted anywhere via their `position` value

export function ServicePage({ onNavigate, banners = [] }: ServicePageProps = {}) {
  const [rawContent, setContent] = useState<EnterpriseServicePageContent>(
    () => loadServiceContent()
  );
  const { lang } = useLanguage();

  // محتوای صفحهٔ خدمات به فارسی ذخیره شده؛ برای نسخهٔ انگلیسی در همین نقطه
  // ترجمهٔ عمیق اعمال می‌شود.
  const content = useMemo(() => deepTranslate(rawContent), [rawContent, lang]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'cn_enterprise_service_content_v1' || e.key === null) {
        setContent(loadServiceContent());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useServiceSEO({
    seo: {
      metaTitle: content.hero.title,
      metaDescription: content.hero.description,
      keywords: content.hero.trustBadges,
    },
    canonicalUrl: window.location.href,
  });

  useFAQSchema(content.faqs);

  const s = content.settings.sections;
  const customSections = (content.customSections ?? []).filter(cs => cs.enabled);

  // Helper: render custom sections whose position is between [from, to)
  const renderCustomBetween = (from: number, to: number) =>
    customSections
      .filter(cs => cs.position >= from && cs.position < to)
      .sort((a, b) => a.position - b.position)
      .map(cs => <CustomSectionRenderer key={cs.id} section={cs} />);

  return (
    <div className="min-h-screen bg-[#0d1829] text-white">
      <GlobalEnhancements />

      {/* ── 1. Hero ── */}
      <Hero content={content.hero} onNavigate={onNavigate} />
      <InlineBannerRenderer banners={banners} page="services" section="after-hero" />

      {/* Services Overview Section */}
      <ServicesOverview content={content.servicesOverview} />
      <InlineBannerRenderer banners={banners} page="services" section="after-cards" />

      {/* Custom sections before pricing (pos 0–9) */}
      {renderCustomBetween(0, 10)}

      {/* ── 2. Pricing ── */}
      {s.pricing && <Pricing plans={content.pricingPlans} />}

      {/* Custom sections after pricing (pos 10–19) */}
      {renderCustomBetween(10, 20)}

      {/* ── 3. Testimonials ── */}
      {s.testimonials && <Testimonials testimonials={content.testimonials} />}

      {/* Custom sections after testimonials (pos 20–29) */}
      {renderCustomBetween(20, 30)}

      {/* ── 4. FAQ ── */}
      {s.faq && <FAQSection faqs={content.faqs} />}

      {/* Custom sections after FAQ (pos 30–39) */}
      {renderCustomBetween(30, 40)}

      {/* ── 5. Contact ── */}
      {s.contact && <Contact cta={content.cta} contact={content.contact} />}

      {/* Custom sections after contact (pos 40–49) */}
      {renderCustomBetween(40, 50)}

      {/* ── 6. Newsletter ── */}
      {s.newsletter && <NewsletterSection newsletter={content.newsletter} />}

      {/* Custom sections after newsletter (pos 50+) */}
      {renderCustomBetween(50, Infinity)}
    </div>
  );
}
