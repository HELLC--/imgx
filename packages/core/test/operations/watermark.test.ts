import { describe, it, expect } from 'vitest';
import { watermark } from '../../src/operations/watermark';
import { ValidationError } from '../../src/types';
import sharp from 'sharp';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from '../helpers';

describe('watermark', () => {
  describe('parse', () => {
    it('parses text watermark', () => {
      const result = watermark.parse('text_SGVsbG8,size_30,color_FFFFFF');
      expect(result.text).toBe('SGVsbG8');
      expect(result.size).toBe(30);
      expect(result.color).toBe('FFFFFF');
    });
    it('parses position params', () => {
      const result = watermark.parse('text_SGVsbG8,g_se,x_10,y_10,t_80');
      expect(result.g).toBe('se');
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.t).toBe(80);
    });
  });

  describe('validate', () => {
    it('accepts text watermark', () => {
      expect(() => watermark.validate({ text: 'SGVsbG8' })).not.toThrow();
    });
    it('rejects image watermark (not yet supported)', () => {
      expect(() => watermark.validate({ image: 'cGFuZGEucG5n' })).toThrow(/not yet supported/);
    });
    it('rejects unimplemented spec params (voffset/fill/padx/pady)', () => {
      expect(() => watermark.validate({ text: 'x', voffset: 5 })).toThrow(/not yet supported/);
      expect(() => watermark.validate({ text: 'x', fill: 1 })).toThrow(/not yet supported/);
      expect(() => watermark.validate({ text: 'x', padx: 10 })).toThrow(/not yet supported/);
      expect(() => watermark.validate({ text: 'x', pady: 10 })).toThrow(/not yet supported/);
    });
    it('rejects multi-watermark params (order/align/interval/P)', () => {
      expect(() => watermark.validate({ text: 'x', order: 0 })).toThrow(/not yet supported/);
      expect(() => watermark.validate({ text: 'x', align: 1 })).toThrow(/not yet supported/);
      expect(() => watermark.validate({ text: 'x', interval: 5 })).toThrow(/not yet supported/);
      expect(() => watermark.validate({ text: 'x', P: 50 })).toThrow(/not yet supported/);
    });
    it('rejects no text or image', () => {
      expect(() => watermark.validate({ g: 'se' })).toThrow(ValidationError);
    });
    it('rejects invalid transparency', () => {
      expect(() => watermark.validate({ text: 'x', t: 101 })).toThrow(ValidationError);
    });
  });

  describe('serialize', () => {
    it('serializes text watermark params', () => {
      const result = watermark.serialize({ text: 'SGVsbG8', size: 30, g: 'se' });
      expect(result).toContain('text_SGVsbG8');
      expect(result).toContain('size_30');
      expect(result).toContain('g_se');
    });
  });

  describe('apply', () => {
    it('adds text watermark preserving dimensions (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await watermark.apply(sharp(buf), {
        text: 'SGVsbG8',
        size: 24,
        color: 'FFFFFF',
        g: 'se',
        x: 10,
        y: 10,
        t: 100,
      });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.width).toBe(JPG_WIDTH);
      expect(meta.height).toBe(JPG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/watermark/text-se.jpg');
    });
  });
});
