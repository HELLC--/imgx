import { describe, it, expect } from 'vitest';
import { buildURL } from '../src/serializer';
import '../src/operations/index';

describe('buildURL', () => {
  it('serializes value-only operations', () => {
    const url = buildURL([
      { name: 'rotate', options: { value: 90 } },
    ]);
    expect(url).toBe('image/rotate,90');
  });

  it('serializes multiple operations', () => {
    const url = buildURL([
      { name: 'rotate', options: { value: 90 } },
      { name: 'flip', options: { value: 1 } },
    ]);
    expect(url).toBe('image/rotate,90/flip,1');
  });

  it('returns image prefix for empty array', () => {
    expect(buildURL([])).toBe('image');
  });

  it('splits interlace from format options', () => {
    const url = buildURL([
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
    expect(url).toBe('image/format,jpg/interlace,1');
  });
});
