import { prisma } from './prisma';

/**
 * Validates if an entity has active, expired, or terminated leases
 */
export async function hasActiveRelatedLeases(
  entityId: string,
  relationType: 'propertyId' | 'tenantId'
): Promise<boolean> {
  const count = await prisma.lease.count({
    where: {
      [relationType]: entityId,
      status: { in: ['ACTIVE', 'EXPIRED', 'TERMINATED'] }
    }
  });
  return count > 0;
}

/**
 * Creates a standardized error message for delete validation failures
 */
export function createDeleteValidationError(entityType: string): Error {
  return new Error(
    `No se puede eliminar ${entityType} con contratos activos, expirados o terminados. ` +
    `Por favor, termine primero todos los contratos asociados.`
  );
}
