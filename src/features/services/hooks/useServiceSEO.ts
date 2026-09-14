// ─── Service Page SEO Hook ────────────────────────────────────────────────────────────
// Comprehensive SEO implementation with Schema markup

import { useEffect } from 'react';
import type { SEOSettings, Service } from '../types/enterprise';

interface ServiceSEOProps {
  service?: Service;
  seo?: SEOSettings;
  canonicalUrl?: string;
}

export const useServiceSEO = ({ service, seo, canonicalUrl }: ServiceSEOProps) => {
  useEffect(() => {
    if (!seo) return;

    // Set document title
    document.title = seo.metaTitle;

    // Update or create meta description
    updateMetaTag('description', seo.metaDescription);

    // Update keywords
    if (seo.keywords && seo.keywords.length > 0) {
      updateMetaTag('keywords', seo.keywords.join(', '));
    }

    // Canonical URL
    if (seo.canonicalUrl || canonicalUrl) {
      updateLinkTag('canonical', seo.canonicalUrl || canonicalUrl!);
    }

    // Open Graph tags
    updateMetaTag('og:title', seo.ogTitle || seo.metaTitle, 'property');
    updateMetaTag('og:description', seo.ogDescription || seo.metaDescription, 'property');
    updateMetaTag('og:type', 'website', 'property');
    if (seo.ogImage) {
      updateMetaTag('og:image', seo.ogImage.url, 'property');
      updateMetaTag('og:image:alt', seo.ogImage.alt, 'property');
      if (seo.ogImage.width) {
        updateMetaTag('og:image:width', seo.ogImage.width.toString(), 'property');
      }
      if (seo.ogImage.height) {
        updateMetaTag('og:image:height', seo.ogImage.height.toString(), 'property');
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', seo.twitterCard || 'summary_large_image', 'name');
    updateMetaTag('twitter:title', seo.twitterTitle || seo.ogTitle || seo.metaTitle, 'name');
    updateMetaTag('twitter:description', seo.twitterDescription || seo.ogDescription || seo.metaDescription, 'name');
    if (seo.twitterImage) {
      updateMetaTag('twitter:image', seo.twitterImage.url, 'name');
    } else if (seo.ogImage) {
      updateMetaTag('twitter:image', seo.ogImage.url, 'name');
    }

    // Robots meta
    if (seo.noindex || seo.nofollow) {
      const robotsContent = [
        seo.noindex ? 'noindex' : 'index',
        seo.nofollow ? 'nofollow' : 'follow',
      ].join(', ');
      updateMetaTag('robots', robotsContent);
    }

    // Insert Schema markup
    insertSchemaMarkup(service, seo);

    return () => {
      // Cleanup on unmount if needed
    };
  }, [service, seo, canonicalUrl]);
};

// Helper functions
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateLinkTag(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

function insertSchemaMarkup(service?: Service, seo?: SEOSettings) {
  // Remove existing schema
  const existingSchema = document.getElementById('service-schema');
  if (existingSchema) {
    existingSchema.remove();
  }

  if (!service) return;

  // Organization Schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Capital Network',
    description: seo?.metaDescription || '',
    url: window.location.origin,
    logo: seo?.ogImage?.url || '',
  };

  // Service Schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'Capital Network',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Iran',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: service.pricing?.map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        price: plan.price,
        priceCurrency: plan.currency,
        description: plan.description,
      })),
    },
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${window.location.origin}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.title,
        item: `${window.location.origin}/services/${service.slug}`,
      },
    ],
  };

  // FAQ Schema (if FAQs exist)
  let faqSchema: any = null;
  // Note: FAQs would need to be passed in or fetched separately

  // Combine all schemas
  const schemas = [orgSchema, serviceSchema, breadcrumbSchema];
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  // Create script tag
  const script = document.createElement('script');
  script.id = 'service-schema';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemas);
  document.head.appendChild(script);
}
