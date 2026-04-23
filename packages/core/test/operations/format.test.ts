import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { format } from '../../src/operations/format';
import { loadFixtureJpeg, loadFixturePng, getMetadata } from '../helpers';
import { ValidationError } from '../../src/types';

describe('format operation', () => {
  describe('parse', () => {
    it('parses "webp" to { type: "webp" }', () => { expect(format.parse('webp')).toEqual({ type: 'webp' }); });
    it('parses "jpg" to { type: "jpg" }', () => { expect(format.parse('jpg')).toEqual({ type: 'jpg' }); });
    it('parses "png" to { type: "png" }', () => { expect(format.parse('png')).toEqual({ type: 'png' }); });
    it('parses "avif" to { type: "avif" }', () => { expect(format.parse('avif')).toEqual({ type: 'avif' }); });
    it('parses "gif" to { type: "gif" }', () => { expect(format.parse('gif')).toEqual({ type: 'gif' }); });
    it('parses "tiff" to { type: "tiff" }', () => { expect(format.parse('tiff')).toEqual({ type: 'tiff' }); });
    it('parses "bmp" to { type: "bmp" }', () => { expect(format.parse('bmp')).toEqual({ type: 'bmp' }); });
    it('parses "heic" to { type: "heic" }', () => { expect(format.parse('heic')).toEqual({ type: 'heic' }); });
  });

  describe('validate', () => {
    it('accepts valid format "jpg"', () => { expect(() => format.validate({ type: 'jpg' })).not.toThrow(); });
    it('accepts valid format "png"', () => { expect(() => format.validate({ type: 'png' })).not.toThrow(); });
    it('accepts valid format "webp"', () => { expect(() => format.validate({ type: 'webp' })).not.toThrow(); });
    it('accepts valid format "avif"', () => { expect(() => format.validate({ type: 'avif' })).not.toThrow(); });
    it('throws ValidationError for invalid format', () => { expect(() => format.validate({ type: 'bmp2' })).toThrow(ValidationError); });
    it('throws ValidationError for empty format', () => { expect(() => format.validate({ type: '' })).toThrow(ValidationError); });
  });

  describe('serialize', () => {
    it('serializes { type: "webp" } to "webp"', () => { expect(format.serialize({ type: 'webp' })).toBe('webp'); });
    it('serializes { type: "jpg" } to "jpg"', () => { expect(format.serialize({ type: 'jpg' })).toBe('jpg'); });
    it('serializes { type: "png" } to "png"', () => { expect(format.serialize({ type: 'png' })).toBe('png'); });
  });

  describe('apply', () => {
    it('converts JPEG to PNG (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = format.apply(instance, { type: 'png' });
      const output = await (result as sharp.Sharp).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.format).toBe('png');
      await expect(output).toMatchFileSnapshot('./__snapshots__/format/jpeg-to-png.png');
    });

    it('converts PNG to JPEG (jpg maps to jpeg)', async () => {
      const buf = await loadFixturePng();
      const instance = sharp(buf);
      const result = format.apply(instance, { type: 'jpg' });
      const output = await (result as sharp.Sharp).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.format).toBe('jpeg');
      await expect(output).toMatchFileSnapshot('./__snapshots__/format/png-to-jpeg.jpg');
    });

    it('converts JPEG to WebP', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = format.apply(instance, { type: 'webp' });
      const output = await (result as sharp.Sharp).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.format).toBe('webp');
      await expect(output).toMatchFileSnapshot('./__snapshots__/format/jpeg-to-webp.webp');
    });

    it('applies progressive option when interlace is true', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = format.apply(instance, { type: 'jpg', interlace: true });
      const output = await (result as sharp.Sharp).toBuffer();
      const meta = await getMetadata(output);
      expect(meta.format).toBe('jpeg');
      expect(meta.isProgressive).toBe(true);
      await expect(output).toMatchFileSnapshot('./__snapshots__/format/jpeg-progressive.jpg');
    });
  });
});
