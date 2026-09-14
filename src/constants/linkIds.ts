// ─── Complete Link Tracking IDs Inventory ───────────────────────────────────

import { generateLinkId } from '../lib/linkTracking';

/**
 * سیستم جامع ID برای تمام لینک‌های سایت
 * هر لینک یک ID منحصر به فرد اختصاصی دارد
 */

// ═════════════════════════════════════════════════════════════════════════════
// PAGE ROUTE LINK IDS
// ═════════════════════════════════════════════════════════════════════════════

export const PAGE_ROUTE_LINK_IDS = {
  home: generateLinkId('home'),
  services: generateLinkId('services'),
  process: generateLinkId('process'),
  blog: generateLinkId('blog'),
  about: generateLinkId('about'),
  contact: generateLinkId('contact'),
  login: generateLinkId('login'),
  evaluation: generateLinkId('evaluation'),
  blogCategory: (category: string) => generateLinkId(`blog-category-${category}`),
  blogPost: (slug: string) => generateLinkId(`blog-post-${slug}`),
  blogTag: (tag: string) => generateLinkId(`blog-tag-${tag}`),
  blogAuthor: (author: string) => generateLinkId(`blog-author-${author}`),
} as const;

export function getPageRouteLinkId(
  page: string,
  details?: { category?: string; slug?: string; tag?: string; author?: string }
): string | undefined {
  switch (page) {
    case 'home':
      return PAGE_ROUTE_LINK_IDS.home;
    case 'services':
      return PAGE_ROUTE_LINK_IDS.services;
    case 'process':
      return PAGE_ROUTE_LINK_IDS.process;
    case 'blog':
      return PAGE_ROUTE_LINK_IDS.blog;
    case 'about':
      return PAGE_ROUTE_LINK_IDS.about;
    case 'contact':
      return PAGE_ROUTE_LINK_IDS.contact;
    case 'evaluation':
      return PAGE_ROUTE_LINK_IDS.evaluation;
    case 'blog-post':
      return PAGE_ROUTE_LINK_IDS.blogPost(details?.slug || 'post');
    case 'category':
      return PAGE_ROUTE_LINK_IDS.blogCategory(details?.category || 'all');
    case 'tag':
      return PAGE_ROUTE_LINK_IDS.blogTag(details?.tag || 'tag');
    case 'author':
      return PAGE_ROUTE_LINK_IDS.blogAuthor(details?.author || 'author');
    default:
      return undefined;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// NAVBAR / HEADER LINKS
// ═════════════════════════════════════════════════════════════════════════════

export const NAVBAR_LINKS = {
  LOGO: 'navbar-logo-home',
  SERVICES: 'navbar-services',
  PROCESS: 'navbar-process',
  BLOG: 'navbar-blog',
  CONTACT: 'navbar-contact',
  ABOUT: 'navbar-about',
  MENU_TOGGLE: 'navbar-menu-toggle',
  MENU_SERVICES: 'navbar-menu-services',
  MENU_PROCESS: 'navbar-menu-process',
  MENU_BLOG: 'navbar-menu-blog',
  MENU_ABOUT: 'navbar-menu-about',
  MENU_CONTACT: 'navbar-menu-contact',
  AUTH_LOGIN: 'navbar-auth-login',
  USER_DASHBOARD: 'navbar-user-dashboard',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// HERO SECTION / CTA BUTTONS
// ═════════════════════════════════════════════════════════════════════════════

export const HERO_BUTTONS = {
  CTA_PRIMARY: 'hero-cta-primary-contact',
  CTA_SECONDARY: 'hero-cta-secondary-process',
  SCROLL_DOWN: 'hero-scroll-down',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// SERVICES SECTION
// ═════════════════════════════════════════════════════════════════════════════

export const SERVICES_SECTION = {
  VC_READY: 'services-link-vc-ready',
  INVESTOR_MATCHING: 'services-link-investor-matching',
  NEGOTIATION: 'services-link-negotiation',
  CTA_EVALUATION: 'services-cta-evaluation',
  CTA_CONTACT: 'services-cta-contact',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// PROCESS SECTION
// ═════════════════════════════════════════════════════════════════════════════

export const PROCESS_SECTION = {
  CTA_START: 'process-cta-start-evaluation',
  CTA_CONTACT: 'process-cta-contact-us',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// BLOG SECTION
// ═════════════════════════════════════════════════════════════════════════════

export const BLOG_SECTION = {
  VIEW_ALL: 'blog-section-view-all',
  CATEGORY_INVESTMENT: 'blog-category-investment',
  CATEGORY_STRATEGY: 'blog-category-strategy',
  CATEGORY_CASE_STUDY: 'blog-category-case-study',
  CATEGORY_MARKET_ANALYSIS: 'blog-category-market-analysis',
  CATEGORY_NEGOTIATION: 'blog-category-negotiation',
  CATEGORY_FINANCIAL_MODELING: 'blog-category-financial-modeling',
  FEATURED_POST_1: 'blog-featured-post-1',
  FEATURED_POST_2: 'blog-featured-post-2',
  POST_GRID: (index: number) => `blog-post-grid-${index}`,
  NEWSLETTER_SUBSCRIBE: 'blog-newsletter-subscribe',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// BLOG PAGE - CATEGORIES
// ═════════════════════════════════════════════════════════════════════════════

export const BLOG_PAGE_CATEGORIES = {
  ALL: 'blog-page-category-all',
  INVESTMENT: 'blog-page-category-investment',
  STRATEGY: 'blog-page-category-strategy',
  CASE_STUDY: 'blog-page-category-case-study',
  MARKET_ANALYSIS: 'blog-page-category-market-analysis',
  NEGOTIATION: 'blog-page-category-negotiation',
  FINANCIAL_MODELING: 'blog-page-category-financial-modeling',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// BLOG POST PAGE
// ═════════════════════════════════════════════════════════════════════════════

export const BLOG_POST_PAGE = {
  BACK_TO_BLOG: 'blog-post-back-to-blog',
  BREADCRUMB_HOME: 'blog-post-breadcrumb-home',
  BREADCRUMB_BLOG: 'blog-post-breadcrumb-blog',
  SHARE_FACEBOOK: 'blog-post-share-facebook',
  SHARE_TWITTER: 'blog-post-share-twitter',
  SHARE_LINKEDIN: 'blog-post-share-linkedin',
  SHARE_WHATSAPP: 'blog-post-share-whatsapp',
  AUTHOR_VIEW_ALL: 'blog-post-author-view-all-posts',
  RELATED_POST: (index: number) => `blog-post-related-${index}`,
  POPULAR_POST: (index: number) => `blog-post-popular-${index}`,
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// BLOG ARCHIVE PAGES (Category, Tag, Author)
// ═════════════════════════════════════════════════════════════════════════════

export const ARCHIVE_PAGES = {
  BACK_TO_BLOG: 'archive-back-to-blog',
  POST_ITEM: (type: string, name: string, index: number) => `archive-${type}-${name}-post-${index}`,
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// FOOTER LINKS
// ═════════════════════════════════════════════════════════════════════════════

export const FOOTER_LINKS = {
  LOGO: 'footer-logo-home',
  
  // Quick Links
  SERVICES: 'footer-quick-services',
  BLOG: 'footer-quick-blog',
  PROCESS: 'footer-quick-process',
  ABOUT: 'footer-quick-about',
  CONTACT: 'footer-quick-contact',
  
  // Blog Categories
  BLOG_INVESTMENT: 'footer-blog-investment',
  BLOG_STRATEGY: 'footer-blog-strategy',
  BLOG_CASE_STUDY: 'footer-blog-case-study',
  BLOG_MARKET_ANALYSIS: 'footer-blog-market-analysis',
  BLOG_NEGOTIATION: 'footer-blog-negotiation',
  BLOG_FINANCIAL_MODELING: 'footer-blog-financial-modeling',
  
  // About Links
  ABOUT_INFO: 'footer-about-info',
  ABOUT_TEAM: 'footer-about-team',
  
  // Contact
  EMAIL: 'footer-contact-email',
  PHONE: 'footer-contact-phone',
  WHATSAPP: 'footer-contact-whatsapp',
  
  // Social
  TWITTER: 'footer-social-twitter',
  LINKEDIN: 'footer-social-linkedin',
  INSTAGRAM: 'footer-social-instagram',
  YOUTUBE: 'footer-social-youtube',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// MOBILE MENU LINKS
// ═════════════════════════════════════════════════════════════════════════════

export const MOBILE_MENU = {
  HOME: 'mobile-menu-home',
  SERVICES: 'mobile-menu-services',
  SERVICE_VC_READY: 'mobile-menu-service-vc-ready',
  SERVICE_MATCHING: 'mobile-menu-service-matching',
  SERVICE_NEGOTIATION: 'mobile-menu-service-negotiation',
  SERVICE_EVALUATION: 'mobile-menu-service-evaluation',
  
  BLOG: 'mobile-menu-blog',
  BLOG_ALL: 'mobile-menu-blog-all',
  BLOG_INVESTMENT: 'mobile-menu-blog-investment',
  BLOG_STRATEGY: 'mobile-menu-blog-strategy',
  BLOG_CASE_STUDY: 'mobile-menu-blog-case-study',
  BLOG_MARKET_ANALYSIS: 'mobile-menu-blog-market-analysis',
  BLOG_NEGOTIATION: 'mobile-menu-blog-negotiation',
  BLOG_FINANCIAL_MODELING: 'mobile-menu-blog-financial-modeling',
  
  ABOUT: 'mobile-menu-about',
  ABOUT_INFO: 'mobile-menu-about-info',
  ABOUT_TEAM: 'mobile-menu-about-team',
  
  PROCESS: 'mobile-menu-process',
  CONTACT: 'mobile-menu-contact',
  
  EMAIL: 'mobile-menu-email',
  PHONE: 'mobile-menu-phone',
  WHATSAPP: 'mobile-menu-whatsapp',
  
  CLOSE: 'mobile-menu-close',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// HOME PAGE SECTIONS
// ═════════════════════════════════════════════════════════════════════════════

export const HOME_PAGE = {
  HERO_CTA_PRIMARY: 'home-hero-cta-primary',
  HERO_CTA_SECONDARY: 'home-hero-cta-secondary',
  
  STATS: 'home-stats-section',
  
  SERVICES_CTA: 'home-services-cta',
  
  TESTIMONIALS: 'home-testimonials-section',
  
  BLOG_VIEW_ALL: 'home-blog-view-all',
  BLOG_FEATURED: (index: number) => `home-blog-featured-${index}`,
  
  FAQ_ITEMS: (index: number) => `home-faq-item-${index}`,
  
  FINAL_CTA_PRIMARY: 'home-final-cta-primary',
  FINAL_CTA_SECONDARY: 'home-final-cta-secondary',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE
// ═════════════════════════════════════════════════════════════════════════════

export const CONTACT_PAGE = {
  BACK_HOME: 'contact-back-home',
  EMAIL: 'contact-email',
  PHONE: 'contact-phone',
  WHATSAPP: 'contact-whatsapp',
  SOCIAL_TWITTER: 'contact-social-twitter',
  SOCIAL_LINKEDIN: 'contact-social-linkedin',
  SOCIAL_INSTAGRAM: 'contact-social-instagram',
  SOCIAL_YOUTUBE: 'contact-social-youtube',
  FORM_SUBMIT: 'contact-form-submit',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// ABOUT PAGE
// ═════════════════════════════════════════════════════════════════════════════

export const ABOUT_PAGE = {
  BACK_HOME: 'about-back-home',
  MISSION: 'about-mission-section',
  EXPERIENCE: 'about-experience-section',
  VALUES: 'about-values-section',
  TEAM_VIEW: 'about-team-view',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// SERVICES PAGE
// ═════════════════════════════════════════════════════════════════════════════

export const SERVICES_PAGE = {
  BACK_HOME: 'services-back-home',
  VC_READY_SECTION: 'services-vc-ready-section',
  MATCHING_SECTION: 'services-matching-section',
  NEGOTIATION_SECTION: 'services-negotiation-section',
  CTA_CONTACT: 'services-page-cta-contact',
  CTA_EVALUATION: 'services-page-cta-evaluation',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// PROCESS PAGE
// ═════════════════════════════════════════════════════════════════════════════

export const PROCESS_PAGE = {
  BACK_HOME: 'process-back-home',
  CTA_START: 'process-page-cta-start',
  CTA_CONTACT: 'process-page-cta-contact',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN / DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

export const ADMIN_LINKS = {
  DASHBOARD: 'admin-dashboard',
  USERS: 'admin-users',
  LEADS: 'admin-leads',
  MESSAGES: 'admin-messages',
  BLOG: 'admin-blog',
  ANALYTICS: 'admin-analytics',
  SETTINGS: 'admin-settings',
  LOGOUT: 'admin-logout',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// MODAL / POPUP LINKS
// ═════════════════════════════════════════════════════════════════════════════

export const MODAL_LINKS = {
  AUTH_CLOSE: 'modal-auth-close',
  AUTH_SIGNUP: 'modal-auth-signup',
  AUTH_LOGIN: 'modal-auth-login',
  AUTH_FORGOT: 'modal-auth-forgot-password',
  
  DASHBOARD_CLOSE: 'modal-dashboard-close',
  DASHBOARD_PROFILE: 'modal-dashboard-profile',
  DASHBOARD_LOGOUT: 'modal-dashboard-logout',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// CHAT WIDGET
// ═════════════════════════════════════════════════════════════════════════════

export const CHAT_WIDGET = {
  OPEN: 'chat-widget-open',
  CLOSE: 'chat-widget-close',
  SEND: 'chat-widget-send',
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// ALL LINKS COMBINED (for reference)
// ═════════════════════════════════════════════════════════════════════════════

export const ALL_LINK_IDS = {
  ...NAVBAR_LINKS,
  ...HERO_BUTTONS,
  ...SERVICES_SECTION,
  ...PROCESS_SECTION,
  ...BLOG_SECTION,
  ...FOOTER_LINKS,
  ...MOBILE_MENU,
  ...HOME_PAGE,
  ...CONTACT_PAGE,
  ...ABOUT_PAGE,
  ...SERVICES_PAGE,
  ...PROCESS_PAGE,
  ...ADMIN_LINKS,
  ...MODAL_LINKS,
  ...CHAT_WIDGET,
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * دریافت تمام Link IDs
 */
export function getAllLinkIds(): string[] {
  const ids: string[] = [];
  
  const addIds = (obj: any) => {
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        ids.push(value);
      } else if (typeof value === 'function') {
        // Skip functions
      }
    });
  };

  addIds(NAVBAR_LINKS);
  addIds(HERO_BUTTONS);
  addIds(SERVICES_SECTION);
  addIds(PROCESS_SECTION);
  addIds(BLOG_SECTION);
  addIds(FOOTER_LINKS);
  addIds(MOBILE_MENU);
  addIds(HOME_PAGE);
  addIds(CONTACT_PAGE);
  addIds(ABOUT_PAGE);
  addIds(SERVICES_PAGE);
  addIds(PROCESS_PAGE);
  addIds(ADMIN_LINKS);
  addIds(MODAL_LINKS);
  addIds(CHAT_WIDGET);

  return [...new Set(ids)]; // Remove duplicates
}

/**
 * شمارش تمام Link IDs
 */
export function countAllLinkIds(): number {
  return getAllLinkIds().length;
}

/**
 * نمایش آماری Link IDs
 */
export function getLinkIdStatistics() {
  return {
    navbar: Object.keys(NAVBAR_LINKS).length,
    hero: Object.keys(HERO_BUTTONS).length,
    services: Object.keys(SERVICES_SECTION).length,
    blog: Object.keys(BLOG_SECTION).length,
    footer: Object.keys(FOOTER_LINKS).length,
    mobileMenu: Object.keys(MOBILE_MENU).length,
    home: Object.keys(HOME_PAGE).length,
    contact: Object.keys(CONTACT_PAGE).length,
    about: Object.keys(ABOUT_PAGE).length,
    servicesPage: Object.keys(SERVICES_PAGE).length,
    processPage: Object.keys(PROCESS_PAGE).length,
    admin: Object.keys(ADMIN_LINKS).length,
    modal: Object.keys(MODAL_LINKS).length,
    chatWidget: Object.keys(CHAT_WIDGET).length,
    total: Object.keys(ALL_LINK_IDS).length,
  };
}

// Export statistics
export const LINK_ID_STATS = getLinkIdStatistics();
