import { describe, it, expect } from 'vitest';
import { roundedCorners } from '../../src/operations/rounded-corners';
import { ValidationError } from '../../src/types';
import sharp from 'sharp';
import { loadFixturePng, getMetadata, PNG_WIDTH, PNG_HEIGHT } from '../helpers';

describe('rounded-corners', () => {
  describe('parse', () => {
    it('parses radius', () => {
      expect(roundedCorners.parse('r_30')).toEqual({ r: 30 });
    });
  });

  describe('validate', () => {
    it('accepts valid radius', () => {
      expect(() => roundedCorners.validate({ r: 1 })).not.toThrow();
      expect(() => roundedCorners.validate({ r: 4096 })).not.toThrow();
    });
    it('rejects missing radius', () => {
      expect(() => roundedCorners.validate({})).toThrow(ValidationError);
    });
    it('rejects out-of-range', () => {
      expect(() => roundedCorners.validate({ r: 0 })).toThrow(ValidationError);
    });
  });

  describe('serialize', () => {
    it('serializes radius', () => {
      expect(roundedCorners.serialize({ r: 30 })).toBe('r_30');
    });
  });

  describe('apply', () => {
    it('preserves dimensions (snapshot)', async () => {
      const buf = await loadFixturePng();
      const result = await roundedCorners.apply(sharp(buf), { r: 30 });
      const output = await (result as sharp.Sharp).png().toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(PNG_WIDTH);
      expect(meta.height).toBe(PNG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/rounded-corners/r30.png');
    });

    it('adds alpha channel', async () => {
      const buf = await loadFixturePng();
      const result = await roundedCorners.apply(sharp(buf), { r: 10 });
      const output = await (result as sharp.Sharp).png().toBuffer();
      const meta = await getMetadata(output);
      expect(meta.channels).toBe(4);
    });
  });
});
