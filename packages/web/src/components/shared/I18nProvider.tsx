'use client';

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'use-intl';
import { loadMessages, SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/messages';

export type { SupportedLocale };

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
});

export function useLocale() {
  return useContext(I18nContext);
}

function getSavedLocale(): SupportedLocale {
  if (typeof document === 'undefined') return 'en';
  // Try cookie first
  const match = document.cookie.match(/NEXT_LOCALE=([a-z]{2})/);
  if (match && SUPPORTED_LOCALES.includes(match[1] as SupportedLocale)) {
    return match[1] as SupportedLocale;
  }
  // Try localStorage
  try {
    const stored = localStorage.getItem('NEXT_LOCALE');
    if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
      return stored as SupportedLocale;
    }
  } catch {}
  return 'en';
}

function saveLocale(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
  try { localStorage.setItem('NEXT_LOCALE', locale); } catch {}
}


interface I18nProviderProps {
  defaultMessages: AbstractIntlMessages;
  children: React.ReactNode;
}

export function I18nProvider({ defaultMessages, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');
  const [messages, setMessages] = useState<AbstractIntlMessages>(defaultMessages);
  // On mount, load the saved locale's messages
  useEffect(() => {
    const saved = getSavedLocale();
    if (saved !== 'en') {
      loadMessages(saved).then((msgs) => {
        setLocaleState(saved);
        setMessages(msgs);
        document.documentElement.lang = saved;
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      }).catch(() => {});
    }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    saveLocale(newLocale);
    loadMessages(newLocale).then((msgs) => {
      setLocaleState(newLocale);
      setMessages(msgs);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    });
  }, []);

  const contextValue = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <I18nContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Brussels">
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
