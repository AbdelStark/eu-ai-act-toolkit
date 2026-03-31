'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Disclaimer } from './Disclaimer';
import { LanguageSelector } from './LanguageSelector';

const primaryNavLinks = [
  { href: '/classify', labelKey: 'classify' as const },
  { href: '/checklist/high-risk', labelKey: 'checklist' as const },
  { href: '/timeline', labelKey: 'timeline' as const },
  { href: '/templates', labelKey: 'templates' as const },
  { href: '/examples', labelKey: 'examples' as const },
];

const moreNavLinks = [
  { href: '/articles', labelKey: 'articles' as const },
  { href: '/penalties', labelKey: 'penalties' as const },
  { href: '/gaps', labelKey: 'gaps' as const },
  { href: '/standards', labelKey: 'standards' as const },
  { href: '/reports', labelKey: 'reports' as const },
];

const allNavLinks = [...primaryNavLinks, ...moreNavLinks];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-out-expo ${
          scrolled
            ? 'border-b border-slate-200/80 bg-white/95 shadow-soft-sm backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container-page flex items-center justify-between py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-[11px] font-bold tracking-wider text-white transition-colors group-hover:bg-eu-blue">
              EU
            </span>
            <span className="text-sm font-semibold text-navy tracking-tight hidden sm:block">
              {t('home')}
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {primaryNavLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-navy/[0.06] text-navy'
                      : 'text-slate-500 hover:text-navy hover:bg-slate-100/80'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            <div className="relative group">
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 inline-flex items-center gap-1 ${
                  moreNavLinks.some(l => pathname === l.href || pathname.startsWith(l.href + '/'))
                    ? 'bg-navy/[0.06] text-navy'
                    : 'text-slate-500 hover:text-navy hover:bg-slate-100/80'
                }`}
              >
                {t('more')}
                <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-soft-lg py-1.5 z-50 transition-all duration-200">
                {moreNavLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                        isActive ? 'bg-slate-50 text-navy' : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                      }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center">
              <LanguageSelector />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white px-5 pb-5 pt-3 md:hidden animate-slide-down">
            <div className="flex flex-col gap-0.5">
              {allNavLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px] flex items-center ${
                      isActive ? 'bg-slate-50 text-navy' : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <LanguageSelector mobile />
              </div>
            </div>
          </nav>
        )}
      </header>

      <Disclaimer />

      <main id="main-content" className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50/80">
        <div className="container-page py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy text-[10px] font-bold tracking-wider text-white">EU</span>
                <span className="text-sm font-semibold text-navy">{t('home')}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-md">
                {tFooter('description')}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a href="https://github.com/AbdelStark/eu-ai-act-toolkit" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-navy hover:border-slate-300 transition-colors" aria-label="GitHub">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tFooter('legal.title')}</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-navy transition-colors">{tFooter('links.eurLex')}</a></li>
                <li><a href="https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-navy transition-colors">{tFooter('links.aiOffice')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tFooter('resources')}</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="https://github.com/AbdelStark/eu-ai-act-toolkit" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-navy transition-colors">{tFooter('links.github')}</a></li>
                <li><a href="https://github.com/AbdelStark/eu-ai-act-toolkit#readme" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-navy transition-colors">{tFooter('links.docs')}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-start gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">{tFooter('copyright')}</p>
            <p className="text-xs text-slate-400">{tFooter('regulation')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
