import { describe, it, expect } from 'vitest';
import { indexcrop } from '../../src/operations/indexcrop';
import { ValidationError } from '../../src/types';
import sharp from 'sharp';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from '../helpers';

describe('indexcrop', () => {
  describe('parse', () => {
    it('parses x-axis slice', () => {
      expect(indexcrop.parse('x_100,i_0')).toEqual({ x: 100, i: 0 });
    });
    it('parses y-axis slice', () => {
      expect(indexcrop.parse('y_200,i_2')).toEqual({ y: 200, i: 2 });
    });
    it('defaults i to 0', () => {
      expect(indexcrop.parse('x_100')).toEqual({ x: 100 });
    });
  });

  describe('validate', () => {
    it('accepts valid x with i', () => {
      expect(() => indexcrop.validate({ x: 100, i: 0 })).not.toThrow();
    });
    it('accepts valid y with i', () => {
      expect(() => indexcrop.validate({ y: 50, i: 1 })).not.toThrow();
    });
    it('rejects neither x nor y', () => {
      expect(() => indexcrop.validate({ i: 0 })).toThrow(ValidationError);
    });
  });

  describe('serialize', () => {
    it('serializes x-axis params', () => {
      expect(indexcrop.serialize({ x: 100, i: 0 })).toBe('x_100,i_0');
    });
    it('serializes y-axis params', () => {
      expect(indexcrop.serialize({ y: 200, i: 2 })).toBe('y_200,i_2');
    });
  });

  describe('apply', () => {
    it('slices along x-axis (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await indexcrop.apply(sharp(buf), { x: 100, i: 0 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(JPG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/indexcrop/x100-i0.jpg');
    });

    it('slices along y-axis (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await indexcrop.apply(sharp(buf), { y: 100, i: 1 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH);
      expect(meta.height).toBe(100);
      await expect(output).toMatchFileSnapshot('./__snapshots__/indexcrop/y100-i1.jpg');
    });

    it('returns original when index exceeds slice count', async () => {
      const buf = await loadFixtureJpeg();
      const result = await indexcrop.apply(sharp(buf), { x: 100, i: 99 });
      const meta = await getMetadata(await (result as sharp.Sharp).toBuffer());
      expect(meta.width).toBe(JPG_WIDTH);
      expect(meta.height).toBe(JPG_HEIGHT);
    });
  });
});
