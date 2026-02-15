export const locales = ['en', 'uz', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uz';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  uz: 'Ўзбекча',
  ru: 'Русский',
};
