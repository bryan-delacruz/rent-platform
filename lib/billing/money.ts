/**
 * Money is stored as Decimal(12,2) in Postgres and handled as integer cents in
 * the domain, so sums and comparisons never hit floating point error.
 */

export type Currency = 'PEN' | 'USD';

export const CURRENCIES: readonly Currency[] = ['PEN', 'USD'];

export function isCurrency(value: unknown): value is Currency {
  return value === 'PEN' || value === 'USD';
}

/** Anything Prisma returns for a Decimal column, or a plain input value. */
export type DecimalLike = { toString(): string } | string | number;

/**
 * Converts a decimal amount ("1234.5", 1234.5 or a Prisma Decimal) to cents.
 * Parses the string form so 0.1 + 0.2 style float errors never enter.
 */
export function toCents(value: DecimalLike): number {
  const text = typeof value === 'number' ? value.toFixed(2) : value.toString().trim();
  const match = /^(-)?(\d+)(?:\.(\d{0,}))?$/.exec(text);
  if (!match) throw new Error(`Invalid money amount: ${text}`);
  const [, sign, whole, fraction = ''] = match;
  const padded = (fraction + '00').slice(0, 3);
  // Round half up on the third decimal, matching Postgres numeric rounding.
  let cents = Number(whole) * 100 + Number(padded.slice(0, 2));
  if (Number(padded[2]) >= 5) cents += 1;
  return sign ? -cents : cents;
}

/** Cents to the decimal string Prisma accepts for a Decimal column. */
export function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** Cents to a number in major units, only for display and charts. */
export function centsToAmount(cents: number): number {
  return Math.round(cents) / 100;
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
