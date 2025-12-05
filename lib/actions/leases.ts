'use server';

import { readDb, writeDb, Lease } from '@/lib/db';
import { extractLeaseData } from '@/lib/form-helpers';
import { generateId, LEASE_PREFIX } from '@/lib/id-generator';
import { revalidateLeases } from '@/lib/revalidation';
import { redirect } from 'next/navigation';

export async function createLease(formData: FormData) {
  const data = extractLeaseData(formData, true);
  const db = await readDb();

  // Check if property is available
  const propertyIndex = db.properties.findIndex(p => p.id === data.propertyId);
  if (propertyIndex === -1 || db.properties[propertyIndex].status !== 'AVAILABLE') {
    throw new Error('Property not available');
  }

  const propertyType = db.properties[propertyIndex].type;

  const newLease: Lease = {
    id: generateId(LEASE_PREFIX),
    propertyId: data.propertyId!,
    tenantId: data.tenantId!,
    startDate: data.startDate,
    endDate: data.endDate,
    monthlyRent: data.monthlyRent,
    currency: data.currency,
    status: 'ACTIVE',
    advanceMonths: data.advanceMonths,
    warrantyMonths: data.warrantyMonths,
    ...(propertyType === 'COMMERCIAL' && {
      utilityCosts: {
        water: data.waterCost || 0,
        electricity: data.electricityCost || 0,
        gas: data.gasCost || 0,
      },
    }),
  };

  db.leases.push(newLease);
  db.properties[propertyIndex].status = 'OCCUPIED';

  await writeDb(db);
  revalidateLeases();
  redirect('/leases');
}

export async function terminateLeaseAction(id: string, terminationDate: string) {
  const db = await readDb();
  const leaseIndex = db.leases.findIndex(l => l.id === id);

  if (leaseIndex >= 0) {
    const lease = db.leases[leaseIndex];
    lease.status = 'TERMINATED';
    lease.terminationDate = terminationDate;

    // Free up the property
    const propertyIndex = db.properties.findIndex(p => p.id === lease.propertyId);
    if (propertyIndex >= 0) {
      db.properties[propertyIndex].status = 'AVAILABLE';
    }

    await writeDb(db);
    revalidateLeases();
  }
}

export async function updateLease(id: string, formData: FormData) {
  const data = extractLeaseData(formData, false);
  const db = await readDb();
  const leaseIndex = db.leases.findIndex(l => l.id === id);

  if (leaseIndex === -1) return;

  const oldLease = db.leases[leaseIndex];

  // Update lease
  const updatedLease: Lease = {
    ...oldLease,
    startDate: data.startDate,
    endDate: data.endDate,
    monthlyRent: data.monthlyRent,
    currency: data.currency,
    advanceMonths: data.advanceMonths,
    warrantyMonths: data.warrantyMonths,
    ...(oldLease.utilityCosts && {
      utilityCosts: {
        water: data.waterCost || 0,
        electricity: data.electricityCost || 0,
        gas: data.gasCost || 0,
      },
    }),
  };

  db.leases[leaseIndex] = updatedLease;

  await writeDb(db);
  revalidateLeases();
}
