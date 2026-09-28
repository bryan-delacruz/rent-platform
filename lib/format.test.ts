import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney, formatPhone } from './format';

describe('formatMoney', () => {
  it('uses S/ for soles in both languages', () => {
    expect(formatMoney(1650, 'PEN', 'en')).toBe('S/ 1,650.00');
    expect(formatMoney(1650, 'PEN', 'es')).toBe('S/ 1,650.00');
  });

  it('uses $ in English and US$ in Spanish for dollars', () => {
    expect(formatMoney(950.5, 'USD', 'en')).toBe('$950.50');
    expect(formatMoney(950.5, 'USD', 'es')).toBe('US$ 950.50');
  });

  it('puts the sign before the symbol', () => {
    expect(formatMoney(-20, 'PEN', 'en')).toBe('-S/ 20.00');
  });
});

describe('formatDate', () => {
  it('keeps the calendar day regardless of timezone', () => {
    expect(formatDate('2026-09-01', 'en')).toBe('Sep 1, 2026');
  });
});

describe('formatPhone', () => {
  it('groups a 9-digit mobile number', () => {
    expect(formatPhone('987111201')).toBe('987 111 201');
  });

  it('leaves other formats untouched', () => {
    expect(formatPhone('+51 1 234 5678')).toBe('+51 1 234 5678');
  });
});
