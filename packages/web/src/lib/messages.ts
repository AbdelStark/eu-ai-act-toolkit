/**
 * Dynamic message loaders for each locale.
 * Each import creates a separate webpack chunk that's only loaded when needed.
 */

export type SupportedLocale =
  | 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt'
  | 'nl' | 'pl' | 'ro' | 'el' | 'zh' | 'hi' | 'ar' | 'bn';

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  'en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'ro', 'el', 'zh', 'hi', 'ar', 'bn',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

export async function loadMessages(locale: SupportedLocale): Promise<Messages> {
  switch (locale) {
    case 'fr': return (await import('../../messages/fr.json')).default;
    case 'de': return (await import('../../messages/de.json')).default;
    case 'es': return (await import('../../messages/es.json')).default;
    case 'it': return (await import('../../messages/it.json')).default;
    case 'pt': return (await import('../../messages/pt.json')).default;
    case 'nl': return (await import('../../messages/nl.json')).default;
    case 'pl': return (await import('../../messages/pl.json')).default;
    case 'ro': return (await import('../../messages/ro.json')).default;
    case 'el': return (await import('../../messages/el.json')).default;
    case 'zh': return (await import('../../messages/zh.json')).default;
    case 'hi': return (await import('../../messages/hi.json')).default;
    case 'ar': return (await import('../../messages/ar.json')).default;
    case 'bn': return (await import('../../messages/bn.json')).default;
    case 'en':
    default:   return (await import('../../messages/en.json')).default;
  }
}
