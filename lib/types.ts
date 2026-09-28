import type { Currency, ISODate, PaymentStatus } from '@/lib/billing';

/**
 * Plain, serializable shapes sent from the server to client components.
 * Decimals become numbers in major units and dates become ISO strings; all
 * money math happens on the server or in lib/billing with integer cents.
 */

export type { Currency, ISODate, PaymentStatus };

export type PropertyType = 'ROOM' | 'COMMERCIAL';
export type PropertyStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
export type LeaseStatus = 'DRAFT' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: Currency;
  location: string;
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

export interface UtilityCosts {
  water: number;
  electricity: number;
  gas: number;
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: ISODate;
  endDate: ISODate;
  monthlyRent: number;
  currency: Currency;
  status: LeaseStatus;
  advanceMonths: number;
  warrantyMonths: number;
  utilityCosts: UtilityCosts | null;
  terminationDate: ISODate | null;
}

export interface PaymentTransaction {
  id: string;
  date: ISODate;
  amount: number;
}

export interface Payment {
  id: string;
  leaseId: string;
  dueDate: ISODate;
  amount: number;
  amountPaid: number;
  paidDate: ISODate | null;
  status: PaymentStatus;
  overdueDays: number;
  transactions: PaymentTransaction[];
}

/** Result of every server action, so the UI can show a translated message. */
export type ActionErrorCode =
  | 'validation'
  | 'notFound'
  | 'propertyUnavailable'
  | 'hasLeases'
  | 'duplicateDni'
  | 'invalidDates'
  | 'overpayment'
  | 'unknown';

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: ActionErrorCode; fields?: string[] };
