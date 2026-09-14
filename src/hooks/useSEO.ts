// ─── useSEO Hook — Schema.org JSON-LD 2026 ────────────────────────────────────
// هر صفحه یک Schema.org اختصاصی، کامل، حرفه‌ای با بهترین الگوریتم‌های 2026
// اولویت: اگر seoPage از ادمین پنل وجود داشته باشد، آن مقادیر override می‌شوند

import { useEffect } from 'react';

import { t } from '@/i18n';


// ── Types ──────────────────────────────────────────────────────────────────────

/** اطلاعات زنده صفحه از settings (برای غنی‌سازی schema) */
export interface PageSchemaData {
  // Contact / Organization
  telephone?:     string;
  email?:         string;
  whatsapp?:      string;
  workingHours?:  string;
  address?:       string;
  // Social sameAs
  social_twitter?:   string;
  social_linkedin?:  string;
  social_instagram?: string;
  social_youtube?:   string;
  // About
  teamMembers?: Array<{ name: string; role: string; bio?: string; avatar?: string }>;
  missionText?:    string;
  experienceText?: string;
  valuesText?:     string;
  storyTitle?:     string;
  storyDesc?:      string;
  // Services
  servicesCards?: Array<{ title: string; desc: string; features: string[] }>;
  servicesHighlights?: Array<{ value: string; label: string }>;
  // Process
  processSteps?: Array<{ title: string; text: string }>;
  avgDays?: string;
  // FAQ
  faqItems?: Array<{ q: string; a: string }>;
}

