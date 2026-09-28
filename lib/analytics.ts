import { centsToAmount, firstOfMonth, sumCents, toCents, type ISODate } from '@/lib/billing';
import type { Currency, Lease, Payment, Property } from '@/lib/types';

export type DateFilterType = 'current' | '3m' | '6m' | '1y' | 'all' | 'custom';
export type TabType = 'all' | 'commercial' | 'room';

export interface DateRange {
  from: ISODate;
  to: ISODate;
}

function monthsBefore(date: ISODate, months: number): ISODate {
  const [year, month] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 - months, 1));
  return shifted.toISOString().slice(0, 10);
}

/** Inclusive start date for a period filter, or null for all time. */
export function periodStart(filter: DateFilterType, today: ISODate): ISODate | null {
  switch (filter) {
    case 'current':
      return firstOfMonth(today);
    case '3m':
      return monthsBefore(today, 3);
    case '6m':
      return monthsBefore(today, 6);
    case '1y':
      return monthsBefore(today, 12);
    default:
      return null;
  }
}

function matchesTab(property: Property | undefined, tab: TabType): boolean {
  if (tab === 'all') return true;
  if (!property) return false;
  return tab === 'commercial' ? property.type === 'COMMERCIAL' : property.type === 'ROOM';
}

export function filterData(
  properties: Property[],
  leases: Lease[],
  payments: Payment[],
  dateFilter: DateFilterType,
  customRange: DateRange | undefined,
  activeTab: TabType,
  today: ISODate,
) {
  const leaseById = new Map(leases.map((lease) => [lease.id, lease]));
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const start = periodStart(dateFilter, today);

  const inPeriod = (payment: Payment) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'custom') {
      if (!customRange) return true;
      return payment.dueDate >= customRange.from && payment.dueDate <= customRange.to;
    }
    return start === null || payment.dueDate >= start;
  };

  return {
    properties: properties.filter((property) => matchesTab(property, activeTab)),
    payments: payments.filter((payment) => {
      const lease = leaseById.get(payment.leaseId);
      return inPeriod(payment) && matchesTab(propertyById.get(lease?.propertyId ?? ''), activeTab);
    }),
  };
}

export function calculateOccupancy(properties: Property[]) {
  const totalPropertiesCount = properties.length;
  const occupiedCount = properties.filter((property) => property.status === 'OCCUPIED').length;
  const occupancyRate =
    totalPropertiesCount > 0 ? Math.round((occupiedCount / totalPropertiesCount) * 100) : 0;
  return { occupiedCount, totalPropertiesCount, occupancyRate };
}

function inCurrency(payments: Payment[], leases: Lease[], currency: Currency) {
  const currencyByLease = new Map(leases.map((lease) => [lease.id, lease.currency]));
  return payments.filter((payment) => currencyByLease.get(payment.leaseId) === currency);
}

const total = (values: number[]) => centsToAmount(sumCents(values.map(toCents)));

export function calculateRevenue(payments: Payment[], leases: Lease[], currency: Currency) {
  return total(inCurrency(payments, leases, currency).map((payment) => payment.amountPaid));
}

/** Unpaid balance of every charge past its due date, whatever the period. */
export function calculateOverdue(
  payments: Payment[],
  leases: Lease[],
  properties: Property[],
  activeTab: TabType,
  currency: Currency,
) {
  const leaseById = new Map(leases.map((lease) => [lease.id, lease]));
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const overdue = inCurrency(payments, leases, currency).filter(
    (payment) =>
      payment.overdueDays > 0 &&
      matchesTab(propertyById.get(leaseById.get(payment.leaseId)?.propertyId ?? ''), activeTab),
  );
  return total(overdue.map((payment) => payment.amount - payment.amountPaid));
}

export function calculateProjection(payments: Payment[], leases: Lease[], currency: Currency) {
  const relevant = inCurrency(payments, leases, currency);
  return {
    totalExpected: total(relevant.map((payment) => payment.amount)),
    totalCollected: total(relevant.map((payment) => payment.amountPaid)),
  };
}

export function getRecentActivity(payments: Payment[], limit = 5) {
  return payments
    .filter((payment) => payment.paidDate !== null)
    .sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? ''))
    .slice(0, limit);
}
