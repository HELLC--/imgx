import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { flip } from '../../src/operations/flip';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from '../helpers';

describe('flip operation', () => {
  describe('parse', () => {
    it('parses "0" to { value: 0 }', () => {
      expect(flip.parse('0')).toEqual({ value: 0 });
    });
    it('parses "1" to { value: 1 }', () => {
      expect(flip.parse('1')).toEqual({ value: 1 });
    });
    it('parses "2" to { value: 2 }', () => {
      expect(flip.parse('2')).toEqual({ value: 2 });
    });
  });

  describe('validate', () => {
    it('accepts value 0', () => {
      expect(() => flip.validate({ value: 0 })).not.toThrow();
    });
    it('accepts value 1', () => {
      expect(() => flip.validate({ value: 1 })).not.toThrow();
    });
    it('accepts value 2', () => {
      expect(() => flip.validate({ value: 2 })).not.toThrow();
    });
    it('rejects value 3', () => {
      expect(() => flip.validate({ value: 3 })).toThrow();
    });
    it('rejects negative value', () => {
      expect(() => flip.validate({ value: -1 })).toThrow();
    });
    it('rejects missing/NaN value', () => {
      expect(() => flip.validate(flip.parse(''))).toThrow(/required/);
      expect(() => flip.validate({ value: NaN })).toThrow(/required/);
    });
  });

  describe('serialize', () => {
    it('serializes { value: 1 } to "1"', () => {
      expect(flip.serialize({ value: 1 })).toBe('1');
    });
    it('serializes { value: 0 } to "0"', () => {
      expect(flip.serialize({ value: 0 })).toBe('0');
    });
    it('serializes { value: 2 } to "2"', () => {
      expect(flip.serialize({ value: 2 })).toBe('2');
    });
  });

  describe('apply', () => {
    it('mode 0 (vertical flip) preserves dimensions', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = flip.apply(instance, { value: 0 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH);
      expect(meta.height).toBe(JPG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/flip/v.jpg');
    });

    it('mode 1 (horizontal flip) preserves dimensions', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = flip.apply(instance, { value: 1 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH);
      expect(meta.height).toBe(JPG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/flip/h.jpg');
    });

    it('mode 2 (both) preserves dimensions', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = flip.apply(instance, { value: 2 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH);
      expect(meta.height).toBe(JPG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/flip/both.jpg');
    });
  });
});
