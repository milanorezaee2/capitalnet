// ─── useLinkTracking Hook ─────────────────────────────────────────────────────

import { useEffect, useCallback } from 'react';
import { generateLinkId, trackLinkClick, getLinkIdFromUrl } from '../lib/linkTracking';

export interface UseLinkTrackingOptions {
  autoTrack?: boolean;
  customLinkId?: string;
}

/**
 * Hook برای tracking لینک‌های کلیک شده
 */
export function useLinkTracking(options: UseLinkTrackingOptions = {}) {
  const { autoTrack = true, customLinkId } = options;

  const generateTrackedLink = useCallback((path: string, additionalParams?: Record<string, string>) => {
    const linkId = customLinkId || generateLinkId();
    const params = new URLSearchParams({
      link_id: linkId,
      ...(additionalParams || {}),
    });

    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}${params.toString()}`;
  }, [customLinkId]);

  const handleLinkClick = useCallback((path: string, linkId?: string) => {
    const id = linkId || customLinkId || getLinkIdFromUrl();
    if (id) {
      trackLinkClick(id, path);
    }
  }, [customLinkId]);

  useEffect(() => {
    if (!autoTrack) return;

    // Auto-track all internal link clicks
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

      const linkId = new URLSearchParams(new URL(href, window.location.origin).search).get('link_id');
      if (linkId) {
        trackLinkClick(linkId, href);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [autoTrack]);

  return {
    generateTrackedLink,
    handleLinkClick,
    currentLinkId: getLinkIdFromUrl(),
  };
}

/**
 * Hook برای tracking page views با link_id
 */
export function useLinkPageTracking() {
  useEffect(() => {
    const linkId = getLinkIdFromUrl();
    if (linkId && window.gtag) {
      window.gtag('event', 'page_view_tracked', {
        link_id: linkId,
        page_path: window.location.pathname,
      });
    }
  }, []);
}
