/**
 * Calendar dates travel as ISO strings (YYYY-MM-DD). They compare correctly as
 * strings and have no timezone, which is what a due date or lease end means.
 */

export type ISODate = string;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const BUSINESS_TIME_ZONE = 'America/Lima';

export function isISODate(value: string): value is ISODate {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Today's calendar date in the business time zone. */
export function todayISO(now: Date = new Date(), timeZone = BUSINESS_TIME_ZONE): ISODate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** A @db.Date column comes back as a Date at UTC midnight. */
export function dateToISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function isoToDate(value: ISODate): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function firstOfMonth(date: ISODate): ISODate {
  return `${date.slice(0, 7)}-01`;
}

export function lastOfMonth(date: ISODate): ISODate {
  const [year, month] = date.split('-').map(Number);
  const last = new Date(Date.UTC(year, month, 0));
  return dateToISO(last);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
  const ms = isoToDate(to).getTime() - isoToDate(from).getTime();
  return Math.round(ms / 86_400_000);
}
