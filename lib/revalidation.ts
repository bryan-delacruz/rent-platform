import { revalidatePath } from 'next/cache';

export function revalidateProperties(): void {
  revalidatePath('/properties');
  revalidatePath('/dashboard');
}

export function revalidateTenants(): void {
  revalidatePath('/tenants');
}

export function revalidateLeases(): void {
  revalidatePath('/leases', 'layout');
  revalidatePath('/properties');
  revalidatePath('/dashboard');
}

export function revalidatePayments(leaseId?: string): void {
  revalidatePath('/payments');
  revalidatePath('/dashboard');
  if (leaseId) revalidatePath(`/leases/${leaseId}`);
}
