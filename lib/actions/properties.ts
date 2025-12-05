'use server';

import { saveProperty, Property, PropertyType, PropertyStatus, deleteProperty, readDb } from '@/lib/db';
import { extractPropertyData } from '@/lib/form-helpers';
import { generateId, PROPERTY_PREFIX } from '@/lib/id-generator';
import { revalidateProperties } from '@/lib/revalidation';
import { redirect } from 'next/navigation';

export async function createProperty(formData: FormData) {
  const data = extractPropertyData(formData);

  const newProperty: Property = {
    id: generateId(PROPERTY_PREFIX),
    ...data,
    status: 'AVAILABLE', // Default status
  };

  await saveProperty(newProperty);
  revalidateProperties();
  redirect('/properties');
}

export async function updateProperty(id: string, formData: FormData) {
  const data = extractPropertyData(formData, true);

  const updatedProperty: Property = {
    id,
    ...data,
    status: data.status!, // We know status exists when includeStatus=true
  };

  await saveProperty(updatedProperty);
  revalidateProperties();
  redirect('/properties');
}

export async function deletePropertyAction(id: string) {
  const db = await readDb();

  // Check if property has any non-draft leases (active, expired, or terminated)
  const hasNonDraftLeases = db.leases.some(
    lease => lease.propertyId === id &&
      (lease.status === 'ACTIVE' || lease.status === 'EXPIRED' || lease.status === 'TERMINATED')
  );

  if (hasNonDraftLeases) {
    throw new Error('No se puede eliminar una propiedad con contratos activos, expirados o terminados. Por favor, termine primero todos los contratos asociados.');
  }

  await deleteProperty(id);
  revalidateProperties();
}
