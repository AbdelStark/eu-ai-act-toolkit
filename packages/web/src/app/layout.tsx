import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { I18nProvider } from '@/components/shared/I18nProvider';
import defaultMessages from '../../messages/en.json';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'EU AI Act Compliance Toolkit',
    template: '%s | EU AI Act Toolkit',
  },
  description:
    'Open-source toolkit for EU AI Act (Regulation 2024/1689) compliance. Classify AI systems, track obligations, generate documentation, and monitor enforcement deadlines.',
  keywords: [
    'EU AI Act',
    'AI regulation',
    'compliance',
    'risk classification',
    'Regulation 2024/1689',
    'artificial intelligence',
    'GPAI',
    'high-risk AI',
  ],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'EU AI Act Compliance Toolkit',
    description:
      'Classify your AI system, track compliance obligations, and generate documentation for Regulation (EU) 2024/1689.',
    type: 'website',
    locale: 'en',
    siteName: 'EU AI Act Toolkit',
    url: 'https://abdelstark.github.io/eu-ai-act-toolkit/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EU AI Act Compliance Toolkit',
    description:
      'Open-source compliance toolkit for Regulation (EU) 2024/1689. Classify, track, and document.',
    creator: '@AbdelStark',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_PATH
      ? `https://abdelstark.github.io${process.env.NEXT_PUBLIC_BASE_PATH}`
      : 'https://abdelstark.github.io/eu-ai-act-toolkit'
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <I18nProvider defaultMessages={defaultMessages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
