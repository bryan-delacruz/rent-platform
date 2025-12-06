'use server';

import { saveProperty, Property, PropertyType, PropertyStatus, deleteProperty } from '@/lib/db';
import { extractPropertyData } from '@/lib/form-helpers';
import { generateId, PROPERTY_PREFIX } from '@/lib/id-generator';
import { revalidateProperties } from '@/lib/revalidation';
import { hasActiveRelatedLeases, createDeleteValidationError } from '@/lib/validators';
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
  if (await hasActiveRelatedLeases(id, 'propertyId')) {
    throw createDeleteValidationError('una propiedad');
  }

  await deleteProperty(id);
  revalidateProperties();
}
