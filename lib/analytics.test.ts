import { describe, expect, it } from 'vitest';
import {
  calculateOccupancy,
  calculateOverdue,
  calculateProjection,
  calculateRevenue,
  filterData,
  getRecentActivity,
  periodStart,
} from './analytics';
import type { Lease, Payment, Property } from './types';

const today = '2026-09-15';

const properties: Property[] = [
  { id: 'p1', name: 'Room 101', type: 'ROOM', status: 'OCCUPIED', price: 800, currency: 'PEN', location: 'A', floor: 1 },
  { id: 'p2', name: 'Shop 1', type: 'COMMERCIAL', status: 'OCCUPIED', price: 500, currency: 'USD', location: 'A', floor: 0 },
  { id: 'p3', name: 'Room 102', type: 'ROOM', status: 'AVAILABLE', price: 750, currency: 'PEN', location: 'A', floor: 1 },
];

const lease = (id: string, propertyId: string, currency: 'PEN' | 'USD'): Lease => ({
  id,
  propertyId,
  tenantId: 't1',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  monthlyRent: 800,
  currency,
  status: 'ACTIVE',
  advanceMonths: 1,
  warrantyMonths: 1,
  utilityCosts: null,
  terminationDate: null,
});

const leases = [lease('l1', 'p1', 'PEN'), lease('l2', 'p2', 'USD')];

const payment = (overrides: Partial<Payment>): Payment => ({
  id: 'x',
  leaseId: 'l1',
  dueDate: '2026-09-01',
  amount: 800,
  amountPaid: 0,
  paidDate: null,
  status: 'PENDING',
  overdueDays: 0,
  transactions: [],
  ...overrides,
});

const payments: Payment[] = [
  payment({ id: 'a', dueDate: '2026-09-01', amountPaid: 800.1, paidDate: '2026-09-03', status: 'PAID' }),
  payment({ id: 'b', dueDate: '2026-08-01', amountPaid: 300.2, paidDate: '2026-08-10', status: 'PARTIAL', overdueDays: 45 }),
  payment({ id: 'c', dueDate: '2026-05-01', status: 'OVERDUE', overdueDays: 137 }),
  payment({ id: 'd', leaseId: 'l2', dueDate: '2026-09-01', amount: 500, status: 'OVERDUE', overdueDays: 14 }),
];

describe('periodStart', () => {
  it('resolves each period relative to today', () => {
    expect(periodStart('current', today)).toBe('2026-09-01');
    expect(periodStart('3m', today)).toBe('2026-06-01');
    expect(periodStart('1y', today)).toBe('2025-09-01');
    expect(periodStart('all', today)).toBeNull();
  });
});

describe('filterData', () => {
  it('keeps only this month for the current period', () => {
    const { payments: result } = filterData(properties, leases, payments, 'current', undefined, 'all', today);
    expect(result.map((p) => p.id)).toEqual(['a', 'd']);
  });

  it('filters by property type', () => {
    const { properties: rooms, payments: roomPayments } = filterData(properties, leases, payments, 'all', undefined, 'room', today);
    expect(rooms.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(roomPayments.every((p) => p.leaseId === 'l1')).toBe(true);
  });

  it('applies a custom range inclusively', () => {
    const { payments: result } = filterData(
      properties, leases, payments, 'custom', { from: '2026-08-01', to: '2026-09-01' }, 'all', today,
    );
    expect(result.map((p) => p.id).sort()).toEqual(['a', 'b', 'd']);
  });
});

describe('money metrics', () => {
  it('sums revenue per currency without float drift', () => {
    expect(calculateRevenue(payments, leases, 'PEN')).toBe(1100.3);
    expect(calculateRevenue(payments, leases, 'USD')).toBe(0);
  });

  it('sums the unpaid balance of overdue charges', () => {
    expect(calculateOverdue(payments, leases, properties, 'all', 'PEN')).toBe(1299.8);
    expect(calculateOverdue(payments, leases, properties, 'all', 'USD')).toBe(500);
    expect(calculateOverdue(payments, leases, properties, 'room', 'USD')).toBe(0);
  });

  it('compares collected with expected', () => {
    expect(calculateProjection(payments, leases, 'PEN')).toEqual({ totalExpected: 2400, totalCollected: 1100.3 });
  });
});

describe('occupancy and activity', () => {
  it('computes occupancy', () => {
    expect(calculateOccupancy(properties)).toEqual({ occupiedCount: 2, totalPropertiesCount: 3, occupancyRate: 67 });
    expect(calculateOccupancy([])).toEqual({ occupiedCount: 0, totalPropertiesCount: 0, occupancyRate: 0 });
  });

  it('lists the latest payments first', () => {
    expect(getRecentActivity(payments).map((p) => p.id)).toEqual(['a', 'b']);
  });
});
