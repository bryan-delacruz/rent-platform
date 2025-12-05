import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export type PropertyType = 'ROOM' | 'COMMERCIAL';
export type PropertyStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: 'USD' | 'PEN';
  location: 'Los Naranjales' | 'Los Pinos';
  floor: number;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  currency: 'USD' | 'PEN';
  status: 'DRAFT' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
  advanceMonths: number;
  warrantyMonths: number;
  utilityCosts?: {
    water: number;
    electricity: number;
    gas: number;
  };
  terminationDate?: string;
}

export interface Payment {
  id: string;
  leaseId: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  paidDate: string | null;
  transactions?: {
    id: string;
    date: string;
    amount: number;
    note?: string;
  }[];
}

export interface Database {
  properties: Property[];
  tenants: Tenant[];
  leases: Lease[];
  payments: Payment[];
}

export async function readDb(): Promise<Database> {
  const data = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeDb(data: Database): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Generic repository operations for any entity type
 */
type EntityKey = keyof Database;

interface Repository<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  save: (entity: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

/**
 * Creates a generic repository for an entity type
 * Implements DRY by avoiding duplicate CRUD operations
 */
function createRepository<T extends { id: string }>(entityKey: EntityKey): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      const db = await readDb();
      return db[entityKey] as unknown as T[];
    },

    async getById(id: string): Promise<T | undefined> {
      const db = await readDb();
      const entities = db[entityKey] as unknown as T[];
      return entities.find((e) => e.id === id);
    },

    async save(entity: T): Promise<void> {
      const db = await readDb();
      const entities = db[entityKey] as unknown as T[];
      const index = entities.findIndex((e) => e.id === entity.id);

      if (index >= 0) {
        entities[index] = entity;
      } else {
        entities.push(entity);
      }

      await writeDb(db);
    },

    async delete(id: string): Promise<void> {
      const db = await readDb();
      const entities = db[entityKey] as unknown as T[];
      db[entityKey] = entities.filter((e) => e.id !== id) as any;
      await writeDb(db);
    },
  };
}

// Create repositories for each entity
const propertyRepo = createRepository<Property>('properties');
const tenantRepo = createRepository<Tenant>('tenants');
const leaseRepo = createRepository<Lease>('leases');
const paymentRepo = createRepository<Payment>('payments');

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


