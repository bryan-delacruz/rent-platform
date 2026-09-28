'use server';

import { prisma } from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { parse, tenantSchema } from '@/lib/validation';
import { revalidateTenants } from '@/lib/revalidation';
import type { ActionResult } from '@/lib/types';
import { ActionError, fail, ok, run } from './result';

export async function createTenant(formData: FormData): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(tenantSchema, formData);
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    await prisma.tenant.create({ data: { ...input.data, ownerId } });
    revalidateTenants();
    return ok();
  });
}

export async function updateTenant(id: string, formData: FormData): Promise<ActionResult> {
  const ownerId = await requireOwner();
  const input = parse(tenantSchema, formData);
  if (!input.ok) return fail('validation', input.fields);

  return run(async () => {
    const { count } = await prisma.tenant.updateMany({ where: { id, ownerId }, data: input.data });
    if (count === 0) throw new ActionError('notFound');
    revalidateTenants();
    return ok();
  });
}

export async function deleteTenant(id: string): Promise<ActionResult> {
  const ownerId = await requireOwner();
  return run(async () => {
    const tenant = await prisma.tenant.findFirst({
      where: { id, ownerId },
      include: { _count: { select: { leases: true } } },
    });
    if (!tenant) throw new ActionError('notFound');
    if (tenant._count.leases > 0) throw new ActionError('hasLeases');
    await prisma.tenant.delete({ where: { id } });
    revalidateTenants();
    return ok();
  });
}
