import { describe, it, expect } from 'vitest';
import { buildURL } from '../src/serializer';
import '../src/operations/index';

describe('buildURL boundary handling', () => {
  it('drops descriptors for unknown operations', () => {
    const url = buildURL([
      { name: 'unknown-op', options: { x: 1 } },
      { name: 'rotate', options: { value: 90 } },
    ]);
    expect(url).toBe('image/rotate,90');
  });

  it('emits format with no other params and trailing interlace', () => {
    const url = buildURL([
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
    expect(url).toBe('image/format,jpg/interlace,1');
  });

  it('emits a bare segment when an operation serializes to empty string', () => {
    // crop.serialize via parseKV/serializeKV returns '' for empty options.
    const url = buildURL([{ name: 'crop', options: {} }]);
    expect(url).toBe('image/crop');
  });

  it('emits format alone when no other format options and interlace is false', () => {
    const url = buildURL([{ name: 'format', options: { type: 'png' } }]);
    expect(url).toBe('image/format,png');
  });

  it('returns just "image" for an empty descriptor list', () => {
    expect(buildURL([])).toBe('image');
  });
});
