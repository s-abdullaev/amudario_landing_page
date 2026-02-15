import { locales, defaultLocale, type Locale } from './locales';
import en from './translations/en';
import uz from './translations/uz';
import ru from './translations/ru';

const translations: Record<Locale, typeof en> = { en, uz, ru };

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (locales.includes(lang as Locale)) return lang as Locale;
  return defaultLocale;
}

export function useTranslations(lang: Locale) {
  return translations[lang];
}

export function getLocalizedPath(path: string, lang: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`;
}
