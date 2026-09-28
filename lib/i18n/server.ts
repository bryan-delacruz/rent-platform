import 'server-only';
import { cookies, headers } from 'next/headers';
import {
  LOCALE_COOKIE,
  getDictionary,
  isLocale,
  localeFromAcceptLanguage,
  type Dictionary,
  type Locale,
} from './index';

/** The saved language, or the browser's preferred one on the first visit. */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage((await headers()).get('accept-language'));
}

export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
