// ─── Enterprise Service Page - Main Component ───────────────────────────────────────────
// Complete service page integrating all sections with modern design

import { useServiceSEO, useFAQSchema } from '../hooks';
import { Hero } from './sections/Hero';
import { Introduction } from './sections/Introduction';
import { ServicesOverview } from './sections/ServicesOverview';
import { Categories } from './sections/Categories';
import { Features } from './sections/Features';
import { Process } from './sections/Process';
import { Pricing } from './sections/Pricing';
import { Portfolio } from './sections/Portfolio';
import { CaseStudies } from './sections/CaseStudies';
import { Statistics } from './sections/Statistics';
import { ClientLogos } from './sections/ClientLogos';
import { Testimonials } from './sections/Testimonials';
import { Team } from './sections/Team';
import { FAQSection } from './sections/FAQSection';
import { Contact } from './sections/Contact';
import { Related } from './sections/Related';
import { NewsletterSection } from './sections/Newsletter';
import type { EnterpriseServicePageContent } from '../types/enterprise';

import { t } from '@/i18n';


export interface EnterpriseServicePageProps {
  content: EnterpriseServicePageContent;
  canonicalUrl?: string;
}

export const EnterpriseServicePage = ({ content, canonicalUrl }: EnterpriseServicePageProps) => {
  // Apply SEO - SEO would typically come from a service entity or page settings
  // For now, we'll use basic meta tags from the hero content
  useServiceSEO({
    seo: {
      metaTitle: content.hero.title,
      metaDescription: content.hero.description,
      keywords: content.hero.trustBadges,
    },
    canonicalUrl,
  });

  // Apply FAQ Schema
  useFAQSchema(content.faqs);

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.18),_transparent_45%),linear-gradient(180deg,#020617_0%,#06111f_100%)] text-white">
      {/* Hero Section */}
      <Hero content={content.hero} />

      {/* Introduction Section */}
      {content.settings.sections.introduction && (
        <Introduction content={content.introduction} />
      )}

      {/* Services Overview Section */}
      <ServicesOverview content={content.servicesOverview} />

      {/* Categories Section */}
      {content.settings.sections.categories && (
        <Categories categories={content.categories} />
      )}

      {/* Features Section */}
      {content.settings.sections.features && (
        <Features features={content.features} />
      )}

      {/* Benefits Section */}
      {content.settings.sections.benefits && (
        <section id="benefits" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-white md:text-4xl">{t("مزایای کلیدی")}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {t("چرا این خدمات برای شما مناسب است.")}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
              >
                <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                <p className="mt-2 text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      {content.settings.sections.whyChooseUs && (
        <section id="why-choose-us" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              {content.whyChooseUs.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {content.whyChooseUs.description}
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.whyChooseUs.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <span className={`rounded-full border border-white/10 px-3 py-1 text-sm font-semibold ${item.accent}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Process Section */}
      {content.settings.sections.process && <Process steps={content.process} />}

      {/* Deliverables Section */}
      {content.settings.sections.deliverables && (
        <section id="deliverables" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-white md:text-4xl">{t("خروجی‌ها")}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {t("آنچه در پایان پروژه دریافت می‌کنید.")}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.deliverables.map((deliverable) => (
              <div
                key={deliverable.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
              >
                <p className="text-lg font-semibold text-white">{deliverable.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technologies Section */}
      {content.settings.sections.technologies && (
        <section id="technologies" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-white md:text-4xl">{t("تکنولوژی‌ها")}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {t("ابزارها و فناوری‌های مورد استفاده.")}
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {content.technologies.map((tech) => (
              <span
                key={tech.id}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-white/20"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {content.settings.sections.pricing && <Pricing plans={content.pricingPlans} />}

      {/* Comparison Section */}
      {content.settings.sections.comparison && (
        <section id="comparison" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-white md:text-4xl">{t("مقایسه")}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {t("مقایسه پلن‌های مختلف.")}
            </p>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[600px] rounded-2xl border border-white/10 bg-white/5">
              <thead>
                <tr className="border-b border-white/10">
                  {content.comparison.columns.map((column) => (
                    <th key={column} className="px-6 py-4 text-end text-lg font-bold text-white">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.comparison.rows.map((row, index) => (
                  <tr key={index} className="border-b border-white/10 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">{row.label}</td>
                    {row.values.map((value, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 text-slate-300">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {content.settings.sections.portfolio && <Portfolio items={content.portfolio} />}

      {/* Case Studies Section */}
      {content.settings.sections.caseStudies && <CaseStudies studies={content.caseStudies} />}

      {/* Statistics Section */}
      {content.settings.sections.statistics && <Statistics stats={content.statistics} />}

      {/* Client Logos Section */}
      {content.settings.sections.clientLogos && <ClientLogos logos={content.clientLogos} />}

      {/* Testimonials Section */}
      {content.settings.sections.testimonials && <Testimonials testimonials={content.testimonials} />}

      {/* Team Section */}
      {content.settings.sections.team && <Team members={content.team} />}

      {/* FAQ Section */}
      {content.settings.sections.faq && <FAQSection faqs={content.faqs} />}

      {/* Contact & CTA Section */}
      {content.settings.sections.contact && <Contact cta={content.cta} contact={content.contact} />}

      {/* Related Content Section */}
      {content.settings.sections.relatedServices && (
        <Related services={content.relatedServices} blogPosts={content.relatedBlog} />
      )}

      {/* Newsletter Section */}
      {content.settings.sections.newsletter && <NewsletterSection newsletter={content.newsletter} />}
    </div>
  );
};