interface SEOOptions {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  author?: string;
  /** کلید صفحه: home | services | process | about | contact | evaluation */
  pageKey?: 'home' | 'services' | 'process' | 'about' | 'contact' | 'evaluation' | 'blog';
  /** اطلاعات زنده صفحه از settings برای غنی‌سازی schema */
  pageData?: PageSchemaData;
  /** داده‌های SEO از settings.seo_pages[pageKey] — اگر موجود باشد اولویت دارد */
  seoPage?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical?: string;
    robots?: string;
    noindex?: boolean;
    keywords?: string;
    schema_type?: string;
    schema_name?: string;
    schema_description?: string;
    schema_image?: string;
    schema_telephone?: string;
    schema_email?: string;
    schema_address?: string;
    schema_service_type?: string;
    schema_price_range?: string;
    schema_area_served?: string;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SITE_NAME    = 'Capital Network';
const SITE_TITLE   = 'CapNet | Capital Network';
const BASE_URL     = 'https://capitalnetwork.ir';
const LOGO_URL     = `${BASE_URL}/logo.svg`;
const DEFAULT_IMG  = `${BASE_URL}/og-image.png`;
const DEFAULT_DESC = 'شریک استراتژیک شما در مسیر جذب سرمایه — آماده‌سازی استارتاپ‌ها برای VC از Seed تا Series B';
const LANG         = 'fa-IR';

// ── DOM Helpers ───────────────────────────────────────────────────────────────

function setMeta(name: string, content: string, type: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(type, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * یک script ld+json را با id مشخص set/update می‌کند
 * اگر وجود نداشت می‌سازد، اگر بود محتوا را آپدیت می‌کند
 */
function setLdJsonById(id: string, data: object | object[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(Array.isArray(data) ? data : data);
}

/** همه ld+json های مدیریت‌شده توسط این hook را پاک می‌کند */
function clearManagedLdJson(ids: string[]) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.textContent = '{}';
  }
}

// ── Schema Builder Helpers ────────────────────────────────────────────────────

/** آرایه sameAs از social links می‌سازد */
function buildSameAs(d: PageSchemaData): string[] {
  return [
    d.social_linkedin,
    d.social_twitter,
    d.social_instagram,
    d.social_youtube,
  ].filter((v): v is string => !!v && v.trim().length > 0);
}

/** Organization base node — استاندارد 2026 */
function buildOrganizationNode(d: PageSchemaData, siteName: string): Record<string, any> {
  const org: Record<string, any> = {
    '@type':       ['Organization', 'ProfessionalService'],
    '@id':         `${BASE_URL}/#organization`,
    name:          siteName,
    alternateName: 'Capital Network Iran',
    url:           BASE_URL,
    logo: {
      '@type':       'ImageObject',
      '@id':         `${BASE_URL}/#logo`,
      url:           LOGO_URL,
      contentUrl:    LOGO_URL,
      width:         600,
      height:        120,
      caption:       siteName,
    },
    image: {
      '@type': 'ImageObject',
      url:     d.social_instagram ? DEFAULT_IMG : DEFAULT_IMG,
    },
    description: DEFAULT_DESC,
    inLanguage:  LANG,
    foundingDate: '2020',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 15 },
    knowsAbout: [
      'Venture Capital',
      'Startup Investment',
      'Financial Modeling',
      'Pitch Deck',
      'Term Sheet Negotiation',
      t("جذب سرمایه"),
      t("استارتاپ"),
    ],
    areaServed: ['IR', 'Middle East', 'Global'],
  };

  if (d.telephone) org.telephone = d.telephone;
  if (d.email) org.email = d.email;
  if (d.address) {
    org.address = {
      '@type':            'PostalAddress',
      addressLocality:    d.address,
      addressCountry:     'IR',
      addressRegion:      'Tehran',
    };
  }
  if (d.workingHours) {
    org.openingHoursSpecification = {
      '@type':    'OpeningHoursSpecification',
      description: d.workingHours,
    };
  }

  const sameAs = buildSameAs(d);
  if (sameAs.length > 0) org.sameAs = sameAs;

  return org;
}

/** Breadcrumb schema — برای همه صفحات */
function buildBreadcrumb(
  crumbs: Array<{ name: string; url: string }>
): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    '@id':      `${crumbs[crumbs.length - 1].url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      name:       c.name,
      item: {
        '@type': 'WebPage',
        '@id':    c.url,
        url:     c.url,
        name:    c.name,
      },
    })),
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// ══ PAGE SCHEMA BUILDERS ════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════════

/**
 * 🏠 HOME — WebSite + Organization + SearchAction
 * بهترین ساختار 2026 برای صفحه اصلی
 */
function buildHomeSchemas(
  title: string,
  desc: string,
  img: string,
  d: PageSchemaData
): object[] {
  const org = buildOrganizationNode(d, SITE_NAME);

  const websiteSchema: Record<string, any> = {
    '@context':   'https://schema.org',
    '@type':      'WebSite',
    '@id':        `${BASE_URL}/#website`,
    name:         SITE_NAME,
    alternateName: t("کپیتال نتورک"),
    url:           BASE_URL,
    description:   desc,
    inLanguage:    LANG,
    publisher:     { '@id': `${BASE_URL}/#organization` },
    potentialAction: {
      '@type':     'SearchAction',
      target: {
        '@type':     'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    image: {
      '@type':       'ImageObject',
      '@id':         `${BASE_URL}/#primaryImage`,
      url:            img,
      contentUrl:     img,
      width:          1200,
      height:         630,
    },
  };

  const webPageSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type':    'WebPage',
    '@id':      `${BASE_URL}/`,
    url:        `${BASE_URL}/`,
    name:        title,
    description: desc,
    isPartOf:    { '@id': `${BASE_URL}/#website` },
    about:       { '@id': `${BASE_URL}/#organization` },
    breadcrumb:  { '@id': `${BASE_URL}/#breadcrumb` },
    inLanguage:  LANG,
    potentialAction: {
      '@type': 'ReadAction',
      target:  [`${BASE_URL}/`],
    },
  };

  const breadcrumb = buildBreadcrumb([
    { name: t("خانه"), url: `${BASE_URL}/` },
  ]);

  // اضافه کردن FAQ اگر موجود باشد
  const schemas: object[] = [
    { '@context': 'https://schema.org', ...org },
    websiteSchema,
    webPageSchema,
    { ...breadcrumb, '@id': `${BASE_URL}/#breadcrumb` },
  ];

  if (d.faqItems && d.faqItems.length > 0) {
    schemas.push({
      '@context':  'https://schema.org',
      '@type':     'FAQPage',
      '@id':       `${BASE_URL}/#faq`,
      url:         `${BASE_URL}/`,
      name:        t("سوالات متداول جذب سرمایه"),
      description: t("پاسخ به سوالات رایج درباره فرآیند جذب سرمایه و خدمات Capital Network"),
      mainEntity:  d.faqItems.slice(0, 10).map(faq => ({
        '@type':        'Question',
        name:            faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text:     faq.a,
        },
      })),
    });
  }

  return schemas;
}

