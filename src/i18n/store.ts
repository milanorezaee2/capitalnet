// ─── Language Store ──────────────────────────────────────────────────────────
// تنها منبع حقیقت برای زبان فعال سایت.
//
// چرا خارج از React؟
// چون توابع ساده‌ای مثل buildPath (مسیریابی)، قالب‌بندی اعداد/تاریخ و ثابت‌های
// سطح ماژول هم باید به زبان فعلی دسترسی داشته باشند. کامپوننت‌ها از طریق
// هوک useLanguage به این مخزن متصل می‌شوند و با تغییر زبان دوباره رندر می‌شوند.

export type Language = 'fa' | 'en';
export type Direction = 'rtl' | 'ltr';

export const LANGUAGES: readonly Language[] = ['fa', 'en'] as const;
export const DEFAULT_LANGUAGE: Language = 'fa';
export const STORAGE_KEY = 'cn_lang';

/** پیشوند نشانی هر زبان — فارسی روی ریشه، انگلیسی زیر /en */
export const LANGUAGE_PATH_PREFIX: Record<Language, string> = {
  fa: '',
  en: '/en',
};

export const LANGUAGE_META: Record<Language, {
  label: string;
  nativeLabel: string;
  dir: Direction;
  htmlLang: string;
  locale: string;
  prefix: string;
}> = {
  fa: { label: 'فارسی', nativeLabel: 'FA', dir: 'rtl', htmlLang: 'fa', locale: 'fa_IR', prefix: '' },
  en: { label: 'English', nativeLabel: 'EN', dir: 'ltr', htmlLang: 'en', locale: 'en_US', prefix: '/en' },
};

let currentLang: Language = DEFAULT_LANGUAGE;
let initialized = false;
const listeners = new Set<(lang: Language) => void>();

// ── تشخیص زبان ───────────────────────────────────────────────────────────────

export function isLanguage(value: unknown): value is Language {
  return value === 'fa' || value === 'en';
}

/** زبان را از روی پیشوند نشانی تشخیص می‌دهد: /en/blog → en */
export function langFromPathname(pathname: string): Language | null {
  if (!pathname) return null;
  const clean = pathname.split('?')[0].split('#')[0];
  if (/^\/en(\/|$)/i.test(clean)) return 'en';
  if (/^\/fa(\/|$)/i.test(clean)) return 'fa';
  return null;
}

/** پیشوند زبان را از نشانی جدا می‌کند: /en/blog → { path: '/blog', lang: 'en' } */
export function stripLangPrefix(pathname: string): { path: string; lang: Language } {
  const lang = langFromPathname(pathname);
  if (!lang) return { path: pathname, lang: DEFAULT_LANGUAGE };
  const stripped = pathname.replace(/^\/(?:en|fa)(?=\/|$)/i, '');
  return { path: stripped === '' ? '/' : stripped, lang };
}

/** نشانی را با پیشوند زبان فعال می‌سازد: /blog + en → /en/blog */
export function withLangPrefix(path: string, lang: Language = currentLang): string {
  const bare = (path || '/').replace(/^\/(?:en|fa)(?=\/|$)/i, '');
  const prefix = LANGUAGE_PATH_PREFIX[lang];
  if (!prefix) return bare === '' ? '/' : bare;
  const clean = bare === '/' ? '' : bare;
  return `${prefix}${clean}`;
}

function readInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  // ۱. پیشوند نشانی بالاترین اولویت را دارد (برای سئو و لینک‌های مستقیم)
  const fromPath = langFromPathname(window.location.pathname);
  if (fromPath) return fromPath;
  // ۲. انتخاب قبلی کاربر
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch { /* localStorage ممکن است در دسترس نباشد */ }
  return DEFAULT_LANGUAGE;
}

export function getLang(): Language {
  if (!initialized) {
    currentLang = readInitialLanguage();
    initialized = true;
  }
  return currentLang;
}

export function getDir(): Direction {
  return LANGUAGE_META[getLang()].dir;
}

export function getHtmlLang(): string {
  return LANGUAGE_META[getLang()].htmlLang;
}

export function getLocale(): string {
  return LANGUAGE_META[getLang()].locale;
}

// ── تغییر زبان ───────────────────────────────────────────────────────────────

function applyDocumentAttributes(lang: Language): void {
  if (typeof document === 'undefined') return;
  const meta = LANGUAGE_META[lang];
  const root = document.documentElement;
  root.setAttribute('dir', meta.dir);
  root.setAttribute('lang', meta.htmlLang);
  root.dataset.lang = lang;
}

/**
 * تغییر زبان سایت.
 * - زبان را در localStorage ذخیره می‌کند
 * - جهت و زبان تگ <html> را به‌روزرسانی می‌کند
 * - نشانی فعلی را به معادل همان صفحه در زبان جدید می‌برد (برای سئو)
 */
export function setLang(lang: Language, options?: { updateUrl?: boolean }): void {
  if (!isLanguage(lang)) return;
  const previous = getLang();
  initialized = true;
  currentLang = lang;

  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch { /* ignore */ }

  applyDocumentAttributes(lang);

  if (options?.updateUrl !== false && typeof window !== 'undefined') {
    const { pathname, search, hash } = window.location;
    // پنل ادمین (مسیر مخفی) همیشه با نشانی ثابت خودش می‌ماند
    const isAdminRoute = /^\/(?:en\/|fa\/)?cp-secure(?:\/|$)/.test(pathname);
    if (!isAdminRoute) {
      const nextPath = withLangPrefix(pathname, lang);
      if (nextPath !== pathname) {
        window.history.pushState(null, '', `${nextPath}${search}${hash}`);
      }
    }
  }

  if (previous !== lang) {
    for (const listener of listeners) {
      try { listener(lang); } catch { /* یک شنونده‌ی خطادار نباید بقیه را متوقف کند */ }
    }
  }
}

/** عضویت برای تغییر زبان — مورد استفاده‌ی هوک useLanguage */
export function subscribeLanguage(listener: (lang: Language) => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** مقداردهی اولیهٔ ویژگی‌های سند (یک‌بار در شروع برنامه صدا زده می‌شود) */
export function initLanguage(): Language {
  const lang = getLang();
  applyDocumentAttributes(lang);
  return lang;
}

/** معادلِ زبانِ دیگر — برای دکمه‌ی تغییر زبان */
export function otherLanguage(lang: Language = getLang()): Language {
  return lang === 'fa' ? 'en' : 'fa';
}
