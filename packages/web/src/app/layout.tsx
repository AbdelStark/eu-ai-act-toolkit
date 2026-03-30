import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
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
  openGraph: {
    title: 'EU AI Act Compliance Toolkit',
    description:
      'Classify your AI system, track compliance obligations, and generate documentation for Regulation (EU) 2024/1689.',
    type: 'website',
    locale: 'en',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
