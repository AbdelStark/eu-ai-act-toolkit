'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Disclaimer } from './Disclaimer';
import { LanguageSelector } from './LanguageSelector';

const primaryNavLinks = [
  { href: '/dashboard', labelKey: 'dashboard' as const },
  { href: '/classify', labelKey: 'classify' as const },
  { href: '/checklist/high-risk', labelKey: 'checklist' as const },
  { href: '/timeline', labelKey: 'timeline' as const },
  { href: '/templates', labelKey: 'templates' as const },
  { href: '/examples', labelKey: 'examples' as const },
];

const moreNavLinks = [
  { href: '/plan', labelKey: 'plan' as const },
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top accent bar */}
      <div className="top-accent" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-navy/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
            style={{ color: '#f0f1f5' }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-eu-blue text-sm font-bold">EU</span>
            {t('home')}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryNavLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
            {/* More dropdown */}
            <div className="relative group">
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 inline-flex items-center gap-1 ${
                  moreNavLinks.some(l => pathname === l.href || pathname.startsWith(l.href + '/'))
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t('more')}
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div className="invisible group-hover:visible group-focus-within:visible absolute right-0 top-full mt-1 w-48 rounded-lg border border-white/10 bg-navy shadow-lg py-1 z-50">
                {moreNavLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + '/');

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="hidden md:flex items-center">
            <LanguageSelector />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <nav className="border-t border-white/10 bg-navy px-4 pb-4 pt-2 md:hidden animate-slide-down">
            <div className="flex flex-col gap-1">
              {allNavLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + '/');

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-150 min-h-[44px] flex items-center ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
              <LanguageSelector mobile />
            </div>
          </nav>
        )}
      </header>

      <Disclaimer />

      <main id="main-content" className="flex-1">{children}</main>

      <footer className="border-t-2 border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-eu-blue text-xs font-bold" style={{ color: '#f0f1f5' }}>EU</span>
                <h3 className="text-sm font-semibold text-navy">
                  {t('home')}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                {tFooter('description')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-navy">
                {tFooter('legal.title')}
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-eu-blue hover:underline transition-colors duration-150"
                  >
                    {tFooter('links.eurLex')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-eu-blue hover:underline transition-colors duration-150"
                  >
                    {tFooter('links.aiOffice')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-navy">
                Links
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="https://github.com/AbdelStark/eu-ai-act-toolkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-eu-blue hover:underline transition-colors duration-150"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    {tFooter('links.github')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/AiActToolkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-eu-blue hover:underline transition-colors duration-150"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    X / Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-eu-blue hover:underline transition-colors duration-150"
                  >
                    {tFooter('links.docs')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-500">
              {tFooter('copyright')}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {tFooter('regulation')}
            </p>
            <p className="mt-3 text-xs text-slate-400 italic">
              {tFooter('tagline')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
