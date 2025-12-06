'use server';

import { prisma } from '@/lib/prisma';
import { extractLeaseData } from '@/lib/form-helpers';
import { generateId, LEASE_PREFIX } from '@/lib/id-generator';
import { revalidateLeases } from '@/lib/revalidation';
import { redirect } from 'next/navigation';

export async function createLease(formData: FormData) {
  const data = extractLeaseData(formData, true);

  // Check if property is available
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId! },
  });

  if (!property || property.status !== 'AVAILABLE') {
    throw new Error('Property not available');
  }

  const propertyType = property.type;

  // Create lease and update property status in a transaction
  await prisma.$transaction(async (tx) => {
    // Create the lease
    await tx.lease.create({
      data: {
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
      },
    });

    // Update property status to OCCUPIED
    await tx.property.update({
      where: { id: data.propertyId! },
      data: { status: 'OCCUPIED' },
    });
  });

  revalidateLeases();
  redirect('/leases');
}

export async function terminateLeaseAction(id: string, terminationDate: string) {
  const lease = await prisma.lease.findUnique({
    where: { id },
  });

  if (!lease) return;

  // Terminate lease and free up property in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.lease.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        terminationDate,
      },
    });

    await tx.property.update({
      where: { id: lease.propertyId },
      data: { status: 'AVAILABLE' },
    });
  });

  revalidateLeases();
}

export async function updateLease(id: string, formData: FormData) {
  const data = extractLeaseData(formData, false);

  const lease = await prisma.lease.findUnique({
    where: { id },
  });

  if (!lease) return;

  await prisma.lease.update({
    where: { id },
    data: {
      startDate: data.startDate,
      endDate: data.endDate,
      monthlyRent: data.monthlyRent,
      currency: data.currency,
      advanceMonths: data.advanceMonths,
      warrantyMonths: data.warrantyMonths,
      ...(lease.utilityCosts && {
        utilityCosts: {
          water: data.waterCost || 0,
          electricity: data.electricityCost || 0,
          gas: data.gasCost || 0,
        },
      }),
    },
  });

  revalidateLeases();
}
