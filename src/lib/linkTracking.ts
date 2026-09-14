// ─── Link Tracking System ─────────────────────────────────────────────────────

function toSeoFriendlySlug(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * SEO-friendly link ID generator.
 * Keeps the existing tracking flow intact while producing readable IDs.
 * Example: home, services, blog-post-seo, about
 */
export function generateLinkId(seed?: string): string {
  const slug = seed ? toSeoFriendlySlug(seed) : '';

  if (slug) {
    return slug;
  }

  const fallbackBase = typeof window !== 'undefined'
    ? toSeoFriendlySlug(window.location.pathname)
    : 'site-link';

  const base = fallbackBase || 'site-link';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, string>): string {
  const entries = Object.entries(params).filter(([, value]) => value);
  if (entries.length === 0) return '';
  
  const queryString = new URLSearchParams(params).toString();
  return `?${queryString}`;
}

/**
 * Add link_id to URL
 */
export function addLinkTracking(url: string, linkId?: string): string {
  const id = linkId || generateLinkId();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${id}`;
}

/**
 * Extract link_id from URL
 */
export function getLinkIdFromUrl(url?: string): string | null {
  if (!url) return null;

  const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return urlObj.searchParams.get('v') || urlObj.searchParams.get('link_id');
}

/**
 * Get all query parameters from current URL
 */
export function getCurrentQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return parseQueryParams(window.location.search);
}

/**
 * Build URL with link tracking
 */
export interface LinkOptions {
  linkId?: string;
  source?: string;
  campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  [key: string]: string | undefined;
}

export function buildTrackedLink(path: string, options: LinkOptions = {}): string {
  const { linkId, ...otherParams } = options;
  const id = linkId || generateLinkId();

  const params = new URLSearchParams({
    v: id,
    ...Object.fromEntries(
      Object.entries(otherParams).filter(([, v]) => v !== undefined) as Array<[string, string]>
    ),
  });

  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${params.toString()}`;
}

/**
 * Track link click (for analytics)
 */
export interface LinkClickEvent {
  linkId: string;
  path: string;
  source?: string;
  timestamp: number;
  referrer?: string;
}

export function trackLinkClick(linkId: string, path: string, source?: string): LinkClickEvent {
  const event: LinkClickEvent = {
    linkId,
    path,
    source: source || document.referrer || 'direct',
    timestamp: Date.now(),
  };

  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'link_click', {
      link_id: linkId,
      page_path: path,
      source: source,
    });
  }

  return event;
}

/**
 * Remove tracking parameters from URL
 */
export function removeTrackingParams(url: string): string {
  const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  urlObj.searchParams.delete('v');
  urlObj.searchParams.delete('link_id');
  urlObj.searchParams.delete('utm_source');
  urlObj.searchParams.delete('utm_medium');
  urlObj.searchParams.delete('utm_campaign');
  urlObj.searchParams.delete('source');
  
  const pathname = urlObj.pathname + urlObj.hash;
  const search = urlObj.search;
  
  return pathname + (search ? search : '');
}

/**
 * Get tracking info for analytics dashboard
 */
export interface TrackingInfo {
  linkId: string;
  path: string;
  source: string;
  timestamp: string;
}

export function getTrackingInfo(linkId?: string): TrackingInfo | null {
  const id = linkId || getLinkIdFromUrl(window.location.href);
  if (!id) return null;

  return {
    linkId: id,
    path: window.location.pathname,
    source: document.referrer || 'direct',
    timestamp: new Date().toISOString(),
  };
}
