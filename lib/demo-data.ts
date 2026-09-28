import type { PrismaClient } from '@prisma/client';
import {
  centsToDecimalString,
  dueDateForMonth,
  isoToDate,
  todayISO,
  type ISODate,
} from '@/lib/billing';

/**
 * Fictional demo portfolio for one owner. Dates are relative to today, so the
 * dashboard always shows a current month with paid, partial and overdue rent.
 * Names, ID numbers and phones are invented.
 */

function addMonths(date: ISODate, months: number): ISODate {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, day));
  return shifted.toISOString().slice(0, 10);
}

function addDays(date: ISODate, days: number): ISODate {
  return new Date(isoToDate(date).getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

const properties = [
  { key: 'r101', name: 'Room 101', type: 'ROOM', location: 'Jr. Las Begonias 240', floor: 1, price: '650.00', currency: 'PEN' },
  { key: 'r102', name: 'Room 102', type: 'ROOM', location: 'Jr. Las Begonias 240', floor: 1, price: '650.00', currency: 'PEN' },
  { key: 'r201', name: 'Room 201', type: 'ROOM', location: 'Jr. Las Begonias 240', floor: 2, price: '720.00', currency: 'PEN' },
  { key: 'r202', name: 'Room 202', type: 'ROOM', location: 'Jr. Las Begonias 240', floor: 2, price: '720.00', currency: 'PEN' },
  { key: 'r301', name: 'Room 301', type: 'ROOM', location: 'Jr. Las Begonias 240', floor: 3, price: '780.00', currency: 'PEN' },
  { key: 'c1', name: 'Shop A', type: 'COMMERCIAL', location: 'Av. Primavera 1150', floor: 1, price: '1800.00', currency: 'PEN' },
  { key: 'c2', name: 'Shop B', type: 'COMMERCIAL', location: 'Av. Primavera 1150', floor: 1, price: '950.00', currency: 'USD' },
  { key: 'c3', name: 'Office 3', type: 'COMMERCIAL', location: 'Av. Primavera 1150', floor: 2, price: '600.00', currency: 'USD' },
] as const;

const tenants = [
  { key: 'ana', name: 'Ana Quispe Rojas', dni: '70123456', phone: '987 111 201', email: 'ana.quispe@example.com', address: 'Calle Los Olivos 312, Surquillo' },
  { key: 'luis', name: 'Luis Fernández Soto', dni: '71234567', phone: '987 111 202', email: 'luis.fernandez@example.com', address: 'Av. Angamos 845, Surquillo' },
  { key: 'maria', name: 'María Chávez León', dni: '72345678', phone: '987 111 203', email: 'maria.chavez@example.com', address: 'Jr. Tacna 190, Lince' },
  { key: 'jorge', name: 'Jorge Huamán Díaz', dni: '73456789', phone: '987 111 204', email: 'jorge.huaman@example.com', address: 'Av. Arequipa 2210, Lince' },
  { key: 'rosa', name: 'Café Rosa S.A.C.', dni: '20601234', phone: '987 111 205', email: 'hola@caferosa.example.com', address: 'Av. Primavera 1150, Surco' },
  { key: 'tech', name: 'TechPoint E.I.R.L.', dni: '20609876', phone: '987 111 206', email: 'admin@techpoint.example.com', address: 'Av. Primavera 1150, Surco' },
] as const;

type PaymentPlan = 'paid' | 'late' | 'partial' | 'unpaid';

/**
 * Each lease: which property and tenant, when it started (months ago), and how
 * each of the last months was paid, oldest first; the last entry is this month.
 */
const leases: {
  property: (typeof properties)[number]['key'];
  tenant: (typeof tenants)[number]['key'];
  startedMonthsAgo: number;
  lengthMonths: number;
  plan: PaymentPlan[];
  terminatedMonthsAgo?: number;
}[] = [
  { property: 'r101', tenant: 'ana', startedMonthsAgo: 8, lengthMonths: 12, plan: ['paid', 'paid', 'paid', 'paid', 'paid', 'paid'] },
  { property: 'r102', tenant: 'luis', startedMonthsAgo: 5, lengthMonths: 12, plan: ['paid', 'late', 'paid', 'partial', 'unpaid'] },
  { property: 'r201', tenant: 'maria', startedMonthsAgo: 11, lengthMonths: 12, plan: ['paid', 'paid', 'paid', 'paid', 'late', 'paid'] },
  { property: 'c1', tenant: 'rosa', startedMonthsAgo: 14, lengthMonths: 24, plan: ['paid', 'paid', 'paid', 'paid', 'paid', 'partial'] },
  { property: 'c2', tenant: 'tech', startedMonthsAgo: 3, lengthMonths: 12, plan: ['paid', 'unpaid', 'unpaid'] },
  { property: 'r202', tenant: 'jorge', startedMonthsAgo: 9, lengthMonths: 12, plan: ['paid', 'paid', 'paid'], terminatedMonthsAgo: 4 },
];

/** Replaces every row of `ownerId` with the demo portfolio. */
export async function resetDemoData(prisma: PrismaClient, ownerId: string, today: ISODate = todayISO()) {
  const thisMonth = dueDateForMonth(today);

  await prisma.$transaction(async (tx) => {
    // Payments and transactions cascade from leases' payments; order matters for FKs.
    await tx.payment.deleteMany({ where: { ownerId } });
    await tx.lease.deleteMany({ where: { ownerId } });
    await tx.tenant.deleteMany({ where: { ownerId } });
    await tx.property.deleteMany({ where: { ownerId } });

    const occupied = new Set(leases.filter((l) => l.terminatedMonthsAgo === undefined).map((l) => l.property));
    const propertyIds = new Map<string, string>();
    for (const { key, ...property } of properties) {
      const created = await tx.property.create({
        data: {
          ...property,
          ownerId,
          status: occupied.has(key) ? 'OCCUPIED' : key === 'r301' ? 'MAINTENANCE' : 'AVAILABLE',
        },
      });
      propertyIds.set(key, created.id);
    }

    const tenantIds = new Map<string, string>();
    for (const { key, ...tenant } of tenants) {
      const created = await tx.tenant.create({ data: { ...tenant, ownerId } });
      tenantIds.set(key, created.id);
    }

    for (const plan of leases) {
      const property = properties.find((p) => p.key === plan.property)!;
      const startDate = addMonths(thisMonth, -plan.startedMonthsAgo);
      const terminated = plan.terminatedMonthsAgo !== undefined;
      const lease = await tx.lease.create({
        data: {
          ownerId,
          propertyId: propertyIds.get(plan.property)!,
          tenantId: tenantIds.get(plan.tenant)!,
          startDate: isoToDate(startDate),
          endDate: isoToDate(addDays(addMonths(startDate, plan.lengthMonths), -1)),
          monthlyRent: property.price,
          currency: property.currency,
          status: terminated ? 'TERMINATED' : 'ACTIVE',
          advanceMonths: 1,
          warrantyMonths: property.type === 'COMMERCIAL' ? 2 : 1,
          ...(property.type === 'COMMERCIAL'
            ? { waterCost: '45.00', electricityCost: '120.00', gasCost: '0.00' }
            : {}),
          terminationDate: terminated ? isoToDate(addDays(addMonths(thisMonth, -plan.terminatedMonthsAgo! + 1), -1)) : null,
        },
      });

      const lastMonthOffset = terminated ? -plan.terminatedMonthsAgo! : 0;
      const priceCents = Math.round(Number(property.price) * 100);
      for (let index = 0; index < plan.plan.length; index++) {
        const monthsAgo = -lastMonthOffset + (plan.plan.length - 1 - index);
        const dueDate = addMonths(thisMonth, -monthsAgo);
        if (dueDate > today) continue;
        const kind = plan.plan[index];
        const transactions: { amountCents: number; paidAt: ISODate }[] =
          kind === 'paid'
            ? [{ amountCents: priceCents, paidAt: addDays(dueDate, 2) }]
            : kind === 'late'
              ? [{ amountCents: priceCents, paidAt: addDays(dueDate, 12) }]
              : kind === 'partial'
                ? [{ amountCents: Math.round(priceCents * 0.4), paidAt: addDays(dueDate, 3) }]
                : [];
        // Never record a payment in the future.
        const received = transactions.filter((t) => t.paidAt <= today);
        const paidCents = received.reduce((sum, t) => sum + t.amountCents, 0);
        const lastPaid = received.at(-1)?.paidAt;

        await tx.payment.create({
          data: {
            ownerId,
            leaseId: lease.id,
            dueDate: isoToDate(dueDate),
            amount: property.price,
            amountPaid: centsToDecimalString(paidCents),
            paidDate: lastPaid ? isoToDate(lastPaid) : null,
            transactions: {
              create: received.map((t) => ({ amount: centsToDecimalString(t.amountCents), paidAt: isoToDate(t.paidAt) })),
            },
          },
        });
      }
    }
  }, { timeout: 30_000 });
}
