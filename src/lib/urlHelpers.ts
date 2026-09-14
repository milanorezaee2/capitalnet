// ─── URL Helpers ──────────────────────────────────────────────────────────

export function normalizeExternalUrl(value: string | null | undefined): string {
  const raw = (value ?? '').toString().trim();
  if (!raw) return '';

  // disallow spaces and obviously malformed strings
  if (/\s/.test(raw)) return '';

  // preserve explicit protocols and safe URL schemes
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(raw)) {
    if (raw.startsWith('//')) {
      return `https:${raw}`;
    }
    return raw;
  }

  if (raw.startsWith('//')) {
    return `https:${raw}`;
  }

  const domainLike = /^([a-zA-Z\d](?:[a-zA-Z\d-]*[a-zA-Z\d])?\.)+[a-zA-Z]{2,}(\/.*)?$/;
  const ipLike = /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}(?:\/.*)?$/;
  const wwwLike = /^www\.[^\s\/]+(\.[^\s\/]+)+(\/.*)?$/;

  if (wwwLike.test(raw) || domainLike.test(raw) || ipLike.test(raw)) {
    return `https://${raw}`;
  }

  return '';
}
