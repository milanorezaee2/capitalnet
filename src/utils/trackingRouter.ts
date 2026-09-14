// ─── Link Tracking + Routing Integration Utilities ──────────────────────────────

import { navigateToPath, type RouteParams } from '../router/routes';
import { generateLinkId } from '../lib/linkTracking';

/**
 * Navigate with automatic link tracking
 */
export function navigateWithTracking(
  params: RouteParams,
  trackingLabel?: string
): void {
  // اگر link_id موجود نیست، یکی تولید کن
  if (!params.linkId) {
    params.linkId = generateLinkId();
  }

  // Add tracking label if provided
  if (trackingLabel && !params.queryParams) {
    params.queryParams = {};
  }
  if (trackingLabel && params.queryParams) {
    params.queryParams.source = trackingLabel;
  }

  navigateToPath(params);
}

/**
 * Create tracked navigation handler
 */
export function createTrackedNavigationHandler(
  trackingLabel?: string
) {
  return (params: RouteParams) => {
    navigateWithTracking(params, trackingLabel);
  };
}

/**
 * Extract tracking data from current URL
 */
export function getUrlTrackingData() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return {
    linkId: params.get('v') || params.get('link_id'),
    source: params.get('source'),
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
}

/**
 * Preserve tracking params when navigating
 */
export function preserveTrackingParams(params: RouteParams): RouteParams {
  const trackingData = getUrlTrackingData();
  
  if (!trackingData?.linkId) {
    return params;
  }

  return {
    ...params,
    linkId: trackingData.linkId,
    queryParams: {
      ...params.queryParams,
      ...(trackingData.source && { source: trackingData.source }),
      ...(trackingData.utm_source && { utm_source: trackingData.utm_source }),
      ...(trackingData.utm_medium && { utm_medium: trackingData.utm_medium }),
      ...(trackingData.utm_campaign && { utm_campaign: trackingData.utm_campaign }),
    },
  };
}

/**
 * Create link tracking context for analytics
 */
export function createLinkTrackingContext(pageType: string, elementName: string) {
  const trackingData = getUrlTrackingData();
  
  return {
    pageType,
    elementName,
    linkId: trackingData?.linkId || generateLinkId(),
    source: trackingData?.source || 'direct',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log tracking event
 */
export function logTrackingEvent(
  event: string,
  data: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', event, data);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[TRACKING] ${event}:`, data);
  }
}
