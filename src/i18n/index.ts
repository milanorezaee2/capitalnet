// ─── i18n Public API ─────────────────────────────────────────────────────────

export { LanguageProvider, useLanguage } from './LanguageContext';
export type { Language, Direction } from './store';
export type { Translations } from './fa';

// تابع ترجمه و ابزارهای کمکی آن
export {
  t,
  deepTranslate,
  translateTo,
  hasTranslation,
  getMissingTranslations,
  clearMissingTranslations,
} from './translate';

// مخزن زبان و توابع مسیریابیِ مرتبط با زبان
export {
  getLang,
  getDir,
  getLocale,
  getHtmlLang,
  setLang,
  subscribeLanguage,
  initLanguage,
  isLanguage,
  otherLanguage,
  langFromPathname,
  stripLangPrefix,
  withLangPrefix,
  LANGUAGE_META,
  LANGUAGE_PATH_PREFIX,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  STORAGE_KEY,
} from './store';

// بومی‌سازی اعداد و تاریخ
export {
  toLatinDigits,
  toPersianDigits,
  localizeDigits,
  localizeDate,
  formatNumber,
  formatCompact,
  formatDate,
  jalaliToGregorian,
  gregorianToJalali,
  PERSIAN_MONTH_NAMES,
  ENGLISH_MONTH_NAMES,
  d,
} from './format';
