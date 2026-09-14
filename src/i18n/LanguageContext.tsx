import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import fa from './fa';
import en from './en';
import type { Translations } from './fa';

export type Language = 'fa' | 'en';

interface LanguageContextValue {
  lang: Language;
  t: Translations;
  dir: 'rtl' | 'ltr';
  toggleLanguage: () => void;
}

const translations: Record<Language, Translations> = { fa, en };

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fa',
  t: fa,
  dir: 'rtl',
  toggleLanguage: () => {},
});

const STORAGE_KEY = 'cn_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'fa') return saved;
    } catch {}
    return 'fa';
  });

  const dir: 'rtl' | 'ltr' = lang === 'fa' ? 'rtl' : 'ltr';

  // Sync dir on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang, dir]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      const next: Language = prev === 'fa' ? 'en' : 'fa';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const value: LanguageContextValue = {
    lang,
    t: translations[lang],
    dir,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
