// ─── Router Configuration (Path-based SEO-optimized routing) ─────────────────

import { getPageRouteLinkId } from '../constants/linkIds';
import { getLang, withLangPrefix, stripLangPrefix } from '../i18n';

export type PageKey = 'home' | 'services' | 'service-detail' | 'process' | 'blog' | 'blog-post' | 'category' | 'tag' | 'author' | 'contact' | 'about' | 'evaluation';
export type BlogCategory = 'investment' | 'strategy' | 'case-study' | 'market-analysis' | 'negotiation' | 'financial-modeling';
export type BlogFilter = BlogCategory | 'all';

export interface RouteParams {
  page: PageKey;
  postSlug?: string;
  serviceSlug?: string;
  category?: BlogFilter;
  categoryName?: string;
  tagName?: string;
  authorName?: string;
  anchor?: string;
  linkId?: string;
  queryParams?: Record<string, string>;
}

function normalizeRoutePath(pathValue: string): string {
  const cleaned = pathValue.replace(/^\/|\/$/g, '');
  if (!cleaned || cleaned === 'fa') return '';
  return cleaned.startsWith('fa/') ? cleaned.slice(3) : cleaned;
}

export function parsePathname(): RouteParams {
  if (typeof window === 'undefined') return { page: 'home' };

  const hash = window.location.hash.replace(/^#/, '').replace(/^\//, '');
  // پیشوند زبان را جدا می‌کنیم تا مسیر صفحه درست تشخیص داده شود (/en/blog → /blog)
  const { path } = stripLangPrefix(window.location.pathname);
  const pathname = normalizeRoutePath(path);
  const search = window.location.search;
  
  // Parse query parameters
  const queryParams: Record<string, string> = {};
  if (search) {
    new URLSearchParams(search).forEach((value, key) => {
      queryParams[key] = value;
    });
  }

  const resolvedLinkId = queryParams.v || queryParams.link_id;
  
  // استفاده از pathname اول، hash دوم (برای backward compatibility)
  const pathToParse = pathname || normalizeRoutePath(hash);
  const parts = pathToParse.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'home', queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined };

  const [firstPart, secondPart, ...rest] = parts;

  const baseRoutes: Record<string, PageKey> = {
    'services': 'services',
    'process': 'process',
    'blog': 'blog',
    'contact': 'contact',
    'about': 'about',
    'evaluation': 'evaluation',
  };

  if (firstPart === 'blog') {
    if (!secondPart) return { page: 'blog', category: 'all', queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined };
    
    if (secondPart === 'category' && rest[0]) {
      return { 
        page: 'category', 
        categoryName: rest[0],
        category: rest[0] as BlogFilter,
        linkId: resolvedLinkId,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };
    }
    
    if (secondPart === 'tag' && rest[0]) {
      return { 
        page: 'tag', 
        tagName: rest[0],
        linkId: resolvedLinkId,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };
    }
    
    if (secondPart === 'author' && rest[0]) {
      return { 
        page: 'author', 
        authorName: decodeURIComponent(rest[0]),
        linkId: resolvedLinkId,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };
    }
    
    return { 
      page: 'blog-post', 
      postSlug: secondPart,
      linkId: resolvedLinkId,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    };
  }

  if (firstPart === 'services') {
    if (!secondPart) {
      return {
        page: 'services',
        linkId: resolvedLinkId,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };
    }
    return {
      page: 'service-detail',
      serviceSlug: secondPart,
      linkId: resolvedLinkId,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    };
  }

  if (baseRoutes[firstPart]) {
    return {
      page: baseRoutes[firstPart],
      linkId: resolvedLinkId,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    };
  }

  return { page: 'home', queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined };
}

export function resolveRouteLinkId(params: RouteParams): string | undefined {
  return getPageRouteLinkId(params.page, {
    category: params.categoryName || params.category,
    slug: params.postSlug,
    tag: params.tagName,
    author: params.authorName,
  });
}

export function buildPath(params: RouteParams): string {
  const { page, postSlug, categoryName, tagName, authorName, linkId, queryParams } = params;

  const basePath = '';
  let path = basePath;
  
  switch (page) {
    case 'home':
      path = '/';
      break;
    case 'services':
      path = `${basePath}/services`;
      break;
    case 'service-detail':
      path = `${basePath}/services/${params.serviceSlug || ''}`.replace(/\/$/, '');
      break;
    case 'process':
      path = `${basePath}/process`;
      break;
    case 'blog':
      path = `${basePath}/blog`;
      break;
    case 'blog-post':
      path = `${basePath}/blog/${postSlug || ''}`.replace(/\/$/, '');
      break;
    case 'category':
      path = `${basePath}/blog/category/${categoryName || ''}`.replace(/\/$/, '');
      break;
    case 'tag':
      path = `${basePath}/blog/tag/${tagName || ''}`.replace(/\/$/, '');
      break;
    case 'author':
      path = `${basePath}/blog/author/${authorName ? encodeURIComponent(authorName) : ''}`.replace(/\/$/, '');
      break;
    case 'contact':
      path = `${basePath}/contact`;
      break;
    case 'about':
      path = `${basePath}/about`;
      break;
    case 'evaluation':
      path = `${basePath}/evaluation`;
      break;
    default:
      path = basePath;
  }

  // ── SEO: پارامترهای tracking (v، link_id) به URL اضافه نمی‌شوند.
  // این پارامترها فقط برای analytics داخلی بودند و باعث Duplicate Content در Google می‌شدند.
  // سیستم tracking از طریق data attribute یا analytics event انجام می‌شود نه URL parameter.
  // اگر queryParams خارجی (غیر tracking) داده شده باشند، آن‌ها را نگه می‌داریم.
  const externalParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(queryParams || {})) {
    if (k !== 'v' && k !== 'link_id') {
      externalParams[k] = v;
    }
  }

  if (Object.keys(externalParams).length > 0) {
    const queryString = new URLSearchParams(externalParams).toString();
    path = `${path}?${queryString}`;
  }

  // linkId و resolvedLinkId برای backward-compat خوانده می‌شوند ولی به URL اضافه نمی‌شوند.
  void (linkId || resolveRouteLinkId(params));

  // ── پیشوند زبان: در حالت انگلیسی مسیرها زیر /en ساخته می‌شوند (/en/blog)
  return withLangPrefix(path, getLang());
}

export function navigateToPath(params: RouteParams): void {
  const path = buildPath(params);
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function getCurrentPath(): string {
  const pathname = window.location.pathname;
  if (pathname === '/') return '/';
  if (pathname.startsWith('/')) return pathname;
  return pathname || '/';
}
