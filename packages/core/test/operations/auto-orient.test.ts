import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { autoOrient } from '../../src/operations/auto-orient';
import { loadFixtureJpeg } from '../helpers';

describe('auto-orient operation', () => {
  describe('parse', () => {
    it('parses "1" to { value: 1 }', () => {
      expect(autoOrient.parse('1')).toEqual({ value: 1 });
    });
    it('parses "0" to { value: 0 }', () => {
      expect(autoOrient.parse('0')).toEqual({ value: 0 });
    });
  });

  describe('validate', () => {
    it('accepts value 0', () => {
      expect(() => autoOrient.validate({ value: 0 })).not.toThrow();
    });
    it('accepts value 1', () => {
      expect(() => autoOrient.validate({ value: 1 })).not.toThrow();
    });
    it('rejects value 2', () => {
      expect(() => autoOrient.validate({ value: 2 })).toThrow();
    });
    it('rejects negative value', () => {
      expect(() => autoOrient.validate({ value: -1 })).toThrow();
    });
  });

  describe('serialize', () => {
    it('serializes { value: 1 } to "1"', () => {
      expect(autoOrient.serialize({ value: 1 })).toBe('1');
    });
    it('serializes { value: 0 } to "0"', () => {
      expect(autoOrient.serialize({ value: 0 })).toBe('0');
    });
  });

  describe('apply', () => {
    it('returns the same sharp instance when value is 0', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = autoOrient.apply(instance, { value: 0 });
      expect(result).toBe(instance);
    });

    it('produces output when value is 1 (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = autoOrient.apply(instance, { value: 1 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      expect(output.length).toBeGreaterThan(0);
      await expect(output).toMatchFileSnapshot('./__snapshots__/auto-orient/oriented.jpg');
    });
  });
});
