// ─── Link ID Helper Functions ─────────────────────────────────────────────────

import {
  NAVBAR_LINKS,
  HERO_BUTTONS,
  SERVICES_SECTION,
  BLOG_SECTION,
  FOOTER_LINKS,
  MOBILE_MENU,
  HOME_PAGE,
  CONTACT_PAGE,
  ABOUT_PAGE,
  SERVICES_PAGE,
  PROCESS_PAGE,
  ADMIN_LINKS,
  MODAL_LINKS,
  CHAT_WIDGET,
  BLOG_PAGE_CATEGORIES,
  BLOG_POST_PAGE,
  ARCHIVE_PAGES,
  BLOG_PAGE,
  type LinkIdStats,
} from '../constants/linkIds';

/**
 * Helper برای دریافت Link ID بر اساس سال و موقعیت
 */
export const getLinkId = {
  // NAVBAR
  navbar: (page: string) => {
    const key = `${page.toUpperCase().replace('-', '_')}`;
    return (NAVBAR_LINKS as any)[key] || 'navbar-unknown';
  },

  // HERO
  hero: (action: 'primary' | 'secondary' | 'scroll') => {
    const map = {
      primary: HERO_BUTTONS.CTA_PRIMARY,
      secondary: HERO_BUTTONS.CTA_SECONDARY,
      scroll: HERO_BUTTONS.SCROLL_DOWN,
    };
    return map[action];
  },

  // SERVICES
  service: (service: 'vc-ready' | 'matching' | 'negotiation') => {
    const map = {
      'vc-ready': SERVICES_SECTION.VC_READY,
      'matching': SERVICES_SECTION.INVESTOR_MATCHING,
      'negotiation': SERVICES_SECTION.NEGOTIATION,
    };
    return map[service];
  },

  // BLOG
  blogCategory: (category: string) => {
    const key = `BLOG_PAGE_${category.toUpperCase().replace('-', '_')}`;
    return (BLOG_PAGE_CATEGORIES as any)[key] || 'blog-category-unknown';
  },

  blogPost: (index: number) => BLOG_SECTION.POST_GRID(index),

  // FOOTER
  footerCategory: (category: string) => {
    const key = `BLOG_${category.toUpperCase().replace('-', '_')}`;
    return (FOOTER_LINKS as any)[key] || 'footer-blog-unknown';
  },

  // MOBILE MENU
  mobileMenu: (item: string) => {
    const key = item.toUpperCase().replace('-', '_');
    return (MOBILE_MENU as any)[key] || 'mobile-menu-unknown';
  },

  // HOME PAGE
  homeBlogFeatured: (index: number) => HOME_PAGE.BLOG_FEATURED(index),

  // BLOG POST PAGE
  blogPostRelated: (index: number) => BLOG_POST_PAGE.RELATED_POST(index),

  // ARCHIVE PAGES
  archivePost: (type: 'category' | 'tag' | 'author', name: string, index: number) => 
    ARCHIVE_PAGES.POST_ITEM(type, name, index),
};

/**
 * Print تمام Link IDs (برای debugging)
 */
export function printAllLinkIds(): void {
  const groups = {
    'NAVBAR': NAVBAR_LINKS,
    'HERO': HERO_BUTTONS,
    'SERVICES': SERVICES_SECTION,
    'BLOG': BLOG_SECTION,
    'FOOTER': FOOTER_LINKS,
    'MOBILE_MENU': MOBILE_MENU,
    'HOME': HOME_PAGE,
    'CONTACT': CONTACT_PAGE,
    'ABOUT': ABOUT_PAGE,
    'SERVICES_PAGE': SERVICES_PAGE,
    'PROCESS_PAGE': PROCESS_PAGE,
    'ADMIN': ADMIN_LINKS,
    'MODAL': MODAL_LINKS,
    'CHAT_WIDGET': CHAT_WIDGET,
  };

  Object.entries(groups).forEach(([group, links]) => {
    console.group(`📍 ${group}`);
    Object.entries(links).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.groupEnd();
  });
}

/**
 * Validate Link ID (آیا موجود است)
 */
export function isValidLinkId(id: string): boolean {
  const allIds = getAllLinkIds();
  return allIds.includes(id);
}

/**
 * دریافت تمام Link IDs
 */
export function getAllLinkIds(): string[] {
  const allIds = new Set<string>();

  const extractIds = (obj: any) => {
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        allIds.add(value);
      }
    });
  };

  extractIds(NAVBAR_LINKS);
  extractIds(HERO_BUTTONS);
  extractIds(SERVICES_SECTION);
  extractIds(BLOG_SECTION);
  extractIds(FOOTER_LINKS);
  extractIds(MOBILE_MENU);
  extractIds(HOME_PAGE);
  extractIds(CONTACT_PAGE);
  extractIds(ABOUT_PAGE);
  extractIds(SERVICES_PAGE);
  extractIds(PROCESS_PAGE);
  extractIds(ADMIN_LINKS);
  extractIds(MODAL_LINKS);
  extractIds(CHAT_WIDGET);
  extractIds(BLOG_PAGE_CATEGORIES);
  extractIds(BLOG_POST_PAGE);

  return Array.from(allIds);
}

/**
 * نمایش گزارش Link IDs
 */
export function generateLinkIdReport(): {
  total: number;
  byCategory: Record<string, number>;
  list: string[];
} {
  const report = {
    total: 0,
    byCategory: {
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
    },
    list: getAllLinkIds(),
  };

  report.total = Object.values(report.byCategory).reduce((a, b) => a + b, 0);
  return report;
}

/**
 * Search Link IDs
 */
export function searchLinkIds(query: string): string[] {
  const allIds = getAllLinkIds();
  return allIds.filter(id => 
    id.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Export Link IDs as JSON (برای export به analytics)
 */
export function exportLinkIdsJson() {
  return JSON.stringify({
    navbar: NAVBAR_LINKS,
    hero: HERO_BUTTONS,
    services: SERVICES_SECTION,
    blog: BLOG_SECTION,
    footer: FOOTER_LINKS,
    mobileMenu: MOBILE_MENU,
    home: HOME_PAGE,
    contact: CONTACT_PAGE,
    about: ABOUT_PAGE,
    servicesPage: SERVICES_PAGE,
    processPage: PROCESS_PAGE,
    admin: ADMIN_LINKS,
    modal: MODAL_LINKS,
    chatWidget: CHAT_WIDGET,
  }, null, 2);
}

/**
 * Get category name from Link ID
 */
export function getCategoryFromLinkId(id: string): string {
  if (id.startsWith('navbar-')) return 'navbar';
  if (id.startsWith('hero-')) return 'hero';
  if (id.startsWith('services-')) return 'services';
  if (id.startsWith('blog-')) return 'blog';
  if (id.startsWith('footer-')) return 'footer';
  if (id.startsWith('mobile-')) return 'mobile';
  if (id.startsWith('home-')) return 'home';
  if (id.startsWith('contact-')) return 'contact';
  if (id.startsWith('about-')) return 'about';
  if (id.startsWith('admin-')) return 'admin';
  if (id.startsWith('modal-')) return 'modal';
  if (id.startsWith('chat-')) return 'chat';
  return 'other';
}

/**
 * Debug Link ID: نمایش تمام اطلاعات
 */
export function debugLinkId(id: string) {
  const isValid = isValidLinkId(id);
  const category = getCategoryFromLinkId(id);
  
  return {
    id,
    isValid,
    category,
    description: `Link ID: ${id} (Category: ${category})`,
  };
}
