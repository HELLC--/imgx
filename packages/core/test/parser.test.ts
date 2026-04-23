import { describe, it, expect, vi } from 'vitest';
import { parseURL } from '../src/parser';
import '../src/operations/index';

describe('parseURL', () => {
  it('parses multiple operations', () => {
    const result = parseURL('image/rotate,90/flip,1');
    expect(result).toEqual([
      { name: 'rotate', options: { value: 90 } },
      { name: 'flip', options: { value: 1 } },
    ]);
  });

  it('parses value-only operations', () => {
    const result = parseURL('image/auto-orient,1');
    expect(result).toEqual([
      { name: 'auto-orient', options: { value: 1 } },
    ]);
  });

  it('skips unknown operations and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parseURL('image/unknown,x_1/rotate,90');
    expect(result).toEqual([
      { name: 'rotate', options: { value: 90 } },
    ]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown'));
    warn.mockRestore();
  });

  it('handles empty string', () => {
    expect(parseURL('')).toEqual([]);
  });

  it('handles string without image/ prefix', () => {
    const result = parseURL('rotate,90');
    expect(result).toEqual([
      { name: 'rotate', options: { value: 90 } },
    ]);
  });

  it('merges interlace into format operation (after format)', () => {
    const result = parseURL('image/format,jpg/interlace,1');
    expect(result).toEqual([
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
  });

  it('merges interlace into format operation (before format)', () => {
    const result = parseURL('image/interlace,1/format,jpg');
    expect(result).toEqual([
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
  });

  it('drops interlace without format silently', () => {
    const result = parseURL('image/interlace,1/rotate,90');
    expect(result).toEqual([
      { name: 'rotate', options: { value: 90 } },
    ]);
  });
});
