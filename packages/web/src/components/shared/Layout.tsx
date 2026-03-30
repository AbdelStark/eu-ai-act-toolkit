'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Disclaimer } from './Disclaimer';

const navLinks = [
  { href: '/classify', labelKey: 'classify' as const },
  { href: '/checklist/high-risk', labelKey: 'checklist' as const },
  { href: '/timeline', labelKey: 'timeline' as const },
  { href: '/templates', labelKey: 'templates' as const },
  { href: '/examples', labelKey: 'examples' as const },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-navy/10 bg-navy">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            {t('home')}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <MobileMenuButton />
        </div>
      </header>

      <Disclaimer />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-navy">
                {t('home')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {tFooter('description')}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-navy">
                {tFooter('legal.title')}
              </h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a
                    href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-eu-blue hover:underline"
                  >
                    {tFooter('links.eurLex')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-eu-blue hover:underline"
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
              <ul className="mt-2 space-y-1">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-eu-blue hover:underline"
                  >
                    {tFooter('links.github')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-eu-blue hover:underline"
                  >
                    {tFooter('links.docs')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500">
              {tFooter('copyright')}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {tFooter('regulation')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileMenuButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
      aria-label="Open menu"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </button>
  );
}
