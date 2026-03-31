'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, type SupportedLocale } from './I18nProvider';

const LANGUAGES = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt' as const, name: 'Português', flag: '🇵🇹' },
  { code: 'nl' as const, name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl' as const, name: 'Polski', flag: '🇵🇱' },
  { code: 'ro' as const, name: 'Română', flag: '🇷🇴' },
  { code: 'el' as const, name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
  { code: 'hi' as const, name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
  { code: 'bn' as const, name: 'বাংলা', flag: '🇧🇩' },
];

export function LanguageSelector({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const { locale: current, setLocale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]!;

  function selectLanguage(code: SupportedLocale) {
    setLocale(code);
    setOpen(false);
  }

  if (mobile) {
    return (
      <div className="w-full px-3 py-2">
        <select
          value={current}
          onChange={(e) => selectLanguage(e.target.value as SupportedLocale)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-eu-blue/30"
          aria-label="Select language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
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
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-navy"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg
          className={`h-3 w-3 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 max-h-80 w-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-soft-lg"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === current}
                onClick={() => selectLanguage(lang.code)}
                className={`flex w-full items-center gap-2 px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  lang.code === current
                    ? 'bg-slate-50 text-navy'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
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
