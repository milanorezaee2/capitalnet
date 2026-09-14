/**
 * Enterprise SEO Meta Tags Component
 * Dynamic meta tags for process pages
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOSettings } from '../../types/process';

export interface SEOMetaTagsProps {
  seo: SEOSettings;
  canonicalUrl?: string;
  ogImage?: string;
}

export const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({
  seo,
  canonicalUrl,
  ogImage,
}) => {
  const {
    metaTitle,
    metaDescription,
    canonicalUrl: pageCanonicalUrl,
    ogTitle,
    ogDescription,
    ogImage: pageOgImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    noindex,
    nofollow,
    structuredData,
  } = seo;

  const finalCanonicalUrl = pageCanonicalUrl || canonicalUrl;
  const finalOgImage = pageOgImage || ogImage;

  const robotsMeta = [];
  if (noindex) robotsMeta.push('noindex');
  if (nofollow) robotsMeta.push('nofollow');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Canonical URL */}
      {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}
      
      {/* Robots */}
      {robotsMeta.length > 0 && (
        <meta name="robots" content={robotsMeta.join(', ')} />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle || metaTitle} />
      <meta property="og:description" content={ogDescription || metaDescription} />
      {finalCanonicalUrl && <meta property="og:url" content={finalCanonicalUrl} />}
     {finalOgImage && <meta property="og:image" content={finalOgImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={twitterTitle || metaTitle} />
      <meta name="twitter:description" content={twitterDescription || metaDescription} />
      {twitterImage || finalOgImage ? (
        <meta name="twitter:image" content={twitterImage || finalOgImage} />
      ) : null}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
