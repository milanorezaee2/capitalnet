// ─── Translate ───────────────────────────────────────────────────────────────
// تابع ترجمهٔ سراسری سایت.
//
// تابع t دو نوع ورودی را می‌پذیرد:
//   1. کلیدِ واژه‌نامه (مسیر نقطه‌ای):  t('nav.services')    → 'خدمات' / 'Services'
//   2. متنِ مبدأ فارسی:                t('خدمات')            → 'خدمات' / 'Services'
//
// حالت دوم اجازه می‌دهد هزاران متنی که از قبل در کامپوننت‌ها نوشته شده‌اند،
// بدون جابه‌جایی محتوا و بدون تغییر ساختار، تنها با بسته‌بندی در t(...) دو زبانه شوند.
// اگر ترجمه‌ای برای متنی پیدا نشود، همان متن اصلی برگردانده می‌شود (هرگز چیزی خالی نمی‌ماند).

import faDictionary from './fa';
import enDictionary from './en';
import sourceEn from './source-en';
import { getLang, type Language } from './store';
import { localizeDigits } from './format';

const dictionaries: Record<Language, Record<string, unknown>> = {
  fa: faDictionary as unknown as Record<string, unknown>,
  en: enDictionary as unknown as Record<string, unknown>,
};

/** جست‌وجوی مقدار در واژه‌نامه با مسیر نقطه‌ای: 'nav.services' */
function lookupPath(dictionary: Record<string, unknown>, path: string): unknown {
  if (!path || path.indexOf('.') === -1) return undefined;
  let current: unknown = dictionary;
  for (const part of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

const INTERPOLATION = /\{(\w+)\}/g;

function interpolate(template: string, vars?: Record<string, unknown>): string {
  if (!vars) return template;
  return template.replace(INTERPOLATION, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

/** نرمال‌سازی کلید برای جست‌وجو در نقشهٔ ترجمه‌ها */
function normalizeKey(key: string): string {
  return key.replace(/\s+/g, ' ').trim();
}

// ─── ثبت ترجمه‌های گمشده (فقط در حالت توسعه) ──────────────────────────────────
const missingTranslations = new Set<string>();

function isDev(): boolean {
  try {
    // @ts-expect-error — import.meta.env فقط در محیط Vite تعریف می‌شود
    return Boolean(import.meta.env && import.meta.env.DEV);
  } catch {
    return false;
  }
}

/** فهرست متن‌هایی که هنوز ترجمهٔ انگلیسی ندارند (برای تکمیل تدریجی ترجمه‌ها) */
export function getMissingTranslations(): string[] {
  return [...missingTranslations];
}

export function clearMissingTranslations(): void {
  missingTranslations.clear();
}

/**
 * ترجمهٔ یک کلید یا متن.
 *
 * @example
 *   t('nav.services')                 // 'Services'
 *   t('درخواست ارزیابی')               // 'Request Evaluation'
 *   t('خوش‌آمدید {name}', { name })     // 'Welcome John'
 */
export function t(key: string, vars?: Record<string, unknown>): string {
  if (key == null) return '';
  const source = typeof key === 'string' ? key : String(key);
  const lang = getLang();

  // ۱. کلیدِ واژه‌نامه
  const fromDictionary = lookupPath(dictionaries[lang], source);
  if (typeof fromDictionary === 'string') return interpolate(fromDictionary, vars);

  // ۲. متنِ مبدأ
  if (lang === 'fa') return interpolate(source, vars);

  const translated = sourceEn[normalizeKey(source)];
  if (translated == null) {
    if (isDev() && /[\u0600-\u06FF]/.test(source)) missingTranslations.add(normalizeKey(source));
    // ترجمه‌ای وجود ندارد — متن اصلی را برمی‌گردانیم تا چیزی خالی نماند
    return interpolate(source, vars);
  }
  return interpolate(translated, vars);
}

// ─── ترجمهٔ عمیقِ داده‌ها ────────────────────────────────────────────────────
// ثابت‌های سطح ماژول یک‌بار ارزیابی می‌شوند و با تغییر زبان به‌روز نمی‌شوند.
// deepTranslate این مشکل را حل می‌کند: داده‌ها به زبان مبدأ (فارسی) باقی می‌مانند
// و هنگام رندر ترجمه می‌شوند، بنابراین تغییر زبان بلافاصله اعمال می‌شود.

/** کلیدهایی که مقدارشان شناسه/مسیر است و نباید ترجمه شود */
const NON_TRANSLATABLE_KEYS = new Set([
  'id', 'slug', 'key', 'type', 'href', 'url', 'path', 'src', 'to',
  'icon', 'color', 'email', 'phone', 'image', 'imageUrl', 'avatar', 'logo',
  'className', 'style', 'pattern', 'variant', 'size', 'align', 'dir', 'lang',
  'locale', 'currency', 'created_at', 'updated_at', 'date', 'status',
]);

const PERSIAN_DIGIT = /[۰-۹٠-٩]/;

/**
 * ترجمهٔ بازگشتیِ یک ساختار داده (رشته، آرایه یا شیء).
 *
 * @example
 *   const CATEGORIES = [{ name: 'سرمایه‌گذاری' }];
 *   deepTranslate(CATEGORIES)  // [{ name: 'Investment' }]
 */
export function deepTranslate<T>(value: T, options?: { skipKeys?: Set<string> }): T {
  const skip = options?.skipKeys ?? NON_TRANSLATABLE_KEYS;
  return translateNode(value, skip, new WeakSet<object>());
}

function translateNode(value: unknown, skip: Set<string>, seen: WeakSet<object>): any {
  if (typeof value === 'string') {
    if (!value) return value;
    const translated = t(value);
    // در حالت انگلیسی ارقام فارسی را هم به لاتین تبدیل می‌کنیم
    return getLang() === 'fa' ? translated : localizeDigits(translated);
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return value;
    seen.add(value);
    return value.map(item => translateNode(item, skip, seen));
  }
  if (value && typeof value === 'object') {
    if (value instanceof Date) return value;
    if (seen.has(value as object)) return value;
    seen.add(value as object);
    const out: Record<string, unknown> = {};
    for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
      out[key] = skip.has(key) ? childValue : translateNode(childValue, skip, seen);
    }
    return out;
  }
  if (typeof value === 'number') return value;
  return value;
}

/** بررسی وجود ترجمه برای یک متن (برای استفاده در تست‌ها و ابزارها) */
export function hasTranslation(key: string): boolean {
  const normalized = normalizeKey(key);
  return typeof lookupPath(dictionaries.en, normalized) === 'string'
    || Object.prototype.hasOwnProperty.call(sourceEn, normalized);
}

/** ترجمهٔ صریح به یک زبان مشخص — بدون وابستگی به زبان فعال (برای سئو و متadata) */
export function translateTo(lang: Language, key: string, vars?: Record<string, unknown>): string {
  const fromDictionary = lookupPath(dictionaries[lang], key);
  if (typeof fromDictionary === 'string') return interpolate(fromDictionary, vars);
  if (lang === 'fa') return interpolate(key, vars);
  const translated = sourceEn[normalizeKey(key)];
  return interpolate(translated ?? key, vars);
}

export default t;
