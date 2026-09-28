import { describe, expect, it } from 'vitest';
import { leaseSchema, parse, propertySchema, registerPaymentSchema, tenantSchema } from './validation';

const form = (values: Record<string, string>) => {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
};

describe('propertySchema', () => {
  const valid = { name: 'Room 101', type: 'ROOM', location: 'Miraflores', floor: '1', price: '850.50', currency: 'PEN' };

  it('accepts a valid property and coerces numbers', () => {
    const result = parse(propertySchema, form(valid));
    expect(result).toEqual({ ok: true, data: { ...valid, floor: 1 } });
  });

  it('rejects non-positive or malformed prices', () => {
    expect(parse(propertySchema, form({ ...valid, price: '0' }))).toEqual({ ok: false, fields: ['price'] });
    expect(parse(propertySchema, form({ ...valid, price: '12.345' }))).toEqual({ ok: false, fields: ['price'] });
  });

  it('rejects unknown enum values', () => {
    expect(parse(propertySchema, form({ ...valid, type: 'HOUSE', currency: 'EUR' }))).toEqual({
      ok: false,
      fields: ['type', 'currency'],
    });
  });
});

describe('tenantSchema', () => {
  const valid = { name: 'Ana Torres', dni: '45678912', phone: '+51 987 654 321', email: 'ana@example.com', address: 'Av. Siempre Viva 123' };

  it('accepts a valid tenant', () => {
    expect(parse(tenantSchema, form(valid)).ok).toBe(true);
  });

  it('reports every invalid field', () => {
    const result = parse(tenantSchema, form({ ...valid, email: 'not-an-email', phone: 'call me' }));
    expect(result).toEqual({ ok: false, fields: ['phone', 'email'] });
  });
});

describe('leaseSchema', () => {
  const valid = {
    propertyId: 'p1', tenantId: 't1', startDate: '2026-01-01', endDate: '2026-12-31',
    monthlyRent: '800', currency: 'PEN', advanceMonths: '1', warrantyMonths: '2', waterCost: '',
  };

  it('treats empty utility costs as missing', () => {
    const result = parse(leaseSchema, form(valid));
    expect(result.ok && result.data.waterCost).toBeUndefined();
  });

  it('rejects impossible dates', () => {
    expect(parse(leaseSchema, form({ ...valid, endDate: '2026-02-30' }))).toEqual({ ok: false, fields: ['endDate'] });
  });
});

describe('registerPaymentSchema', () => {
  it('requires a positive amount with at most two decimals', () => {
    expect(parse(registerPaymentSchema, { paymentId: 'x', amount: '100.25' }).ok).toBe(true);
    expect(parse(registerPaymentSchema, { paymentId: 'x', amount: '-5' }).ok).toBe(false);
  });
});
