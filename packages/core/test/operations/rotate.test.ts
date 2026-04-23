import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { rotate } from '../../src/operations/rotate';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from '../helpers';

describe('rotate operation', () => {
  describe('parse', () => {
    it('parses "90" to { value: 90 }', () => {
      expect(rotate.parse('90')).toEqual({ value: 90 });
    });
    it('parses "0" to { value: 0 }', () => {
      expect(rotate.parse('0')).toEqual({ value: 0 });
    });
    it('parses "270" to { value: 270 }', () => {
      expect(rotate.parse('270')).toEqual({ value: 270 });
    });
  });

  describe('validate', () => {
    it('accepts value 0', () => {
      expect(() => rotate.validate({ value: 0 })).not.toThrow();
    });
    it('accepts value 90', () => {
      expect(() => rotate.validate({ value: 90 })).not.toThrow();
    });
    it('accepts value 360', () => {
      expect(() => rotate.validate({ value: 360 })).not.toThrow();
    });
    it('rejects negative value', () => {
      expect(() => rotate.validate({ value: -1 })).toThrow();
    });
    it('rejects value above 360', () => {
      expect(() => rotate.validate({ value: 361 })).toThrow();
    });
    it('rejects missing/NaN value', () => {
      expect(() => rotate.validate(rotate.parse(''))).toThrow(/required/);
      expect(() => rotate.validate({ value: NaN })).toThrow(/required/);
    });
  });

  describe('serialize', () => {
    it('serializes { value: 90 } to "90"', () => {
      expect(rotate.serialize({ value: 90 })).toBe('90');
    });
    it('serializes { value: 0 } to "0"', () => {
      expect(rotate.serialize({ value: 0 })).toBe('0');
    });
  });

  describe('apply', () => {
    it('90 degrees swaps dimensions', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = rotate.apply(instance, { value: 90 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_HEIGHT);
      expect(meta.height).toBe(JPG_WIDTH);
      await expect(output).toMatchFileSnapshot('./__snapshots__/rotate/90.jpg');
    });

    it('0 degrees leaves image unchanged', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = rotate.apply(instance, { value: 0 });
      expect(result).toBe(instance);
    });
  });
});
