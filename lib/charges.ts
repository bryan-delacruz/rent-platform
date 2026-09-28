import 'server-only';
import { prisma } from '@/lib/prisma';
import {
  dateToISO,
  dueDateForMonth,
  isBillableInMonth,
  isoToDate,
  todayISO,
  type ISODate,
} from '@/lib/billing';

/**
 * Creates this month's charge for every billable lease. Safe to run any number
 * of times: the (leaseId, dueDate) unique key skips charges that exist.
 * Used by the landlord's button (one owner) and by the daily cron (everyone).
 */
export async function generateMonthlyCharges(options: {
  ownerId?: string;
  month?: ISODate;
} = {}): Promise<{ created: number }> {
  const dueDate = dueDateForMonth(options.month ?? todayISO());
  const leases = await prisma.lease.findMany({
    where: { status: 'ACTIVE', ...(options.ownerId ? { ownerId: options.ownerId } : {}) },
  });

  const billable = leases.filter((lease) =>
    isBillableInMonth(
      {
        status: lease.status,
        startDate: dateToISO(lease.startDate),
        endDate: dateToISO(lease.endDate),
        terminationDate: lease.terminationDate ? dateToISO(lease.terminationDate) : null,
      },
      dueDate,
    ),
  );
  if (billable.length === 0) return { created: 0 };

  const { count } = await prisma.payment.createMany({
    data: billable.map((lease) => ({
      ownerId: lease.ownerId,
      leaseId: lease.id,
      dueDate: isoToDate(dueDate),
      amount: lease.monthlyRent,
    })),
    skipDuplicates: true,
  });
  return { created: count };
}
