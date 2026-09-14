/**
 * Enterprise SEO Utilities
 * Helper functions for SEO optimization
 */

export const generateMetaTitle = (title: string, siteName: string = 'Capital Network'): string => {
  return `${title} | ${siteName}`;
};

export const generateMetaDescription = (description: string, maxLength: number = 160): string => {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength - 3) + '...';
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateCanonicalUrl = (baseUrl: string, slug: string, locale: string = 'fa'): string => {
  return `${baseUrl}/${locale}/process/${slug}`;
};

export const generateOgImage = (baseUrl: string, imagePath: string): string => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${baseUrl}${imagePath}`;
};

export const formatReadingTime = (wordCount: number): string => {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} دقیقه`;
};

export const generateStructuredData = (type: string, data: any): string => {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  });
};

export const validateSEO = (seo: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!seo.metaTitle || seo.metaTitle.length < 30 || seo.metaTitle.length > 60) {
    errors.push('Meta title should be between 30 and 60 characters');
  }

  if (!seo.metaDescription || seo.metaDescription.length < 120 || seo.metaDescription.length > 160) {
    errors.push('Meta description should be between 120 and 160 characters');
  }

  if (!seo.canonicalUrl) {
    errors.push('Canonical URL is required');
  }

  if (!seo.ogImage) {
    errors.push('OG image is recommended');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const generateSitemapEntry = (
  url: string,
  lastModified: string,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
  priority: number = 0.8
): string => {
  return `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>${changeFrequency}</changefreq>
      <priority>${priority}</priority>
    </url>
  `;
};

export const generateRobotsTxt = (allow: boolean = true, sitemapUrl: string): string => {
  return `
User-agent: *
${allow ? 'Allow: /' : 'Disallow: /'}

Sitemap: ${sitemapUrl}
  `.trim();
};
