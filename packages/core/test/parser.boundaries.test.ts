import { describe, it, expect, vi } from 'vitest';
import { parseURL } from '../src/parser';
import '../src/operations/index';

describe('parseURL boundary handling', () => {
  it('skips empty path segments', () => {
    const result = parseURL('image//rotate,90');
    expect(result).toEqual([{ name: 'rotate', options: { value: 90 } }]);
  });

  it('handles a segment without a comma (auto-orient with no params → value 0)', () => {
    // Number('') === 0
    const result = parseURL('image/auto-orient');
    expect(result).toEqual([{ name: 'auto-orient', options: { value: 0 } }]);
  });

  it('treats interlace,0 as false (interlace explicitly off)', () => {
    const result = parseURL('image/format,jpg/interlace,0');
    expect(result).toEqual([
      { name: 'format', options: { type: 'jpg', interlace: false } },
    ]);
  });

  it('treats bare interlace,1 as true', () => {
    const result = parseURL('image/format,jpg/interlace,1');
    expect(result).toEqual([
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
  });

  it('treats interlace with empty params as true', () => {
    const result = parseURL('image/format,jpg/interlace,');
    expect(result).toEqual([
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
  });

  it('warns and skips unknown operation given without params', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = parseURL('image/totallyfake');
    expect(result).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('totallyfake'));
    warn.mockRestore();
  });
});
