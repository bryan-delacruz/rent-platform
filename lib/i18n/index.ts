import { en } from './en';
import { es } from './es';

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE = 'locale';

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

/** Every locale must provide the same keys as the English dictionary. */
export type Dictionary = Widen<typeof en>;

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'es';
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Replaces {name} placeholders: interpolate('Hi {name}', { name: 'Ana' }). */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Picks the first supported language from an Accept-Language header. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  for (const part of header.split(',')) {
    const code = part.split(';')[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}
