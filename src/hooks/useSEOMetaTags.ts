// ─── useSEOMetaTags Hook ──────────────────────────────────────────────────────

import { useEffect } from 'react';
import type { MetaTags, SchemaMarkup } from '../lib/seoGenerator';

import { t, useLanguage } from '@/i18n';
import type { Language } from '@/i18n';


export function useSEOMetaTags(metaTags: MetaTags, schemaMarkup?: SchemaMarkup | SchemaMarkup[]) {
  const { lang } = useLanguage();

  useEffect(() => {
    // Set meta title
    document.title = metaTags.title;

    // Set meta description
    updateMetaTag('description', metaTags.description);
    updateMetaTag('keywords', metaTags.keywords);

    // Open Graph tags
    updateMetaTag('og:title', metaTags.ogTitle, 'property');
    updateMetaTag('og:description', metaTags.ogDescription, 'property');
    updateMetaTag('og:image', metaTags.ogImage, 'property');
    updateMetaTag('og:url', metaTags.ogUrl, 'property');
    updateMetaTag('og:type', 'article', 'property');

    // ── دو زبانه: og:locale و نسخهٔ جایگزین ──────────────────────────────────
    updateMetaTag('og:locale', lang === 'en' ? 'en_US' : 'fa_IR', 'property');
    updateMetaTag(
      'og:locale:alternate',
      lang === 'en' ? 'fa_IR' : 'en_US',
      'property'
    );

    // Twitter Card tags
    updateMetaTag('twitter:card', metaTags.twitterCard);
    updateMetaTag('twitter:title', metaTags.twitterTitle);
    updateMetaTag('twitter:description', metaTags.twitterDescription);
    updateMetaTag('twitter:image', metaTags.twitterImage);

    // Robots tag
    updateMetaTag('robots', metaTags.robots);

    // ── آدرس‌های آگاه به زبان ───────────────────────────────────────────────
    // سایت به صورت /fa (بدون پیشوند) و /en منتشر می‌شود؛ canonical و og:url
    // باید پیشوند زبان فعلی را داشته باشند تا صفحات هم‌معنی یکدیگر را نخورند.
    const canonicalUrl = localizeUrl(metaTags.canonical, lang);
    updateMetaTag('og:url', localizeUrl(metaTags.ogUrl, lang), 'property');

    // Canonical URL
    setCanonicalLink(canonicalUrl);

    // تگ‌های hreflang برای معرفی نسخه‌های زبان به موتورهای جستجو
    setAlternateLinks(canonicalUrl, lang);

    // Schema.org markup (JSON-LD)
    if (schemaMarkup) {
      const markups = Array.isArray(schemaMarkup) ? schemaMarkup : [schemaMarkup];
      setSchemaMarkup(markups);
    }

    // Cleanup function
    return () => {
      // Note: We keep meta tags to avoid flashing between pages
    };
  }, [metaTags, schemaMarkup, lang]);
}

/**
 * درج پیشوند زبان در یک آدرس مطلق (مثال: https://site.com/blog → https://site.com/en/blog)
 */
function localizeUrl(url: string, lang: Language): string {
  if (!url) return url;
  if (lang !== 'en') return url;
  if (/\/en(\/|$)/.test(url)) return url; // قبلاً پیشوند خورده است
  return url.replace(/^(https?:\/\/[^/]+)?/, (origin) => `${origin}/en`);
}

/**
 * مدیریت تگ‌های hreflang: نسخهٔ فارسی، انگلیسی و پیش‌فرض
 */
function setAlternateLinks(canonicalUrl: string, lang: Language): void {
  if (!canonicalUrl) return;

  const persianUrl = canonicalUrl.replace(/\/en(\/|$)/, '/');
  const englishUrl = lang === 'en' ? canonicalUrl : localizeUrl(persianUrl, 'en');

  const links: Array<{ hreflang: string; href: string }> = [
    { hreflang: 'fa-IR', href: persianUrl },
    { hreflang: 'en-US', href: englishUrl },
    { hreflang: 'x-default', href: persianUrl },
  ];

  for (const { hreflang, href } of links) {
    let link = document.querySelector(
      `link[rel="alternate"][hreflang="${hreflang}"]`
    ) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      link.setAttribute('hreflang', hreflang);
      document.head.appendChild(link);
    }
    link.href = href;
  }
}

/**
 * Helper function to update or create meta tag
 */
function updateMetaTag(
  name: string,
  content: string,
  attrName: 'name' | 'property' = 'name'
): void {
  let tag = document.querySelector(`meta[${attrName}="${name}"]`) as HTMLMetaElement;

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

/**
 * Set canonical link
 */
function setCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Set JSON-LD schema markup
 */
function setSchemaMarkup(schemas: SchemaMarkup[]): void {
  // Remove existing schema scripts
  const existing = document.querySelectorAll('script[type="application/ld+json"]');
  existing.forEach(script => {
    if (script.getAttribute('data-seo-managed') === 'true') {
      script.remove();
    }
  });

  // Add new schema scripts
  schemas.forEach(schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-managed', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

/**
 * Utility to create breadcrumb schema for navigation
 */
export function createBreadcrumbItems(currentPage: string): Array<{ name: string; url: string }> {
  const items: Array<{ name: string; url: string }> = [
    { name: t("خانه"), url: '/' },
  ];

  if (currentPage === 'blog') {
    items.push({ name: t("بلاگ"), url: '/blog' });
  } else if (currentPage === 'blog-post') {
    items.push(
      { name: t("بلاگ"), url: '/blog' },
      { name: t("مقاله"), url: '#' }
    );
  } else if (currentPage === 'category') {
    items.push(
      { name: t("بلاگ"), url: '/blog' },
      { name: t("دسته‌بندی"), url: '#' }
    );
  } else if (currentPage === 'tag') {
    items.push(
      { name: t("بلاگ"), url: '/blog' },
      { name: t("تگ"), url: '#' }
    );
  } else if (currentPage === 'author') {
    items.push(
      { name: t("بلاگ"), url: '/blog' },
      { name: t("نویسنده"), url: '#' }
    );
  }

  return items;
}
