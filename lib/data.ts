import 'server-only';
import type {
  Lease as LeaseRow,
  Payment as PaymentRow,
  PaymentTransaction as TransactionRow,
  Property as PropertyRow,
  Tenant as TenantRow,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import {
  centsToAmount,
  dateToISO,
  isCurrency,
  isExpired,
  overdueDays,
  paymentStatus,
  toCents,
  todayISO,
  type Currency,
} from '@/lib/billing';
import type { Lease, Payment, Property, Tenant } from '@/lib/types';

/**
 * Read side of the app. Every function resolves the signed-in owner and only
 * returns that owner's rows, already converted to client-safe DTOs.
 */

const amount = (value: { toString(): string }) => centsToAmount(toCents(value));
const asCurrency = (value: string): Currency => (isCurrency(value) ? value : 'PEN');

export function toProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    price: amount(row.price),
    currency: asCurrency(row.currency),
    location: row.location,
    floor: row.floor,
  };
}

export function toTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    dni: row.dni,
    address: row.address,
  };
}

export function toLease(row: LeaseRow, today: string = todayISO()): Lease {
  const startDate = dateToISO(row.startDate);
  const endDate = dateToISO(row.endDate);
  const terminationDate = row.terminationDate ? dateToISO(row.terminationDate) : null;
  // An active lease past its end date is shown as expired without a write.
  const status = isExpired({ status: row.status, startDate, endDate, terminationDate }, today)
    ? 'EXPIRED'
    : row.status;
  const hasUtilities = row.waterCost !== null || row.electricityCost !== null || row.gasCost !== null;
  return {
    id: row.id,
    propertyId: row.propertyId,
    tenantId: row.tenantId,
    startDate,
    endDate,
    monthlyRent: amount(row.monthlyRent),
    currency: asCurrency(row.currency),
    status,
    advanceMonths: row.advanceMonths,
    warrantyMonths: row.warrantyMonths,
    utilityCosts: hasUtilities
      ? {
          water: row.waterCost ? amount(row.waterCost) : 0,
          electricity: row.electricityCost ? amount(row.electricityCost) : 0,
          gas: row.gasCost ? amount(row.gasCost) : 0,
        }
      : null,
    terminationDate,
  };
}

export function toPayment(
  row: PaymentRow & { transactions: TransactionRow[] },
  today: string = todayISO(),
): Payment {
  const amountCents = toCents(row.amount);
  const paidCents = toCents(row.amountPaid);
  const dueDate = dateToISO(row.dueDate);
  return {
    id: row.id,
    leaseId: row.leaseId,
    dueDate,
    amount: centsToAmount(amountCents),
    amountPaid: centsToAmount(paidCents),
    paidDate: row.paidDate ? dateToISO(row.paidDate) : null,
    status: paymentStatus(amountCents, paidCents, dueDate, today),
    overdueDays: overdueDays(amountCents, paidCents, dueDate, today),
    transactions: [...row.transactions]
      .sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime() || a.createdAt.getTime() - b.createdAt.getTime())
      .map((tx) => ({ id: tx.id, date: dateToISO(tx.paidAt), amount: amount(tx.amount) })),
  };
}

export async function listProperties(): Promise<Property[]> {
  const ownerId = await requireOwner();
  const rows = await prisma.property.findMany({ where: { ownerId }, orderBy: { name: 'asc' } });
  return rows.map(toProperty);
}

export async function listTenants(): Promise<Tenant[]> {
  const ownerId = await requireOwner();
  const rows = await prisma.tenant.findMany({ where: { ownerId }, orderBy: { name: 'asc' } });
  return rows.map(toTenant);
}

export async function listLeases(): Promise<Lease[]> {
  const ownerId = await requireOwner();
  const rows = await prisma.lease.findMany({ where: { ownerId }, orderBy: { startDate: 'desc' } });
  const today = todayISO();
  return rows.map((row) => toLease(row, today));
}

export async function listPayments(): Promise<Payment[]> {
  const ownerId = await requireOwner();
  const rows = await prisma.payment.findMany({
    where: { ownerId },
    include: { transactions: true },
    orderBy: { dueDate: 'desc' },
  });
  const today = todayISO();
  return rows.map((row) => toPayment(row, today));
}

/** Everything the dashboard and the payments list need, in one round trip. */
export async function getPortfolio() {
  const [properties, tenants, leases, payments] = await Promise.all([
    listProperties(),
    listTenants(),
    listLeases(),
    listPayments(),
  ]);
  return { properties, tenants, leases, payments };
}

export async function getLeaseDetail(id: string) {
  const ownerId = await requireOwner();
  const row = await prisma.lease.findFirst({
    where: { id, ownerId },
    include: {
      property: true,
      tenant: true,
      payments: { include: { transactions: true }, orderBy: { dueDate: 'desc' } },
    },
  });
  if (!row) return null;
  const today = todayISO();
  return {
    lease: toLease(row, today),
    property: toProperty(row.property),
    tenant: toTenant(row.tenant),
    payments: row.payments.map((payment) => toPayment(payment, today)),
  };
}
