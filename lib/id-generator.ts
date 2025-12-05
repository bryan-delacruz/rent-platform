/**
 * Entity ID prefixes
 */
export const PROPERTY_PREFIX = 'prop';
export const TENANT_PREFIX = 'tenant';
export const LEASE_PREFIX = 'lease';
export const PAYMENT_PREFIX = 'pay';
export const TRANSACTION_PREFIX = 'tx';

/**
 * Generates a unique ID with the given prefix
 * @param prefix - The prefix to use for the ID
 * @returns A unique ID in the format: {prefix}_{timestamp}
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * Generates a unique ID with additional random suffix for collision prevention
 * @param prefix - The prefix to use for the ID
 * @returns A unique ID in the format: {prefix}_{timestamp}_{random}
 */
export function generateUniqueId(prefix: string): string {
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${Date.now()}_${random}`;
}