/**
 * 💼 SERVICES — ProfessionalService + Service + Offer
 * اسکیمای حرفه‌ای برای صفحه خدمات با ItemList
 */
function buildServicesSchemas(
  title: string,
  desc: string,
  img: string,
  d: PageSchemaData
): object[] {
  const PAGE_URL = `${BASE_URL}/services`;
  const org      = buildOrganizationNode(d, SITE_NAME);

  const serviceCards = (d.servicesCards ?? []).slice(0, 6);
  const highlights   = (d.servicesHighlights ?? []).slice(0, 3);

  // ServiceList Schema
  const serviceListItems = serviceCards.map((card, i) => ({
    '@type':      'ListItem',
    position:     i + 1,
    item: {
      '@type':         'Service',
      '@id':           `${PAGE_URL}#service-${i + 1}`,
      name:             card.title,
      description:      card.desc,
      url:              PAGE_URL,
      serviceType:     'Investment Advisory',
      provider:        { '@id': `${BASE_URL}/#organization` },
      areaServed:      ['IR', 'Middle East', 'Global'],
      audience: {
        '@type':        'Audience',
        audienceType:   'Startups, Entrepreneurs, Founders',
      },
      hasOfferCatalog: card.features?.length > 0 ? {
        '@type': 'OfferCatalog',
        name:    t('ویژگی‌های {title}', { title: card.title }),
        itemListElement: card.features.map((f, j) => ({
          '@type': 'Offer',
          position: j + 1,
          name:     f,
        })),
      } : undefined,
    },
  })).filter((i) => !!i);

  const mainService: Record<string, any> = {
    '@context':   'https://schema.org',
    '@type':      'ProfessionalService',
    '@id':        `${PAGE_URL}#main-service`,
    name:         SITE_NAME,
    url:          PAGE_URL,
    description:  desc,
    image:         img,
    inLanguage:   LANG,
    provider:     { '@id': `${BASE_URL}/#organization` },
    serviceType:  'Startup Investment Advisory & Fundraising',
    category:     'Financial Services',
    areaServed:   ['IR', 'Middle East', 'Global'],
    audience: {
      '@type':     'Audience',
      audienceType: 'Startups seeking venture capital funding',
    },
    knowsAbout: ['Venture Capital', 'Startup Fundraising', 'Pitch Deck', 'Due Diligence'],
  };

  if (highlights.length > 0) {
    mainService.aggregateRating = {
      '@type':       'AggregateRating',
      ratingValue:   '4.9',
      bestRating:    '5',
      worstRating:   '1',
      ratingCount:    highlights[0]?.value?.replace(/[^0-9]/g, '') || '50',
      reviewCount:    highlights[0]?.value?.replace(/[^0-9]/g, '') || '50',
      description:    highlights.map(h => `${h.value} — ${h.label}`).join(' | '),
    };
  }

  const webPage: Record<string, any> = {
    '@context':  'https://schema.org',
    '@type':     'CollectionPage',
    '@id':       PAGE_URL,
    url:         PAGE_URL,
    name:        title,
    description: desc,
    isPartOf:    { '@id': `${BASE_URL}/#website` },
    about:       { '@id': `${BASE_URL}/#organization` },
    inLanguage:  LANG,
  };

  const breadcrumb = buildBreadcrumb([
    { name: t("خانه"),  url: `${BASE_URL}/` },
    { name: t("خدمات"), url: PAGE_URL },
  ]);

  return [
    { '@context': 'https://schema.org', ...org },
    mainService,
    serviceCards.length > 0 ? {
      '@context':       'https://schema.org',
      '@type':          'ItemList',
      '@id':            `${PAGE_URL}#service-list`,
      name:             t("خدمات Capital Network"),
      description:      desc,
      url:              PAGE_URL,
      numberOfItems:    serviceListItems.length,
      itemListElement:  serviceListItems,
    } : null,
    webPage,
    breadcrumb,
  ].filter(Boolean) as object[];
}

/**
 * ⚙️ PROCESS — HowTo + ItemList of steps
 * اسکیمای حرفه‌ای برای صفحه فرآیند با مراحل قدم به قدم
 */
