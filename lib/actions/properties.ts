'use server';

import { prisma } from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { parse, propertySchema, propertyUpdateSchema } from '@/lib/validation';
import { revalidateProperties } from '@/lib/revalidation';
import type { ActionResult } from '@/lib/types';
import { ActionError, fail, ok, run } from './result';

export async function createProperty(formData: FormData): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(propertySchema, formData);
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    await prisma.property.create({ data: { ...input.data, ownerId, status: 'AVAILABLE' } });
    revalidateProperties();
    return ok();
  });
}

export async function updateProperty(id: string, formData: FormData): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(propertyUpdateSchema, formData);
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    const { status, ...fields } = input.data;
    // OCCUPIED is managed by leases, so a landlord can only toggle maintenance.
    const current = await prisma.property.findFirst({ where: { id, ownerId } });
    if (!current) throw new ActionError('notFound');
    await prisma.property.update({
      where: { id },
      data: { ...fields, ...(current.status !== 'OCCUPIED' && status ? { status } : {}) },
    });
    revalidateProperties();
    return ok();
  });
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const ownerId = await requireOwner();
  return run(async () => {
    const property = await prisma.property.findFirst({
      where: { id, ownerId },
      include: { _count: { select: { leases: true } } },
    });
    if (!property) throw new ActionError('notFound');
    if (property._count.leases > 0) throw new ActionError('hasLeases');
    await prisma.property.delete({ where: { id } });
    revalidateProperties();
    return ok();
  });
}
