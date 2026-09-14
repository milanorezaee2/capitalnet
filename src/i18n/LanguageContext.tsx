// ─── Language Context ────────────────────────────────────────────────────────
// اتصال مخزن زبان (store) به درخت React. با تغییر زبان، کل درخت دوباره رندر
// می‌شود و همهٔ فراخوانی‌های t() مقدار جدید را برمی‌گردانند.

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { t as translate } from './translate';
import {
  getLang,
  getDir,
  subscribeLanguage,
  setLang as storeSetLang,
  initLanguage,
  otherLanguage,
  langFromPathname,
  type Language,
  type Direction,
} from './store';

export type { Language, Direction } from './store';

interface LanguageContextValue {
  /** زبان فعال */
  lang: Language;
  /** جهت چیدمان: rtl برای فارسی، ltr برای انگلیسی */
  dir: Direction;
  /** تابع ترجمه — t('nav.services') یا t('خدمات') */
  t: typeof translate;
  /** تغییر مستقیم زبان */
  setLanguage: (lang: Language) => void;
  /** جابه‌جایی بین فارسی و انگلیسی */
  toggleLanguage: () => void;
  /** آیا جهت فعلی راست‌به‌چپ است؟ */
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fa',
  dir: 'rtl',
  t: translate,
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRtl: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setCurrentLang] = useState<Language>(() => initLanguage());

  // تغییر زبان از هر نقطه‌ای از برنامه (مثلاً دکمه‌ی تغییر زبان)
  useEffect(() => subscribeLanguage(setCurrentLang), []);

  // دکمه‌های جلو/عقب مرورگر بین /en و /fa
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const fromPath = langFromPathname(window.location.pathname);
      if (fromPath && fromPath !== getLang()) {
        storeSetLang(fromPath, { updateUrl: false });
      } else {
        setCurrentLang(getLang());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    storeSetLang(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    storeSetLang(otherLanguage(getLang()));
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const active = lang;
    return {
      lang: active,
      dir: getDir(),
      t: translate,
      setLanguage,
      toggleLanguage,
      isRtl: active === 'fa',
    };
  }, [lang, setLanguage, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export default LanguageProvider;