function buildProcessSchemas(
  title: string,
  desc: string,
  img: string,
  d: PageSchemaData
): object[] {
  const PAGE_URL  = `${BASE_URL}/process`;
  const steps     = (d.processSteps ?? []).slice(0, 8);
  const avgDays   = d.avgDays ?? t("30-40 روز");

  const howToSteps = steps.map((step, i) => ({
    '@type':      'HowToStep',
    '@id':        `${PAGE_URL}#step-${i + 1}`,
    position:      i + 1,
    name:          step.title,
    text:          step.text,
    url:          `${PAGE_URL}#step-${i + 1}`,
    image: {
      '@type': 'ImageObject',
      url:     img,
    },
  }));

  const howToSchema: Record<string, any> = {
    '@context':    'https://schema.org',
    '@type':       'HowTo',
    '@id':         `${PAGE_URL}#howto`,
    name:           title,
    description:    desc,
    url:            PAGE_URL,
    image: {
      '@type': 'ImageObject',
      url:     img,
      width:   1200,
      height:  630,
    },
    inLanguage:    LANG,
    totalTime:    `P${avgDays.replace(/[^0-9-]/g, '').split('-')[1] ?? '40'}D`,
    estimatedCost: {
      '@type':    'MonetaryAmount',
      currency:   'USD',
      value:      '0',
      description: t("مشاوره اولیه رایگان"),
    },
    supply: [
      { '@type': 'HowToSupply', name: 'Pitch Deck' },
      { '@type': 'HowToSupply', name: 'Financial Model' },
      { '@type': 'HowToSupply', name: 'Cap Table' },
    ],
    tool: [
      { '@type': 'HowToTool', name: 'Capital Network Platform' },
      { '@type': 'HowToTool', name: 'VC Network Access' },
    ],
    step: howToSteps.length > 0 ? howToSteps : [
      {
        '@type':    'HowToStep',
        position:   1,
        name:       t("ارزیابی اولیه"),
        text:       t("تیم Capital Network استارتاپ شما را ارزیابی می‌کند"),
        url:       `${PAGE_URL}#step-1`,
      },
      {
        '@type':    'HowToStep',
        position:   2,
        name:       t("آماده‌سازی مستندات"),
        text:       t("Pitch Deck، مدل مالی و مستندات VC-Ready آماده می‌شوند"),
        url:       `${PAGE_URL}#step-2`,
      },
      {
        '@type':    'HowToStep',
        position:   3,
        name:       t("معرفی به سرمایه‌گذاران"),
        text:       t("معرفی هدفمند به VCهای مناسب از شبکه ۱۲۸+ سرمایه‌گذار"),
        url:       `${PAGE_URL}#step-3`,
      },
      {
        '@type':    'HowToStep',
        position:   4,
        name:       t("پشتیبانی مذاکره تا Term Sheet"),
        text:       t("پشتیبانی کامل تا بستن قرارداد و دریافت Term Sheet"),
        url:       `${PAGE_URL}#step-4`,
      },
    ],
  };

  const webPage: Record<string, any> = {
    '@context':  'https://schema.org',
    '@type':     'WebPage',
    '@id':       PAGE_URL,
    url:         PAGE_URL,
    name:        title,
    description: desc,
    isPartOf:    { '@id': `${BASE_URL}/#website` },
    about:       { '@id': `${BASE_URL}/#organization` },
    inLanguage:  LANG,
  };

  const breadcrumb = buildBreadcrumb([
    { name: t("خانه"),    url: `${BASE_URL}/` },
    { name: t("فرآیند"),  url: PAGE_URL },
  ]);

  return [howToSchema, webPage, breadcrumb];
}

/**
 * 🙋 ABOUT — AboutPage + Person (team) + Organization
 * کامل‌ترین ساختار درباره ما با تیم و سازمان
 */
