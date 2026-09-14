// ─── SEO Configuration ────────────────────────────────────────────────────────

export const SEO_CONFIG = {
  // Base URL
  baseUrl: process.env.VITE_APP_URL || 'https://capitalnetwork.ir',

  // Site Information
  siteName: 'Capital Network',
  siteDescription: 'پلتفرم جامع آماده‌سازی سرمایه‌گذاری برای استارتاپ‌ها و کسب‌وکارهای نو',
  siteKeywords: 'سرمایه‌گذاری، استارتاپ، VC، Pitch Deck، مدل‌سازی مالی',

  // Social Media
  social: {
    twitter: '@capitalnetwork',
    linkedin: 'https://linkedin.com/company/capital-network',
    instagram: '@capitalnetwork.ir',
    youtube: 'https://youtube.com/@capitalnetwork',
  },

  // Contact Information
  contact: {
    email: 'info@capitalnetwork.ir',
    phone: '+98 (0) 21 - XXXX XXXX',
  },

  // Blog Information
  blog: {
    postsPerPage: 12,
    relatedPostsCount: 3,
    featuredPostsCount: 2,
  },

  // Image URLs
  images: {
    logo: '/logo.svg',
    fallbackImage: '/images/blog-default.jpg',
    ogImage: '/images/og-default.jpg',
  },

  // Structured Data
  organization: {
    name: 'Capital Network',
    description: 'پلتفرم جامع آماده‌سازی سرمایه‌گذاری',
    logo: 'https://capitalnetwork.ir/logo.svg',
  },

  // Robots and Crawling
  robots: {
    crawlDelay: 1,
    userAgents: {
      default: 'Allow: /',
      AhrefsBot: 'Crawl-delay: 10',
      SemrushBot: 'Crawl-delay: 10',
      MJ12bot: 'Crawl-delay: 10',
    },
  },

  // Localization
  locale: 'fa_IR',
  language: 'fa',
  rtl: true,

  // Analytics
  googleAnalyticsId: process.env.VITE_GA_ID || '',
  googleSearchConsoleId: process.env.VITE_GSC_ID || '',

  // Sitemap and RSS
  sitemap: {
    enabled: true,
    path: '/sitemap.xml',
    updateFrequency: 'weekly',
  },
  rss: {
    enabled: true,
    path: '/feed.xml',
    postsLimit: 20,
  },

  // Meta Tags
  defaultMetaTags: {
    charset: 'UTF-8',
    viewport: 'width=device-width, initial-scale=1.0',
    author: 'Capital Network',
    publisher: 'Capital Network',
  },

  // CDN Configuration
  cdn: {
    enabled: false,
    url: 'https://cdn.capitalnetwork.ir',
  },

  // Performance
  performance: {
    minifyHTML: true,
    compressImages: true,
    lazyLoadImages: true,
  },
};

/**
 * Helper function to get environment-specific SEO config
 */
export function getSEOConfig(env: 'development' | 'production' = 'production') {
  const config = { ...SEO_CONFIG };

  if (env === 'development') {
    config.baseUrl = 'http://localhost:5173';
    config.robots.crawlDelay = 0;
  }

  return config;
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const { baseUrl } = SEO_CONFIG;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Generate OG Tags object
 */
export interface OGTags {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'blog';
}

export function generateOGTags(data: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'blog';
}): OGTags {
  return {
    title: data.title || SEO_CONFIG.siteName,
    description: data.description || SEO_CONFIG.siteDescription,
    image: data.image || `${SEO_CONFIG.baseUrl}${SEO_CONFIG.images.ogImage}`,
    url: data.url || SEO_CONFIG.baseUrl,
    type: data.type || 'website',
  };
}

/**
 * Generate Twitter Card Tags
 */
export interface TwitterCard {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image: string;
  creator?: string;
}

export function generateTwitterCard(data: {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  image?: string;
  creator?: string;
}): TwitterCard {
  return {
    card: data.card || 'summary_large_image',
    title: data.title || SEO_CONFIG.siteName,
    description: data.description || SEO_CONFIG.siteDescription,
    image: data.image || `${SEO_CONFIG.baseUrl}${SEO_CONFIG.images.ogImage}`,
    creator: data.creator || SEO_CONFIG.social.twitter,
  };
}
