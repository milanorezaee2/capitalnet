// ─── useSEOMetaTags Hook ──────────────────────────────────────────────────────

import { useEffect } from 'react';
import type { MetaTags, SchemaMarkup } from '../lib/seoGenerator';

export function useSEOMetaTags(metaTags: MetaTags, schemaMarkup?: SchemaMarkup | SchemaMarkup[]) {
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

    // Twitter Card tags
    updateMetaTag('twitter:card', metaTags.twitterCard);
    updateMetaTag('twitter:title', metaTags.twitterTitle);
    updateMetaTag('twitter:description', metaTags.twitterDescription);
    updateMetaTag('twitter:image', metaTags.twitterImage);

    // Robots tag
    updateMetaTag('robots', metaTags.robots);

    // Canonical URL
    setCanonicalLink(metaTags.canonical);

    // Schema.org markup (JSON-LD)
    if (schemaMarkup) {
      const markups = Array.isArray(schemaMarkup) ? schemaMarkup : [schemaMarkup];
      setSchemaMarkup(markups);
    }

    // Cleanup function
    return () => {
      // Note: We keep meta tags to avoid flashing between pages
    };
  }, [metaTags, schemaMarkup]);
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
    { name: 'خانه', url: '/' },
  ];

  if (currentPage === 'blog') {
    items.push({ name: 'بلاگ', url: '/blog' });
  } else if (currentPage === 'blog-post') {
    items.push(
      { name: 'بلاگ', url: '/blog' },
      { name: 'مقاله', url: '#' }
    );
  } else if (currentPage === 'category') {
    items.push(
      { name: 'بلاگ', url: '/blog' },
      { name: 'دسته‌بندی', url: '#' }
    );
  } else if (currentPage === 'tag') {
    items.push(
      { name: 'بلاگ', url: '/blog' },
      { name: 'تگ', url: '#' }
    );
  } else if (currentPage === 'author') {
    items.push(
      { name: 'بلاگ', url: '/blog' },
      { name: 'نویسنده', url: '#' }
    );
  }

  return items;
}