function buildAboutSchemas(
  title: string,
  desc: string,
  img: string,
  d: PageSchemaData
): object[] {
  const PAGE_URL = `${BASE_URL}/about`;
  const org      = buildOrganizationNode(d, SITE_NAME);

  // Team members به عنوان Person schema
  const teamPersons = (d.teamMembers ?? []).slice(0, 10).map((m, i) => ({
    '@type':       'Person',
    '@id':         `${PAGE_URL}#person-${i + 1}`,
    name:           m.name,
    jobTitle:       m.role,
    description:    m.bio ?? '',
    worksFor:      { '@id': `${BASE_URL}/#organization` },
    url:            PAGE_URL,
    ...(m.avatar ? { image: { '@type': 'ImageObject', url: m.avatar } } : {}),
  }));

  // About cards اضافه شود به description
  const orgEnriched = {
    ...org,
    '@context': 'https://schema.org',
    slogan:     d.missionText ?? t("شریک استراتژیک استارتاپ‌ها در مسیر جذب سرمایه"),
    ...(teamPersons.length > 0 ? { employee: teamPersons } : {}),
  };

  const aboutPage: Record<string, any> = {
    '@context':  'https://schema.org',
    '@type':     'AboutPage',
    '@id':       PAGE_URL,
    url:         PAGE_URL,
    name:        title,
    description: desc,
    image:       img,
    inLanguage:  LANG,
    isPartOf:    { '@id': `${BASE_URL}/#website` },
    about:       { '@id': `${BASE_URL}/#organization` },
    mainEntity:  { '@id': `${BASE_URL}/#organization` },
    breadcrumb:  { '@id': `${PAGE_URL}#breadcrumb` },
    speakable: {
      '@type':   'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.about-desc'],
    },
  };

  const breadcrumb = buildBreadcrumb([
    { name: t("خانه"),      url: `${BASE_URL}/` },
    { name: t("درباره ما"), url: PAGE_URL },
  ]);

  const schemas: object[] = [orgEnriched, aboutPage, { ...breadcrumb, '@id': `${PAGE_URL}#breadcrumb` }];

  if (teamPersons.length > 0) {
    schemas.push({
      '@context':  'https://schema.org',
      '@type':     'ItemList',
      '@id':       `${PAGE_URL}#team-list`,
      name:        t("تیم Capital Network"),
      description: t("اعضای کلیدی تیم Capital Network"),
      url:          PAGE_URL,
      numberOfItems: teamPersons.length,
      itemListElement: teamPersons.map((p, i) => ({
        '@type':    'ListItem',
        position:   i + 1,
        item:       p,
      })),
    });
  }

  return schemas;
}

/**
 * 📞 CONTACT — ContactPage + Organization + LocalBusiness
 * Schema تماس با تمام کانال‌های ارتباطی
 */
