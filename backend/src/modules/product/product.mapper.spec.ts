import { computeFinalPrice } from './product.mapper';
import { Prisma } from '@prisma/client';

describe('computeFinalPrice', () => {
  it('returns base price when there is no discount', () => {
    expect(computeFinalPrice(new Prisma.Decimal(100))).toBe(100);
  });

  it('applies a percentage discount', () => {
    expect(computeFinalPrice(new Prisma.Decimal(100), { type: 'PERCENT', value: 20 })).toBe(80);
  });

  it('applies a fixed discount', () => {
    expect(computeFinalPrice(new Prisma.Decimal(50), { type: 'FIXED', value: 15 })).toBe(35);
  });

  it('never returns a negative price', () => {
    expect(computeFinalPrice(new Prisma.Decimal(10), { type: 'FIXED', value: 50 })).toBe(0);
  });

  it('rounds to two decimals', () => {
    expect(computeFinalPrice(new Prisma.Decimal(99.99), { type: 'PERCENT', value: 10 })).toBe(89.99);
  });
});
