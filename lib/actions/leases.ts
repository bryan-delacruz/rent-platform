'use server';

import { prisma } from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { isoToDate } from '@/lib/billing';
import {
  leaseSchema,
  leaseUpdateSchema,
  parse,
  terminateLeaseSchema,
} from '@/lib/validation';
import { revalidateLeases } from '@/lib/revalidation';
import type { ActionResult } from '@/lib/types';
import { ActionError, fail, ok, run } from './result';

function utilityCosts(
  isCommercial: boolean,
  input: { waterCost?: string; electricityCost?: string; gasCost?: string },
) {
  if (!isCommercial) return { waterCost: null, electricityCost: null, gasCost: null };
  return {
    waterCost: input.waterCost ?? '0',
    electricityCost: input.electricityCost ?? '0',
    gasCost: input.gasCost ?? '0',
  };
}

export async function createLease(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const ownerId = await requireOwner();
  const input = parse(leaseSchema, formData);
  if (!input.ok) return fail('validation', input.fields);
  const data = input.data;
  if (data.endDate <= data.startDate) return fail('invalidDates', ['endDate']);

  return run(async () => {
    const lease = await prisma.$transaction(async (tx) => {
      const [property, tenant] = await Promise.all([
        tx.property.findFirst({ where: { id: data.propertyId, ownerId } }),
        tx.tenant.findFirst({ where: { id: data.tenantId, ownerId } }),
      ]);
      if (!property || !tenant) throw new ActionError('notFound');
      if (property.status !== 'AVAILABLE') throw new ActionError('propertyUnavailable');

      // Claim the property atomically so two leases can't take it at once.
      const claimed = await tx.property.updateMany({
        where: { id: property.id, ownerId, status: 'AVAILABLE' },
        data: { status: 'OCCUPIED' },
      });
      if (claimed.count === 0) throw new ActionError('propertyUnavailable');

      return tx.lease.create({
        data: {
          ownerId,
          propertyId: property.id,
          tenantId: tenant.id,
          startDate: isoToDate(data.startDate),
          endDate: isoToDate(data.endDate),
          monthlyRent: data.monthlyRent,
          currency: data.currency,
          status: 'ACTIVE',
          advanceMonths: data.advanceMonths,
          warrantyMonths: data.warrantyMonths,
          ...utilityCosts(property.type === 'COMMERCIAL', data),
        },
      });
    });
    revalidateLeases();
    return ok({ id: lease.id });
  });
}

export async function updateLease(id: string, formData: FormData): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(leaseUpdateSchema, formData);
  if (!input.ok) return fail('validation', input.fields);
  const data = input.data;
  if (data.endDate <= data.startDate) return fail('invalidDates', ['endDate']);

  return run(async () => {
    const lease = await prisma.lease.findFirst({ where: { id, ownerId }, include: { property: true } });
    if (!lease) throw new ActionError('notFound');
    await prisma.lease.update({
      where: { id },
      data: {
        startDate: isoToDate(data.startDate),
        endDate: isoToDate(data.endDate),
        monthlyRent: data.monthlyRent,
        currency: data.currency,
        advanceMonths: data.advanceMonths,
        warrantyMonths: data.warrantyMonths,
        ...utilityCosts(lease.property.type === 'COMMERCIAL', data),
      },
    });
    revalidateLeases();
    return ok();
  });
}

export async function terminateLease(id: string, terminationDate: string): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(terminateLeaseSchema, { id, terminationDate });
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.findFirst({ where: { id, ownerId, status: 'ACTIVE' } });
      if (!lease) throw new ActionError('notFound');
      if (input.data.terminationDate < lease.startDate.toISOString().slice(0, 10)) {
        throw new ActionError('invalidDates');
      }
      await tx.lease.update({
        where: { id },
        data: { status: 'TERMINATED', terminationDate: isoToDate(input.data.terminationDate) },
      });
      await tx.property.update({ where: { id: lease.propertyId }, data: { status: 'AVAILABLE' } });
    });
    revalidateLeases();
    return ok();
  });
}