function buildContactSchemas(
  title: string,
  desc: string,
  img: string,
  d: PageSchemaData
): object[] {
  const PAGE_URL = `${BASE_URL}/contact`;
  const org      = buildOrganizationNode(d, SITE_NAME);

  // Contact points
  const contactPoints: Record<string, any>[] = [];

  if (d.email) {
    contactPoints.push({
      '@type':       'ContactPoint',
      contactType:   'customer support',
      email:          d.email,
      availableLanguage: [
        { '@type': 'Language', name: 'Persian', alternateName: 'fa' },
        { '@type': 'Language', name: 'English', alternateName: 'en' },
      ],
      areaServed: 'IR',
    });
  }

  if (d.telephone) {
    contactPoints.push({
      '@type':       'ContactPoint',
      contactType:   'customer support',
      telephone:      d.telephone,
      hoursAvailable: {
        '@type':       'OpeningHoursSpecification',
        description:    d.workingHours ?? t("شنبه تا چهارشنبه ۹ صبح تا ۶ عصر"),
      },
      areaServed: 'IR',
    });
  }

  if (d.whatsapp) {
    contactPoints.push({
      '@type':       'ContactPoint',
      contactType:   'sales',
      telephone:      d.whatsapp,
      contactOption: 'TollFree',
      description:   t("واتساپ — پاسخگویی سریع"),
    });
  }

  const localBusiness: Record<string, any> = {
    '@context':   'https://schema.org',
    '@type':      ['LocalBusiness', 'FinancialService'],
    '@id':        `${PAGE_URL}#local-business`,
    name:          SITE_NAME,
    url:           PAGE_URL,
    description:   desc,
    image:         img,
    inLanguage:    LANG,
    currenciesAccepted: 'IRR, USD',
    paymentAccepted:    'Bank Transfer',
    priceRange:         '$$$',
    ...(d.telephone ? { telephone: d.telephone } : {}),
    ...(d.email ? { email: d.email } : {}),
    ...(d.address ? {
      address: {
        '@type':         'PostalAddress',
        addressLocality:  d.address,
        addressCountry:  'IR',
        addressRegion:   'Tehran',
      },
    } : {}),
    ...(d.workingHours ? {
      openingHoursSpecification: {
        '@type':       'OpeningHoursSpecification',
        description:    d.workingHours,
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        opens: '09:00',
        closes: '18:00',
      },
    } : {}),
    contactPoint: contactPoints,
    ...(buildSameAs(d).length > 0 ? { sameAs: buildSameAs(d) } : {}),
    hasMap: `https://maps.google.com/?q=${encodeURIComponent('Tehran, Iran')}`,
    geo: {
      '@type':    'GeoCoordinates',
      latitude:   '35.6892',
      longitude:  '51.3890',
    },
  };

  const contactPage: Record<string, any> = {
    '@context':  'https://schema.org',
    '@type':     'ContactPage',
    '@id':       PAGE_URL,
    url:         PAGE_URL,
    name:        title,
    description: desc,
    image:       img,
    inLanguage:  LANG,
    isPartOf:    { '@id': `${BASE_URL}/#website` },
    about:       { '@id': `${BASE_URL}/#organization` },
    breadcrumb:  { '@id': `${PAGE_URL}#breadcrumb` },
    mainEntity:  { '@id': `${BASE_URL}/#organization` },
    ...(contactPoints.length > 0 ? { significantLink: PAGE_URL } : {}),
  };

  const breadcrumb = buildBreadcrumb([
    { name: t("خانه"),       url: `${BASE_URL}/` },
    { name: t("تماس با ما"), url: PAGE_URL },
  ]);

  // Organization enriched با contact points
  const orgEnriched = {
    '@context': 'https://schema.org',
    ...org,
    ...(contactPoints.length > 0 ? { contactPoint: contactPoints } : {}),
  };

  return [
    orgEnriched,
    localBusiness,
    contactPage,
    { ...breadcrumb, '@id': `${PAGE_URL}#breadcrumb` },
  ];
}

/**
 * 📝 EVALUATION — WebPage + Service + ActionAccessSpecification
 * فرم درخواست ارزیابی — با Action schema برای فرم submission
 */
