import { describe, it, expect } from 'vitest';
import { resize } from '../../src/operations/resize';
import { ValidationError } from '../../src/types';
import sharp from 'sharp';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from '../helpers';

// Fixture is JPG_WIDTH x JPG_HEIGHT (400 x 267) — landscape
describe('resize', () => {
  describe('parse', () => {
    it('parses percentage', () => {
      expect(resize.parse('p_50')).toEqual({ p: 50 });
    });
    it('parses width and height', () => {
      expect(resize.parse('w_200,h_100')).toEqual({ w: 200, h: 100 });
    });
    it('parses mode', () => {
      expect(resize.parse('w_200,h_100,m_fill')).toEqual({ w: 200, h: 100, m: 'fill' });
    });
    it('parses long/short edge', () => {
      expect(resize.parse('l_200')).toEqual({ l: 200 });
      expect(resize.parse('s_100')).toEqual({ s: 100 });
    });
    it('parses limit and color', () => {
      expect(resize.parse('w_200,limit_0,color_FF0000')).toEqual({ w: 200, limit: 0, color: 'FF0000' });
    });
  });

  describe('validate', () => {
    it('accepts valid percentage', () => {
      expect(() => resize.validate({ p: 50 })).not.toThrow();
    });
    it('rejects p out of range', () => {
      expect(() => resize.validate({ p: 0 })).toThrow(ValidationError);
      expect(() => resize.validate({ p: 1001 })).toThrow(ValidationError);
    });
    it('accepts valid w/h', () => {
      expect(() => resize.validate({ w: 200, h: 100 })).not.toThrow();
    });
    it('rejects w out of range', () => {
      expect(() => resize.validate({ w: 0 })).toThrow(ValidationError);
      expect(() => resize.validate({ w: 16385 })).toThrow(ValidationError);
    });
    it('accepts valid modes', () => {
      for (const m of ['lfit', 'mfit', 'fill', 'pad', 'fixed']) {
        expect(() => resize.validate({ w: 100, m })).not.toThrow();
      }
    });
    it('rejects invalid mode', () => {
      expect(() => resize.validate({ w: 100, m: 'invalid' })).toThrow(ValidationError);
    });
  });

  describe('serialize', () => {
    it('serializes percentage', () => {
      expect(resize.serialize({ p: 50 })).toBe('p_50');
    });
    it('serializes w/h/m', () => {
      expect(resize.serialize({ w: 200, h: 100, m: 'fill' })).toBe('w_200,h_100,m_fill');
    });
  });

  describe('apply', () => {
    it('resizes by percentage', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { p: 50 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH / 2);
      expect(meta.height).toBe(134);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/p_50.jpg');
    });

    it('resizes with lfit (default) - fits inside', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { w: 150, h: 80 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      // landscape: scale = min(150/400, 80/267) = 80/267 ≈ 0.2996 → 120 x 80
      expect(meta.width).toBe(120);
      expect(meta.height).toBe(80);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/lfit-w150-h80.jpg');
    });

    it('resizes with fill - cover and crop', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { w: 150, h: 80, m: 'fill' });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(150);
      expect(meta.height).toBe(80);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/fill-w150-h80.jpg');
    });

    it('resizes with fixed - stretches', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { w: 100, h: 100, m: 'fixed' });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(100);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/fixed-100x100.jpg');
    });

    it('respects limit=1 (no enlargement)', async () => {
      const buf = await loadFixtureJpeg();
      // w=600 > current 400, with limit=1 it should NOT enlarge
      const result = await resize.apply(sharp(buf), { w: 600, limit: 1 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/limit1-noenlarge.jpg');
    });

    it('m=fixed forces stretch even with limit=1', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { w: 600, h: 600, m: 'fixed', limit: 1 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(600);
      expect(meta.height).toBe(600);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/fixed-limit1.jpg');
    });

    it('allows enlargement with limit=0', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { w: 600, limit: 0 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(600);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/limit0-enlarge.jpg');
    });

    it('resizes by long edge', async () => {
      const buf = await loadFixtureJpeg();
      // long edge = 400, scale = 100/400 = 0.25, w = 100, h = 67
      const result = await resize.apply(sharp(buf), { l: 100 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(67);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/l_100.jpg');
    });

    it('resizes by short edge', async () => {
      const buf = await loadFixtureJpeg();
      // short edge = 267, scale = 50/267 ≈ 0.1873, w ≈ 76, h = 50
      const result = await resize.apply(sharp(buf), { s: 50, limit: 0 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(76);
      expect(meta.height).toBe(50);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/s_50.jpg');
    });

    it('resizes with both l and s on landscape image (default lfit)', async () => {
      const buf = await loadFixtureJpeg();
      // l_100, s_50 → constrained inside 100x50 (landscape) → ~76x50
      const result = await resize.apply(sharp(buf), { l: 100, s: 50 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(76);
      expect(meta.height).toBe(50);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/l100-s50.jpg');
    });

    it('resizes with l and s using fill mode', async () => {
      const buf = await loadFixtureJpeg();
      const result = await resize.apply(sharp(buf), { l: 100, s: 80, m: 'fill' });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(100);
      expect(meta.height).toBe(80);
      await expect(output).toMatchFileSnapshot('./__snapshots__/resize/l100-s80-fill.jpg');
    });
  });
});
