import { prisma } from './prisma';
import type {
  Property as PrismaProperty,
  Tenant as PrismaTenant,
  Lease as PrismaLease,
  Payment as PrismaPayment,
  PropertyType,
  PropertyStatus,
} from '@prisma/client';

// Re-export types from Prisma
export type { PropertyType, PropertyStatus };
export type Property = PrismaProperty;
export type Tenant = PrismaTenant;
export type Lease = PrismaLease;
export type Payment = PrismaPayment;

export interface Database {
  properties: Property[];
  tenants: Tenant[];
  leases: Lease[];
  payments: Payment[];
}

// Legacy compatibility: readDb returns all data
export async function readDb(): Promise<Database> {
  const [properties, tenants, leases, payments] = await Promise.all([
    prisma.property.findMany(),
    prisma.tenant.findMany(),
    prisma.lease.findMany(),
    prisma.payment.findMany(),
  ]);

  return {
    properties,
    tenants,
    leases,
    payments,
  };
}

// Deprecated: Prisma handles writes automatically
export async function writeDb(data: Database): Promise<void> {
  console.warn('writeDb is deprecated with Prisma. Use direct Prisma operations instead.');
}

/**
 * Generic repository operations using Prisma
 */
interface Repository<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | null>;
  save: (entity: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

/**
 * Creates a generic repository for an entity type using Prisma
 */
function createRepository<T extends { id: string }>(
  model: any
): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      return model.findMany() as Promise<T[]>;
    },

    async getById(id: string): Promise<T | null> {
      return model.findUnique({ where: { id } }) as Promise<T | null>;
    },

    async save(entity: T): Promise<void> {
      await model.upsert({
        where: { id: entity.id },
        update: entity,
        create: entity,
      });
    },

    async delete(id: string): Promise<void> {
      await model.delete({ where: { id } });
    },
  };
}

// Create repositories for each entity
const propertyRepo = createRepository<Property>(prisma.property);
const tenantRepo = createRepository<Tenant>(prisma.tenant);
const leaseRepo = createRepository<Lease>(prisma.lease);
const paymentRepo = createRepository<Payment>(prisma.payment);

// Export functions with original names for backward compatibility
export const getProperties = propertyRepo.getAll;
export const getProperty = propertyRepo.getById;
export const saveProperty = propertyRepo.save;
export const deleteProperty = propertyRepo.delete;

export const getTenants = tenantRepo.getAll;
export const saveTenant = tenantRepo.save;
export const deleteTenant = tenantRepo.delete;

export const getLeases = leaseRepo.getAll;
export const saveLease = leaseRepo.save;

export const getPayments = paymentRepo.getAll;
