// ─── XML Sitemap و RSS Feed Generator ──────────────────────────────────────

import type { BlogPost, BlogCategory } from '../types/blog';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface BlogPostWithCategory extends BlogPost {
  category: BlogCategory;
}

/**
 * تولید XML Sitemap برای تمام صفحات سایت
 */
export function generateSitemapXML(
  baseUrl: string,
  posts: BlogPostWithCategory[],
  categories: BlogCategory[],
  authors: string[]
): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const entries: SitemapEntry[] = [
    // صفحات اصلی
    { url: '/', changefreq: 'weekly', priority: 1.0, lastmod: currentDate },
    { url: '/services', changefreq: 'monthly', priority: 0.9, lastmod: currentDate },
    { url: '/process', changefreq: 'monthly', priority: 0.9, lastmod: currentDate },
    { url: '/blog', changefreq: 'daily', priority: 0.95, lastmod: currentDate },
    { url: '/about', changefreq: 'monthly', priority: 0.8, lastmod: currentDate },
    { url: '/contact', changefreq: 'never', priority: 0.7, lastmod: currentDate },

    // صفحات دسته‌بندی
    ...categories.map(cat => ({
      url: `/blog/category/${cat}`,
      changefreq: 'weekly' as const,
      priority: 0.85,
      lastmod: currentDate,
    })),

    // صفحات تگ (تگ‌های منحصر)
    ...[...new Set(posts.flatMap(p => p.tags))].map(tag => ({
      url: `/blog/tag/${encodeURIComponent(tag)}`,
      changefreq: 'weekly' as const,
      priority: 0.75,
      lastmod: currentDate,
    })),

    // صفحات نویسندگان
    ...authors.map(author => ({
      url: `/blog/author/${encodeURIComponent(author)}`,
      changefreq: 'weekly' as const,
      priority: 0.75,
      lastmod: currentDate,
    })),

    // صفحات پست‌های بلاگ
    ...posts.map(post => ({
      url: `/blog/${post.slug}`,
      changefreq: 'monthly' as const,
      priority: 0.8,
      lastmod: new Date(post.publishedAt).toISOString().split('T')[0],
    })),
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  for (const entry of entries) {
    xml += `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>
`;
  }

  xml += `</urlset>`;

  return xml;
}

/**
 * تولید RSS Feed برای بلاگ پست‌ها
 */
export function generateRSSFeed(
  baseUrl: string,
  siteTitle: string,
  siteDescription: string,
  posts: BlogPostWithCategory[]
): string {
  const currentDate = new Date().toISOString();
  
  // ۲۰ آخرین پست
  const recentPosts = posts.slice(0, 20);

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(siteTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXML(siteDescription)}</description>
    <language>fa-IR</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <managingEditor>info@capitalnetwork.ir</managingEditor>
`;

  for (const post of recentPosts) {
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    const pubDate = new Date(post.publishedAt).toUTCString();

    rss += `    <item>
      <title>${escapeXML(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${escapeXML(post.author.name)}</dc:creator>
      <category>${escapeXML(post.category)}</category>
      ${post.tags.map(tag => `      <category>${escapeXML(tag)}</category>\n`).join('')}
      <description>${escapeXML(post.excerpt)}</description>
      <content:encoded><![CDATA[
        <h2>${escapeXML(post.title)}</h2>
        <p><strong>نویسنده:</strong> ${escapeXML(post.author.name)} (${escapeXML(post.author.role)})</p>
        <p><strong>تاریخ:</strong> ${post.publishedAt}</p>
        <p><strong>زمان مطالعه:</strong> ${post.readTime}</p>
        ${post.content}
      ]]></content:encoded>
    </item>
`;
  }

  rss += `  </channel>
</rss>`;

  return rss;
}

/**
 * فایل robots.txt
 */
export function generateRobotsTxt(sitemapUrl: string): string {
  return `# Capital Network - SEO Robot Rules
User-agent: *
Allow: /
Allow: /blog/
Allow: /blog/category/
Allow: /blog/tag/
Allow: /blog/author/
Allow: /services/
Allow: /process/
Allow: /about/
Allow: /contact/

Disallow: /_next/
Disallow: /admin
Disallow: /.git
Disallow: /node_modules

# Crawl delay
Crawl-delay: 1

# Sitemap
Sitemap: ${sitemapUrl}

# User-agent specific rules
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: DotBot
User-agent: MJ12bot
Crawl-delay: 10
`;
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate Structured Data (Schema.org JSON-LD)
 */
export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export function generateBlogPostSchema(
  post: BlogPostWithCategory,
  baseUrl: string,
  authorImage?: string
): SchemaMarkup {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || `${baseUrl}/images/blog-default.jpg`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `${baseUrl}/blog/author/${encodeURIComponent(post.author.name)}`,
      ...(authorImage ? { image: authorImage } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Capital Network',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleBody: post.content,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };
}

export function generateCategoryPageSchema(
  categoryName: string,
  categoryDescription: string,
  baseUrl: string,
  postCount: number
): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryName,
    description: categoryDescription,
    url: `${baseUrl}/blog/category/${categoryName}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Capital Network',
      url: baseUrl,
    },
    numberOfItems: postCount,
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
): SchemaMarkup {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function generateOrganizationSchema(baseUrl: string, config: {
  name: string;
  description: string;
  logo: string;
  social: Array<{ platform: string; url: string }>;
  contact?: { email?: string; phone?: string };
}): SchemaMarkup {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    description: config.description,
    url: baseUrl,
    logo: config.logo,
    sameAs: config.social.map(s => s.url),
    ...(config.contact?.email && { email: config.contact.email }),
    ...(config.contact?.phone && { telephone: config.contact.phone }),
    contactPoint: config.contact ? {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      ...(config.contact.email && { email: config.contact.email }),
      ...(config.contact.phone && { telephone: config.contact.phone }),
    } : undefined,
  };
}

/**
 * Generate Meta Tags for SEO
 */
export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonical: string;
  robots: string;
}

export function generateBlogPostMetaTags(
  post: BlogPostWithCategory,
  baseUrl: string,
  fallbackImage: string
): MetaTags {
  const url = `${baseUrl}/blog/${post.slug}`;
  
  return {
    title: `${post.title} | Capital Network`,
    description: post.excerpt,
    keywords: [post.category, ...post.tags].join(', '),
    ogTitle: post.title,
    ogDescription: post.excerpt,
    ogImage: post.image || fallbackImage,
    ogUrl: url,
    twitterCard: 'summary_large_image',
    twitterTitle: post.title,
    twitterDescription: post.excerpt,
    twitterImage: post.image || fallbackImage,
    canonical: url,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  };
}

export function generateCategoryPageMetaTags(
  categoryName: string,
  categoryDescription: string,
  baseUrl: string,
  fallbackImage: string
): MetaTags {
  const url = `${baseUrl}/blog/category/${categoryName}`;
  
  return {
    title: `${categoryName} | Capital Network Blog`,
    description: categoryDescription,
    keywords: categoryName,
    ogTitle: categoryName,
    ogDescription: categoryDescription,
    ogImage: fallbackImage,
    ogUrl: url,
    twitterCard: 'summary',
    twitterTitle: categoryName,
    twitterDescription: categoryDescription,
    twitterImage: fallbackImage,
    canonical: url,
    robots: 'index, follow',
  };
}
