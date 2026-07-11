import { describe, expect, it } from 'vitest';
import { formatPrice, classForStatus } from './format';

describe('formatPrice', () => {
  it('formats USD with two decimals', () => {
    expect(formatPrice(19.99)).toBe('$19.99');
  });

  it('rounds and pads correctly', () => {
    expect(formatPrice(5)).toBe('$5.00');
  });
});

describe('classForStatus', () => {
  it('returns a class for known statuses', () => {
    expect(classForStatus('PAID')).toContain('emerald');
  });

  it('falls back for unknown status', () => {
    expect(classForStatus('WHATEVER')).toContain('muted');
  });
});
