// ─── Enterprise Service Content Store ────────────────────────────────────────
// Persists the main /services page content to localStorage so that
// AdminServicesPage edits are reflected live on the public ServicePage.

import type { EnterpriseServicePageContent } from '../types/enterprise';
import { enterpriseServiceContent } from './enterpriseContent';

const KEY = 'cn_enterprise_service_content_v1';

/** Read saved content — fallback to static default if nothing saved yet */
export function loadServiceContent(): EnterpriseServicePageContent {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return JSON.parse(JSON.stringify(enterpriseServiceContent));
    const parsed = JSON.parse(raw) as EnterpriseServicePageContent;
    // Back-fill new fields added after the data was first saved
    if (!parsed.servicesOverview) {
      parsed.servicesOverview = JSON.parse(JSON.stringify(enterpriseServiceContent.servicesOverview));
    }
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(enterpriseServiceContent));
  }
}

/** Persist content and notify other tabs/components via storage event */
export function saveServiceContent(content: EnterpriseServicePageContent): void {
  localStorage.setItem(KEY, JSON.stringify(content));
  // Dispatch a storage event so same-tab listeners (Navbar, ServicePage) also update
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
}

/** Reset to static defaults */
export function resetServiceContent(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
}
