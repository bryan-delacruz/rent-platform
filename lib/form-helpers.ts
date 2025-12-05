import { PropertyType, PropertyStatus } from './db';

/**
 * Extracts a string value from FormData
 */
export function extractString(formData: FormData, key: string): string {
  return formData.get(key) as string;
}

/**
 * Extracts a number value from FormData
 */
export function extractNumber(formData: FormData, key: string, defaultValue = 0): number {
  const value = formData.get(key);
  return value ? Number(value) : defaultValue;
}

/**
 * Extracts currency type from FormData
 */
export function extractCurrency(formData: FormData): 'USD' | 'PEN' {
  return formData.get('currency') as 'USD' | 'PEN';
}

/**
 * Extracts location from FormData
 */
export function extractLocation(formData: FormData): 'Los Naranjales' | 'Los Pinos' {
  return formData.get('location') as 'Los Naranjales' | 'Los Pinos';
}

// Property-specific helpers
export interface PropertyFormData {
  name: string;
  type: PropertyType;
  price: number;
  currency: 'USD' | 'PEN';
  location: 'Los Naranjales' | 'Los Pinos';
  floor: number;
  status?: PropertyStatus;
}

export function extractPropertyData(formData: FormData, includeStatus = false): PropertyFormData {
  const data: PropertyFormData = {
    name: extractString(formData, 'name'),
    type: formData.get('type') as PropertyType,
    price: extractNumber(formData, 'price'),
    currency: extractCurrency(formData),
    location: extractLocation(formData),
    floor: extractNumber(formData, 'floor'),
  };

  if (includeStatus) {
    data.status = formData.get('status') as PropertyStatus;
  }

  return data;
}

// Tenant-specific helpers
export interface TenantFormData {
  name: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
}

export function extractTenantData(formData: FormData): TenantFormData {
  return {
    name: extractString(formData, 'name'),
    email: extractString(formData, 'email'),
    phone: extractString(formData, 'phone'),
    dni: extractString(formData, 'dni'),
    address: extractString(formData, 'address'),
  };
}

// Lease-specific helpers
export interface LeaseFormData {
  propertyId?: string;
  tenantId?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  currency: 'USD' | 'PEN';
  advanceMonths: number;
  warrantyMonths: number;
  waterCost?: number;
  electricityCost?: number;
  gasCost?: number;
}

export function extractLeaseData(formData: FormData, includeIds = true): LeaseFormData {
  const data: LeaseFormData = {
    startDate: extractString(formData, 'startDate'),
    endDate: extractString(formData, 'endDate'),
    monthlyRent: extractNumber(formData, 'monthlyRent'),
    currency: extractCurrency(formData),
    advanceMonths: extractNumber(formData, 'advanceMonths'),
    warrantyMonths: extractNumber(formData, 'warrantyMonths'),
    waterCost: extractNumber(formData, 'waterCost', 0),
    electricityCost: extractNumber(formData, 'electricityCost', 0),
    gasCost: extractNumber(formData, 'gasCost', 0),
  };

  if (includeIds) {
    data.propertyId = extractString(formData, 'propertyId');
    data.tenantId = extractString(formData, 'tenantId');
  }

  return data;
}
