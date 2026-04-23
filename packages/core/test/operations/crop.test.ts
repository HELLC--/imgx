import { describe, it, expect } from 'vitest';
import { crop } from '../../src/operations/crop';
import { ValidationError } from '../../src/types';
import sharp from 'sharp';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from '../helpers';

describe('crop', () => {
  describe('parse', () => {
    it('parses position and size', () => {
      expect(crop.parse('x_100,y_50,w_200,h_100')).toEqual({ x: 100, y: 50, w: 200, h: 100 });
    });
    it('parses with gravity', () => {
      expect(crop.parse('g_se,w_100,h_100')).toEqual({ g: 'se', w: 100, h: 100 });
    });
  });

  describe('validate', () => {
    it('accepts valid params', () => {
      expect(() => crop.validate({ x: 0, y: 0, w: 100, h: 100 })).not.toThrow();
    });
    it('accepts gravity without offsets', () => {
      expect(() => crop.validate({ g: 'center', w: 100, h: 100 })).not.toThrow();
    });
  });

  describe('serialize', () => {
    it('serializes crop params', () => {
      expect(crop.serialize({ x: 100, y: 50, w: 200, h: 100 })).toBe('x_100,y_50,w_200,h_100');
    });
  });

  describe('apply', () => {
    it('crops from top-left (default gravity)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await crop.apply(sharp(buf), { x: 10, y: 10, w: 50, h: 50 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(50);
      expect(meta.height).toBe(50);
      await expect(output).toMatchFileSnapshot('./__snapshots__/crop/topleft.jpg');
    });

    it('crops from center', async () => {
      const buf = await loadFixtureJpeg();
      const result = await crop.apply(sharp(buf), { g: 'center', w: 100, h: 100 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(100);
      await expect(output).toMatchFileSnapshot('./__snapshots__/crop/center.jpg');
    });

    it('crops from bottom-right (se)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await crop.apply(sharp(buf), { g: 'se', w: 100, h: 100 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(100);
      await expect(output).toMatchFileSnapshot('./__snapshots__/crop/se.jpg');
    });

    it('clamps to image bounds', async () => {
      const buf = await loadFixtureJpeg();
      // x=380, w=200: should clamp to JPG_WIDTH-380=20 wide
      // y=200, h=200: should clamp to JPG_HEIGHT-200 tall
      const result = await crop.apply(sharp(buf), { x: 380, y: 200, w: 200, h: 200 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH - 380);
      expect(meta.height).toBe(JPG_HEIGHT - 200);
      await expect(output).toMatchFileSnapshot('./__snapshots__/crop/clamped.jpg');
    });

    it('g=se with x,y pulls inward from bottom-right edge', async () => {
      const buf = await loadFixtureJpeg();
      const result = await crop.apply(sharp(buf), { g: 'se', w: 100, h: 100, x: 20, y: 20 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(100);
      await expect(output).toMatchFileSnapshot('./__snapshots__/crop/se-inward.jpg');
    });

    it('g=nw with x,y pushes inward from top-left edge', async () => {
      const buf = await loadFixtureJpeg();
      const result = await crop.apply(sharp(buf), { g: 'nw', w: 100, h: 100, x: 20, y: 20 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(100);
      await expect(output).toMatchFileSnapshot('./__snapshots__/crop/nw-inward.jpg');
    });
  });
});
