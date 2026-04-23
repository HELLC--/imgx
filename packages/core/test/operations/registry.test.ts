import { describe, it, expect } from 'vitest';
import { parseKV, serializeKV, clamp } from '../../src/operations/types';
import { register, getOperation, getAllOperations } from '../../src/operations/index';

describe('parseKV', () => {
  it('parses key_value pairs', () => {
    expect(parseKV('w_200,h_100,m_lfit')).toEqual({ w: '200', h: '100', m: 'lfit' });
  });

  it('returns empty object for empty string', () => {
    expect(parseKV('')).toEqual({});
  });

  it('handles values containing underscores (Base64)', () => {
    expect(parseKV('text_SGVs_bG8')).toEqual({ text: 'SGVs_bG8' });
  });
});

describe('serializeKV', () => {
  it('serializes options to key_value string', () => {
    expect(serializeKV({ w: 200, h: 100 })).toBe('w_200,h_100');
  });

  it('skips undefined and null values', () => {
    expect(serializeKV({ w: 200, h: undefined, m: null })).toBe('w_200');
  });
});

describe('clamp', () => {
  it('clamps value within range', () => {
    expect(clamp(50, 1, 100)).toBe(50);
    expect(clamp(0, 1, 100)).toBe(1);
    expect(clamp(150, 1, 100)).toBe(100);
  });
});

describe('operation registry', () => {
  it('registers and retrieves operations', () => {
    const mockOp = {
      name: 'test-op',
      parse: (p: string) => ({ value: p }),
      serialize: (o: Record<string, unknown>) => String(o.value),
      validate: () => {},
      apply: (s: any) => s,
    };
    register(mockOp);
    expect(getOperation('test-op')).toBe(mockOp);
  });

  it('returns undefined for unknown operation', () => {
    expect(getOperation('nonexistent')).toBeUndefined();
  });
});
