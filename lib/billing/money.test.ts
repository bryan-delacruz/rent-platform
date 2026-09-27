import { describe, expect, it } from 'vitest';
import { centsToAmount, centsToDecimalString, isCurrency, sumCents, toCents } from './money';

describe('toCents', () => {
  it.each([
    ['1200', 120000],
    ['1200.5', 120050],
    ['1200.50', 120050],
    ['0.07', 7],
    ['0', 0],
    ['-15.25', -1525],
  ])('parses %s', (input, expected) => {
    expect(toCents(input)).toBe(expected);
  });

  it('rounds half up on the third decimal', () => {
    expect(toCents('10.005')).toBe(1001);
    expect(toCents('10.004')).toBe(1000);
  });

  it('accepts numbers without float drift', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(1234.56)).toBe(123456);
  });

  it('accepts Decimal-like objects', () => {
    expect(toCents({ toString: () => '850.00' })).toBe(85000);
  });

  it('rejects malformed input', () => {
    expect(() => toCents('12,50')).toThrow();
    expect(() => toCents('abc')).toThrow();
  });
});

describe('cents conversions', () => {
  it('formats cents as a Decimal string', () => {
    expect(centsToDecimalString(120050)).toBe('1200.50');
    expect(centsToDecimalString(7)).toBe('0.07');
    expect(centsToDecimalString(-1525)).toBe('-15.25');
  });

  it('converts cents to major units', () => {
    expect(centsToAmount(120050)).toBe(1200.5);
  });

  it('sums cents exactly', () => {
    expect(sumCents([10, 20, 30])).toBe(60);
    expect(sumCents([])).toBe(0);
  });
});

describe('isCurrency', () => {
  it('accepts only supported currencies', () => {
    expect(isCurrency('PEN')).toBe(true);
    expect(isCurrency('USD')).toBe(true);
    expect(isCurrency('EUR')).toBe(false);
  });
});
