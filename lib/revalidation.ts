import { revalidatePath } from 'next/cache';

/**
 * Revalidates all paths related to properties
 */
export function revalidateProperties(): void {
  revalidatePath('/properties');
}

/**
 * Revalidates all paths related to tenants
 */
export function revalidateTenants(): void {
  revalidatePath('/tenants');
}

/**
 * Revalidates all paths related to leases and their associated properties
 */
export function revalidateLeases(): void {
  revalidatePath('/leases');
  revalidatePath('/properties');
}

/**
 * Revalidates all paths related to payments
 * @param leaseId - Optional lease ID to revalidate specific lease history page
 */
export function revalidatePayments(leaseId?: string): void {
  revalidatePath('/payments');
  revalidatePath('/'); // Dashboard

  if (leaseId) {
    revalidatePath(`/leases/${leaseId}`);
  }
}
