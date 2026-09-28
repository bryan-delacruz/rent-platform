import type { Currency, ISODate } from '@/lib/billing';
import type { Locale } from '@/lib/i18n';

const LOCALE_TAGS: Record<Locale, string> = { en: 'en-US', es: 'es-PE' };

const CURRENCY_SYMBOLS: Record<Locale, Record<Currency, string>> = {
  en: { PEN: 'S/ ', USD: '$' },
  es: { PEN: 'S/ ', USD: 'US$ ' },
};

/** "S/ 1,650.00" and "$950.00": the symbols Peruvian landlords use, in either language. */
export function formatMoney(amount: number, currency: Currency, locale: Locale): string {
  const number = new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}${CURRENCY_SYMBOLS[locale][currency]}${number}`;
}

/** Formats a calendar date without shifting it through the viewer's timezone. */
export function formatDate(date: ISODate, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const match = digits.match(/^(\d{3})(\d{3})(\d{3})$/);
  if (match) return `${match[1]} ${match[2]} ${match[3]}`;
  return phone;
}
