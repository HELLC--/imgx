import { describe, it, expect } from 'vitest';
import { circle } from '../../src/operations/circle';
import { ValidationError } from '../../src/types';
import sharp from 'sharp';
import { loadFixturePng, getMetadata, PNG_WIDTH } from '../helpers';

describe('circle', () => {
  describe('parse', () => {
    it('parses radius', () => {
      expect(circle.parse('r_100')).toEqual({ r: 100 });
    });
  });

  describe('validate', () => {
    it('accepts valid radius', () => {
      expect(() => circle.validate({ r: 1 })).not.toThrow();
      expect(() => circle.validate({ r: 4096 })).not.toThrow();
    });
    it('rejects missing radius', () => {
      expect(() => circle.validate({})).toThrow(ValidationError);
    });
    it('rejects out-of-range radius', () => {
      expect(() => circle.validate({ r: 0 })).toThrow(ValidationError);
      expect(() => circle.validate({ r: 4097 })).toThrow(ValidationError);
    });
  });

  describe('serialize', () => {
    it('serializes radius', () => {
      expect(circle.serialize({ r: 100 })).toBe('r_100');
    });
  });

  describe('apply', () => {
    it('produces square output with diameter = 2*r+1 (snapshot)', async () => {
      const buf = await loadFixturePng();
      const result = await circle.apply(sharp(buf), { r: 50 });
      const output = await (result as sharp.Sharp).png().toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(101);
      expect(meta.height).toBe(101);
      await expect(output).toMatchFileSnapshot('./__snapshots__/circle/r50.png');
    });

    it('clamps radius to (minEdge-1)/2 when too large', async () => {
      const buf = await loadFixturePng();
      const result = await circle.apply(sharp(buf), { r: 4096 });
      const output = await (result as sharp.Sharp).png().toBuffer();
      const meta = await getMetadata(output);
      const expectedR = Math.floor((PNG_WIDTH - 1) / 2);
      expect(meta.width).toBe(expectedR * 2 + 1);
      await expect(output).toMatchFileSnapshot('./__snapshots__/circle/clamped.png');
    });
  });
});
