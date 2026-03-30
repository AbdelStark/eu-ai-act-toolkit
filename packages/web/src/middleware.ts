import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = [
  'en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'ro', 'el', 'zh', 'hi', 'ar', 'bn',
];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Read locale from cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    // Cookie is valid, pass it along via a header for i18n.ts to read
    response.headers.set('x-next-locale', cookieLocale);
  } else {
    // Try Accept-Language header
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
      const preferred = acceptLang
        .split(',')
        .map((part) => {
          const [lang = ''] = part.trim().split(';');
          return lang.trim().substring(0, 2).toLowerCase();
        })
        .find((code) => SUPPORTED_LOCALES.includes(code));
      if (preferred) {
        response.headers.set('x-next-locale', preferred);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
