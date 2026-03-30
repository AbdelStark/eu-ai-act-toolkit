'use client';

import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
] as const;

export type SupportedLocale = (typeof LANGUAGES)[number]['code'];

export const SUPPORTED_LOCALES = LANGUAGES.map((l) => l.code);

function getCurrentLocale(): SupportedLocale {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/NEXT_LOCALE=([a-z]{2})/);
    if (match && SUPPORTED_LOCALES.includes(match[1] as SupportedLocale)) {
      return match[1] as SupportedLocale;
    }
  }
  return 'en';
}

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
}

export function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SupportedLocale>('en');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(getCurrentLocale());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  function selectLanguage(code: SupportedLocale) {
    setLocaleCookie(code);
    try {
      localStorage.setItem('NEXT_LOCALE', code);
    } catch {}
    setOpen(false);
    window.location.reload();
  }

  if (mobile) {
    return (
      <div className="w-full px-3 py-2">
        <select
          value={current}
          onChange={(e) => selectLanguage(e.target.value as SupportedLocale)}
          className="w-full rounded-md bg-white/10 px-3 py-3 text-sm font-medium text-white/90 min-h-[44px] border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Select language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[#1a1f36] text-white">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 max-h-80 w-48 overflow-y-auto rounded-lg border border-white/10 bg-[#1a1f36] py-1 shadow-xl"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current}
                onClick={() => selectLanguage(lang.code)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  lang.code === current
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
