import { z } from 'zod';
import { isISODate } from '@/lib/billing';

/**
 * Input schemas for every server action. Forms send strings, so numbers and
 * dates are coerced and checked here before anything reaches the database.
 */

const text = (max: number) => z.string().trim().min(1).max(max);

const money = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'money')
  .refine((value) => Number(value) > 0, 'positive');

const optionalMoney = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/)
  .optional()
  .or(z.literal('').transform(() => undefined));

const isoDate = z.string().refine(isISODate, 'date');

const currency = z.enum(['PEN', 'USD']);

export const propertySchema = z.object({
  name: text(80),
  type: z.enum(['ROOM', 'COMMERCIAL']),
  location: text(120),
  floor: z.coerce.number().int().min(-5).max(200),
  price: money,
  currency,
});

export const propertyUpdateSchema = propertySchema.extend({
  status: z.enum(['AVAILABLE', 'MAINTENANCE']).optional(),
});

export const tenantSchema = z.object({
  name: text(120),
  dni: z.string().trim().regex(/^[0-9A-Za-z-]{6,15}$/, 'dni'),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'phone'),
  email: z.string().trim().email().max(160),
  address: text(200),
});

const leaseTerms = z.object({
  startDate: isoDate,
  endDate: isoDate,
  monthlyRent: money,
  currency,
  advanceMonths: z.coerce.number().int().min(0).max(24),
  warrantyMonths: z.coerce.number().int().min(0).max(24),
  waterCost: optionalMoney,
  electricityCost: optionalMoney,
  gasCost: optionalMoney,
});

export const leaseSchema = leaseTerms.extend({
  propertyId: z.string().min(1),
  tenantId: z.string().min(1),
});

export const leaseUpdateSchema = leaseTerms;

export const terminateLeaseSchema = z.object({
  id: z.string().min(1),
  terminationDate: isoDate,
});

export const registerPaymentSchema = z.object({
  paymentId: z.string().min(1),
  amount: money,
  paidAt: isoDate.optional(),
});

export const updatePaymentSchema = z.object({
  paymentId: z.string().min(1),
  amount: money,
  dueDate: isoDate,
});

export type ParseResult<T> = { ok: true; data: T } | { ok: false; fields: string[] };

/** Validates FormData (or a plain object) and lists the invalid field names. */
export function parse<T>(schema: z.ZodType<T>, input: FormData | Record<string, unknown>): ParseResult<T> {
  const values = input instanceof FormData ? Object.fromEntries(input.entries()) : input;
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const fields = [...new Set(result.error.issues.map((issue) => String(issue.path[0] ?? '')))];
  return { ok: false, fields };
}
