import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = [
  'en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'ro', 'el', 'zh', 'hi', 'ar', 'bn',
];

export default getRequestConfig(async () => {
  let locale = 'en';

  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
      locale = cookieLocale;
    }
  } catch {
    // Static export: cookies() throws at build time. Default to 'en'.
  }

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import('../messages/en.json')).default;
  }

  return { locale, messages };
});
