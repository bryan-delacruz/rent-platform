'use server';

import { Tenant, saveTenant, deleteTenant, readDb } from '@/lib/db';
import { extractTenantData } from '@/lib/form-helpers';
import { generateId, TENANT_PREFIX } from '@/lib/id-generator';
import { revalidateTenants } from '@/lib/revalidation';
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
  const db = await readDb();

  // Check if tenant has any non-draft leases (active, expired, or terminated)
  const hasNonDraftLeases = db.leases.some(
    lease => lease.tenantId === id &&
      (lease.status === 'ACTIVE' || lease.status === 'EXPIRED' || lease.status === 'TERMINATED')
  );

  if (hasNonDraftLeases) {
    throw new Error('No se puede eliminar un arrendatario con contratos activos, expirados o terminados. Por favor, termine primero todos los contratos asociados.');
  }

  await deleteTenant(id);
  revalidateTenants();
}
