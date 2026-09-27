import { daysBetween, firstOfMonth, lastOfMonth, type ISODate } from './dates';
import { sumCents } from './money';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';

/**
 * Status of a monthly charge. A charge with any money received is PARTIAL even
 * after its due date, so the landlord sees progress instead of a red flag.
 */
export function paymentStatus(
  amountCents: number,
  paidCents: number,
  dueDate: ISODate,
  today: ISODate,
): PaymentStatus {
  if (paidCents >= amountCents) return 'PAID';
  if (paidCents > 0) return 'PARTIAL';
  return today > dueDate ? 'OVERDUE' : 'PENDING';
}

/** Days past the due date for an unpaid balance; 0 when on time or paid. */
export function overdueDays(
  amountCents: number,
  paidCents: number,
  dueDate: ISODate,
  today: ISODate,
): number {
  if (paidCents >= amountCents) return 0;
  return Math.max(0, daysBetween(dueDate, today));
}

export function balanceCents(amountCents: number, paidCents: number): number {
  return Math.max(0, amountCents - paidCents);
}

export interface TransactionLike {
  amountCents: number;
  paidAt: ISODate;
}

/** Total received and the date of the latest payment, from its transactions. */
export function summarizeTransactions(transactions: TransactionLike[]): {
  paidCents: number;
  lastPaidAt: ISODate | null;
} {
  const paidCents = sumCents(transactions.map((tx) => tx.amountCents));
  const lastPaidAt = transactions.reduce<ISODate | null>(
    (latest, tx) => (latest === null || tx.paidAt > latest ? tx.paidAt : latest),
    null,
  );
  return { paidCents, lastPaidAt: paidCents > 0 ? lastPaidAt : null };
}

export interface BillableLease {
  status: 'DRAFT' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
  startDate: ISODate;
  endDate: ISODate;
  terminationDate: ISODate | null;
}

/** Monthly charges are due on the first day of each month. */
export function dueDateForMonth(anyDayInMonth: ISODate): ISODate {
  return firstOfMonth(anyDayInMonth);
}

/**
 * Whether an active lease owes rent for the month containing `month`: the
 * lease must overlap that calendar month and not be terminated before it.
 */
export function isBillableInMonth(lease: BillableLease, month: ISODate): boolean {
  if (lease.status !== 'ACTIVE') return false;
  const start = firstOfMonth(month);
  const end = lastOfMonth(month);
  const leaseEnd =
    lease.terminationDate && lease.terminationDate < lease.endDate
      ? lease.terminationDate
      : lease.endDate;
  return lease.startDate <= end && leaseEnd >= start;
}

/** A lease past its end date should be marked EXPIRED. */
export function isExpired(lease: BillableLease, today: ISODate): boolean {
  return lease.status === 'ACTIVE' && lease.endDate < today;
}