function buildEvaluationSchemas(
  title: string,
  desc: string,
  img: string,
  d: PageSchemaData
): object[] {
  const PAGE_URL = `${BASE_URL}/evaluation`;

  const webPageSchema: Record<string, any> = {
    '@context':  'https://schema.org',
    '@type':     'WebPage',
    '@id':       PAGE_URL,
    url:         PAGE_URL,
    name:        title,
    description: desc,
    image:       img,
    inLanguage:  LANG,
    isPartOf:    { '@id': `${BASE_URL}/#website` },
    about:       { '@id': `${BASE_URL}/#organization` },
    breadcrumb:  { '@id': `${PAGE_URL}#breadcrumb` },
    potentialAction: {
      '@type':    'ApplyAction',
      name:       t("درخواست ارزیابی استارتاپ"),
      description: t("درخواست ارزیابی رایگان استارتاپ توسط تیم Capital Network"),
      target: {
        '@type':     'EntryPoint',
        urlTemplate: PAGE_URL,
        actionAccessibilityRequirement: {
          '@type':           'ActionAccessSpecification',
          category:          'Free',
          availabilityStarts: new Date().toISOString().split('T')[0],
          eligibleRegion: {
            '@type': 'Country',
            name:    'Iran',
          },
        },
      },
      result: {
        '@type':       'Service',
        name:          t("ارزیابی آمادگی برای جذب سرمایه"),
        provider:     { '@id': `${BASE_URL}/#organization` },
        description:  t("ارزیابی جامع آمادگی استارتاپ برای جذب سرمایه از VCهای Tier-1"),
      },
    },
  };

  const serviceSchema: Record<string, any> = {
    '@context':   'https://schema.org',
    '@type':      'Service',
    '@id':        `${PAGE_URL}#evaluation-service`,
    name:         t("ارزیابی رایگان آمادگی برای جذب سرمایه"),
    alternateName: 'Free Startup Investment Readiness Evaluation',
    url:           PAGE_URL,
    description:  desc,
    serviceType:  'Startup Evaluation & Investment Readiness Assessment',
    category:     'Financial Advisory',
    provider:     { '@id': `${BASE_URL}/#organization` },
    audience: {
      '@type':     'Audience',
      audienceType: 'Startups at Seed to Series B stage',
    },
    areaServed: ['IR', 'Middle East'],
    offers: {
      '@type':       'Offer',
      name:          t("ارزیابی رایگان"),
      price:         '0',
      priceCurrency: 'IRR',
      availability:  'https://schema.org/InStock',
      validFrom:      new Date().toISOString().split('T')[0],
      seller:        { '@id': `${BASE_URL}/#organization` },
      description:   t("ارزیابی اولیه رایگان آمادگی برای جذب سرمایه"),
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:    t("آنچه در ارزیابی بررسی می‌شود"),
      itemListElement: [
        { '@type': 'Offer', position: 1, name: t("بررسی Market Fit") },
        { '@type': 'Offer', position: 2, name: t("ارزیابی تیم و مدل کسب‌وکار") },
        { '@type': 'Offer', position: 3, name: t("آمادگی مستندات (Pitch Deck، مدل مالی)") },
        { '@type': 'Offer', position: 4, name: t("تعیین استراتژی جذب سرمایه") },
      ],
    },
    review: {
      '@type':       'Review',
      reviewRating: {
        '@type':      'Rating',
        ratingValue:  '5',
        bestRating:   '5',
      },
      author: {
        '@type': 'Person',
        name:    t("موسس استارتاپ"),
      },
      reviewBody: t("فرآیند ارزیابی سریع و دقیق بود و دید واضحی نسبت به آمادگی‌مان پیدا کردیم."),
    },
  };

  const breadcrumb = buildBreadcrumb([
    { name: t("خانه"),            url: `${BASE_URL}/` },
    { name: t("درخواست ارزیابی"), url: PAGE_URL },
  ]);

  return [
    webPageSchema,
    serviceSchema,
    { ...breadcrumb, '@id': `${PAGE_URL}#breadcrumb` },
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// ══ MAIN HOOK ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════════

const ALL_SCHEMA_IDS = [
  'ld-json-main',
  'ld-json-s1',
  'ld-json-s2',
  'ld-json-s3',
  'ld-json-s4',
];

export function useSEO({
  title,
  description,
  image,
  type = 'website',
  publishedAt,
  author,
  pageKey,
  pageData,
  seoPage,
}: SEOOptions) {
  useEffect(() => {
    // ── Resolved values (admin panel overrides defaults) ───────────────────
    const resolvedTitle   = (seoPage?.title?.trim())          ? seoPage.title          : (title === 'خانه' ? SITE_TITLE : `${title} | ${SITE_NAME}`);
    const resolvedDesc    = (seoPage?.description?.trim())    ? seoPage.description    : (description ?? DEFAULT_DESC);
    const resolvedImg     = (seoPage?.og_image?.trim())       ? seoPage.og_image       : (image ?? DEFAULT_IMG);
    const resolvedOgTitle = (seoPage?.og_title?.trim())       ? seoPage.og_title       : resolvedTitle;
    const resolvedOgDesc  = (seoPage?.og_description?.trim()) ? seoPage.og_description : resolvedDesc;
    const resolvedRobots  = seoPage?.noindex
      ? 'noindex, nofollow'
      : (seoPage?.robots ?? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // ── Document title ─────────────────────────────────────────────────────
    document.title = resolvedTitle;

    // ── Standard meta ──────────────────────────────────────────────────────
    setMeta('description', resolvedDesc);
    setMeta('robots', resolvedRobots);
    setMeta('author', SITE_NAME);
    setMeta('publisher', SITE_NAME);
    setMeta('theme-color', '#00BCD4');
    if (seoPage?.keywords?.trim()) setMeta('keywords', seoPage.keywords);

    // ── Open Graph ─────────────────────────────────────────────────────────
    setMeta('og:title',       resolvedOgTitle, 'property');
    setMeta('og:description', resolvedOgDesc,  'property');
    setMeta('og:image',       resolvedImg,     'property');
    setMeta('og:image:width', '1200',          'property');
    setMeta('og:image:height','630',           'property');
    setMeta('og:image:alt',   resolvedTitle,   'property');
    setMeta('og:type',        type === 'article' ? 'article' : 'website', 'property');
    setMeta('og:site_name',   SITE_NAME,       'property');
    setMeta('og:url',         seoPage?.canonical?.trim() ?? window.location.href, 'property');
    setMeta('og:locale',      LANG.replace('-', '_'), 'property');

    // ── Twitter Card ───────────────────────────────────────────────────────
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:site',        '@capitalnetwork');
    setMeta('twitter:creator',     '@capitalnetwork');
    setMeta('twitter:title',       resolvedOgTitle);
    setMeta('twitter:description', resolvedOgDesc);
    setMeta('twitter:image',       resolvedImg);
    setMeta('twitter:image:alt',   resolvedTitle);

    // ── Canonical ──────────────────────────────────────────────────────────
    const canonicalUrl = seoPage?.canonical?.trim() ?? window.location.href.split('?')[0];
    setLinkTag('canonical', canonicalUrl);

    // ── hreflang ──────────────────────────────────────────────────────────
    setLinkTag('alternate', canonicalUrl);

    // ── Structured Data ────────────────────────────────────────────────────
    const pd = pageData ?? {};

    let schemas: object[] = [];

    if (type === 'article') {
      // BlogPosting schema — برای پست‌های بلاگ
      schemas = [{
        '@context': 'https://schema.org',
        '@type':    'BlogPosting',
        '@id':      canonicalUrl,
        headline:    resolvedTitle,
        description: resolvedDesc,
        image: {
          '@type':  'ImageObject',
          url:       resolvedImg,
          width:     1200,
          height:    630,
        },
        url:           canonicalUrl,
        datePublished: publishedAt ?? new Date().toISOString(),
        dateModified:  publishedAt ?? new Date().toISOString(),
        inLanguage:    LANG,
        author: author ? {
          '@type': 'Person',
          name:     author,
          url:     `${BASE_URL}/blog/author/${encodeURIComponent(author)}`,
        } : {
          '@type': 'Organization',
          '@id':   `${BASE_URL}/#organization`,
          name:     SITE_NAME,
        },
        publisher: {
          '@type': 'Organization',
          '@id':   `${BASE_URL}/#organization`,
          name:     SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url:      LOGO_URL,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id':    canonicalUrl,
        },
        isPartOf: { '@id': `${BASE_URL}/#website` },
      }];
    } else {
      // Per-page schemas
      switch (pageKey) {
        case 'home':
          schemas = buildHomeSchemas(resolvedTitle, resolvedDesc, resolvedImg, pd);
          break;
        case 'services':
          schemas = buildServicesSchemas(resolvedTitle, resolvedDesc, resolvedImg, pd);
          break;
        case 'process':
          schemas = buildProcessSchemas(resolvedTitle, resolvedDesc, resolvedImg, pd);
          break;
        case 'about':
          schemas = buildAboutSchemas(resolvedTitle, resolvedDesc, resolvedImg, pd);
          break;
        case 'contact':
          schemas = buildContactSchemas(resolvedTitle, resolvedDesc, resolvedImg, pd);
          break;
        case 'evaluation':
          schemas = buildEvaluationSchemas(resolvedTitle, resolvedDesc, resolvedImg, pd);
          break;
        default:
          // Fallback Organization schema
          schemas = [{
            '@context': 'https://schema.org',
            '@type':    'WebPage',
            '@id':      canonicalUrl,
            url:        canonicalUrl,
            name:       resolvedTitle,
            description: resolvedDesc,
            isPartOf:   { '@id': `${BASE_URL}/#website` },
            inLanguage: LANG,
          }];
      }
    }

    // Write schemas into DOM (up to 5 separate script tags)
    const schemaIds = ['ld-json-main', 'ld-json-s1', 'ld-json-s2', 'ld-json-s3', 'ld-json-s4'];
    schemas.slice(0, 5).forEach((schema, i) => {
      setLdJsonById(schemaIds[i], schema);
    });
    // Clear any extra slots that are no longer needed
    if (schemas.length < 5) {
      clearManagedLdJson(schemaIds.slice(schemas.length));
    }

  }, [title, description, image, type, publishedAt, author, pageKey, pageData, seoPage]);
}
