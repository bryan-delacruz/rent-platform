import { describe, expect, it } from 'vitest';
import { daysBetween, firstOfMonth, isISODate, lastOfMonth, todayISO } from './dates';
import {
  balanceCents,
  dueDateForMonth,
  isBillableInMonth,
  isExpired,
  overdueDays,
  paymentStatus,
  summarizeTransactions,
  type BillableLease,
} from './payments';

describe('paymentStatus', () => {
  const due = '2026-09-01';

  it('is PAID when fully paid, even late', () => {
    expect(paymentStatus(80000, 80000, due, '2026-09-20')).toBe('PAID');
    expect(paymentStatus(80000, 90000, due, '2026-09-20')).toBe('PAID');
  });

  it('is PARTIAL when something was paid', () => {
    expect(paymentStatus(80000, 30000, due, '2026-08-30')).toBe('PARTIAL');
    expect(paymentStatus(80000, 30000, due, '2026-09-20')).toBe('PARTIAL');
  });

  it('is PENDING up to and including the due date', () => {
    expect(paymentStatus(80000, 0, due, '2026-08-25')).toBe('PENDING');
    expect(paymentStatus(80000, 0, due, due)).toBe('PENDING');
  });

  it('is OVERDUE the day after the due date', () => {
    expect(paymentStatus(80000, 0, due, '2026-09-02')).toBe('OVERDUE');
  });
});

describe('overdueDays and balance', () => {
  it('counts days past due for unpaid balances', () => {
    expect(overdueDays(80000, 0, '2026-09-01', '2026-09-11')).toBe(10);
    expect(overdueDays(80000, 20000, '2026-09-01', '2026-09-11')).toBe(10);
  });

  it('is zero when paid or not yet due', () => {
    expect(overdueDays(80000, 80000, '2026-09-01', '2026-09-11')).toBe(0);
    expect(overdueDays(80000, 0, '2026-09-01', '2026-08-20')).toBe(0);
  });

  it('never returns a negative balance', () => {
    expect(balanceCents(80000, 30000)).toBe(50000);
    expect(balanceCents(80000, 90000)).toBe(0);
  });
});

describe('summarizeTransactions', () => {
  it('sums transactions and keeps the latest date', () => {
    expect(
      summarizeTransactions([
        { amountCents: 30000, paidAt: '2026-09-03' },
        { amountCents: 50000, paidAt: '2026-09-10' },
      ]),
    ).toEqual({ paidCents: 80000, lastPaidAt: '2026-09-10' });
  });

  it('has no paid date without transactions', () => {
    expect(summarizeTransactions([])).toEqual({ paidCents: 0, lastPaidAt: null });
  });
});

describe('isBillableInMonth', () => {
  const lease: BillableLease = {
    status: 'ACTIVE',
    startDate: '2026-03-15',
    endDate: '2027-03-14',
    terminationDate: null,
  };

  it('bills every month the lease overlaps', () => {
    expect(isBillableInMonth(lease, '2026-03-01')).toBe(true);
    expect(isBillableInMonth(lease, '2026-09-01')).toBe(true);
    expect(isBillableInMonth(lease, '2027-03-01')).toBe(true);
  });

  it('does not bill before the start or after the end', () => {
    expect(isBillableInMonth(lease, '2026-02-01')).toBe(false);
    expect(isBillableInMonth(lease, '2027-04-01')).toBe(false);
  });

  it('stops billing after an early termination', () => {
    const terminated = { ...lease, terminationDate: '2026-06-30' };
    expect(isBillableInMonth(terminated, '2026-06-01')).toBe(true);
    expect(isBillableInMonth(terminated, '2026-07-01')).toBe(false);
  });

  it('never bills a lease that is not active', () => {
    expect(isBillableInMonth({ ...lease, status: 'TERMINATED' }, '2026-09-01')).toBe(false);
    expect(isBillableInMonth({ ...lease, status: 'DRAFT' }, '2026-09-01')).toBe(false);
  });

  it('detects expired leases', () => {
    expect(isExpired(lease, '2027-03-15')).toBe(true);
    expect(isExpired(lease, '2027-03-14')).toBe(false);
  });
});

describe('dates', () => {
  it('computes month boundaries, including leap years', () => {
    expect(firstOfMonth('2026-09-17')).toBe('2026-09-01');
    expect(lastOfMonth('2026-09-17')).toBe('2026-09-30');
    expect(lastOfMonth('2028-02-10')).toBe('2028-02-29');
    expect(dueDateForMonth('2026-12-31')).toBe('2026-12-01');
  });

  it('counts days between dates', () => {
    expect(daysBetween('2026-09-01', '2026-10-01')).toBe(30);
    expect(daysBetween('2026-10-01', '2026-09-01')).toBe(-30);
  });

  it('validates ISO dates', () => {
    expect(isISODate('2026-02-28')).toBe(true);
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('26-2-1')).toBe(false);
  });

  it('uses the Lima calendar day for today', () => {
    // 03:00 UTC on Sep 2 is still Sep 1 in Lima (UTC-5).
    expect(todayISO(new Date('2026-09-02T03:00:00Z'))).toBe('2026-09-01');
  });
});
