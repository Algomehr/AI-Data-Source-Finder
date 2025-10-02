import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { fa } from '../locales/fa';
import { en } from '../locales/en';

type Locale = 'fa' | 'en';
export type TranslationKey = keyof typeof fa;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const translations = { fa, en };

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('fa');

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.title = locale === 'fa' ? 'هوشمند کاشف داده' : 'AI Data Scout';
  }, [locale]);

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations['en'][key];
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
