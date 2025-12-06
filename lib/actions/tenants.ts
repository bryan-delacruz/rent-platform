'use server';

import { Tenant, saveTenant, deleteTenant } from '@/lib/db';
import { extractTenantData } from '@/lib/form-helpers';
import { generateId, TENANT_PREFIX } from '@/lib/id-generator';
import { revalidateTenants } from '@/lib/revalidation';
import { hasActiveRelatedLeases, createDeleteValidationError } from '@/lib/validators';
import { redirect } from 'next/navigation';

export async function createTenant(formData: FormData) {
  const data = extractTenantData(formData);

  const newTenant: Tenant = {
    id: generateId(TENANT_PREFIX),
    ...data,
  };

  await saveTenant(newTenant);
  revalidateTenants();
  redirect('/tenants');
}

export async function updateTenant(id: string, formData: FormData) {
  const data = extractTenantData(formData);

  const updatedTenant: Tenant = {
    id,
    ...data,
  };

  await saveTenant(updatedTenant);
  revalidateTenants();
}

export async function deleteTenantAction(id: string) {
  if (await hasActiveRelatedLeases(id, 'tenantId')) {
    throw createDeleteValidationError('un arrendatario');
  }

  await deleteTenant(id);
  revalidateTenants();
}
