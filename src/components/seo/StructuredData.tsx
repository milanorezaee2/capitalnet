/**
 * Enterprise Structured Data Component
 * JSON-LD structured data for SEO
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ProcessPage, FAQ } from '../../types/process';

export interface StructuredDataProps {
  page: ProcessPage;
  organizationName?: string;
  organizationUrl?: string;
  organizationLogo?: string;
}

export const StructuredData: React.FC<StructuredDataProps> = ({
  page,
  organizationName = 'Capital Network',
  organizationUrl = 'https://capitalnetwork.ir',
  organizationLogo,
}) => {
  const generateBreadcrumbSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'خانه',
          item: organizationUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'فرآیند',
          item: `${organizationUrl}/process`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: page.hero.title,
          item: `${organizationUrl}/process/${page.slug}`,
        },
      ],
    };
  };

  const generateFAQSchema = () => {
    if (!page.faq.enabled || page.faq.faqs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  };

  const generateOrganizationSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organizationName,
      url: organizationUrl,
      logo: organizationLogo,
      description: page.overview.description,
      sameAs: [
        'https://twitter.com/capitalnetwork',
        'https://linkedin.com/company/capitalnetwork',
        'https://instagram.com/capitalnetwork',
      ],
    };
  };

  const generateWebPageSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.hero.title,
      description: page.seo.metaDescription,
      url: `${organizationUrl}/process/${page.slug}`,
      publisher: {
        '@type': 'Organization',
        name: organizationName,
        url: organizationUrl,
        logo: organizationLogo,
      },
      inLanguage: page.locale === 'fa' ? 'fa-IR' : 'en-US',
      datePublished: page.publishedAt,
      dateModified: page.updatedAt,
    };
  };

  const generateHowToSchema = () => {
    if (!page.timeline.enabled || page.timeline.steps.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: page.hero.title,
      description: page.overview.description,
      step: page.timeline.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
        image: step.image?.url,
      })),
    };
  };

  const schemas = [
    generateBreadcrumbSchema(),
    generateOrganizationSchema(),
    generateWebPageSchema(),
    generateFAQSchema(),
    generateHowToSchema(),
  ].filter(Boolean);

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
        >
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
