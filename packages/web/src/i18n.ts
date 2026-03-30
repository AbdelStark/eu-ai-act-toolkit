import { getRequestConfig } from 'next-intl/server';
import { headers, cookies } from 'next/headers';

const SUPPORTED_LOCALES = [
  'en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'ro', 'el', 'zh', 'hi', 'ar', 'bn',
];

export default getRequestConfig(async () => {
  let locale = 'en';

  // 1. Try cookie
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
      locale = cookieLocale;
    }
  } catch {
    // cookies() may not be available in some contexts
  }

  // 2. Try middleware header (which may have parsed Accept-Language)
  if (locale === 'en') {
    try {
      const headerStore = await headers();
      const headerLocale = headerStore.get('x-next-locale');
      if (headerLocale && SUPPORTED_LOCALES.includes(headerLocale)) {
        locale = headerLocale;
      }
    } catch {
      // headers() may not be available
    }
  }

  // Load messages - fall back to English if translation file doesn't exist
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import('../messages/en.json')).default;
    locale = 'en';
  }

  return {
    locale,
    messages,
  };
});
