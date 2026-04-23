import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { blur } from '../../src/operations/blur';
import { loadFixtureJpeg, JPG_WIDTH, JPG_HEIGHT } from '../helpers';
import { ValidationError } from '../../src/types';

describe('blur operation', () => {
  describe('parse', () => {
    it('parses "r_10,s_5" to { r: 10, s: 5 }', () => {
      expect(blur.parse('r_10,s_5')).toEqual({ r: 10, s: 5 });
    });
    it('parses "r_1,s_1" to { r: 1, s: 1 }', () => {
      expect(blur.parse('r_1,s_1')).toEqual({ r: 1, s: 1 });
    });
    it('parses "r_50,s_50" to { r: 50, s: 50 }', () => {
      expect(blur.parse('r_50,s_50')).toEqual({ r: 50, s: 50 });
    });
  });

  describe('validate', () => {
    it('accepts valid values', () => {
      expect(() => blur.validate({ r: 10, s: 5 })).not.toThrow();
    });
    it('accepts boundary values r=1, s=1', () => {
      expect(() => blur.validate({ r: 1, s: 1 })).not.toThrow();
    });
    it('accepts boundary values r=50, s=50', () => {
      expect(() => blur.validate({ r: 50, s: 50 })).not.toThrow();
    });
    it('throws ValidationError when r is missing', () => {
      expect(() => blur.validate({ s: 5 })).toThrow(ValidationError);
    });
    it('throws ValidationError when s is missing', () => {
      expect(() => blur.validate({ r: 10 })).toThrow(ValidationError);
    });
    it('throws ValidationError when r is below range', () => {
      expect(() => blur.validate({ r: 0, s: 5 })).toThrow(ValidationError);
    });
    it('throws ValidationError when r is above range', () => {
      expect(() => blur.validate({ r: 51, s: 5 })).toThrow(ValidationError);
    });
    it('throws ValidationError when s is below range', () => {
      expect(() => blur.validate({ r: 10, s: 0 })).toThrow(ValidationError);
    });
    it('throws ValidationError when s is above range', () => {
      expect(() => blur.validate({ r: 10, s: 51 })).toThrow(ValidationError);
    });
  });

  describe('serialize', () => {
    it('serializes { r: 10, s: 5 } to "r_10,s_5"', () => {
      expect(blur.serialize({ r: 10, s: 5 })).toBe('r_10,s_5');
    });
    it('serializes { r: 1, s: 1 } to "r_1,s_1"', () => {
      expect(blur.serialize({ r: 1, s: 1 })).toBe('r_1,s_1');
    });
  });

  describe('apply', () => {
    it('produces blurred output preserving dimensions (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = blur.apply(instance, { r: 10, s: 5 });
      const output = await (result as sharp.Sharp).jpeg({ quality: 80, mozjpeg: false }).toBuffer();
      expect(output).toBeInstanceOf(Buffer);
      const sharpMeta = await sharp(output).metadata();
      expect(sharpMeta.width).toBe(JPG_WIDTH);
      expect(sharpMeta.height).toBe(JPG_HEIGHT);
      await expect(output).toMatchFileSnapshot('./__snapshots__/blur/r10-s5.jpg');
    });
  });
});
