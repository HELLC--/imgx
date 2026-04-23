import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { quality } from '../../src/operations/quality';
import { executePipeline } from '../../src/pipeline';
import '../../src/operations/index';
import { loadFixtureJpeg, loadFixturePng, getMetadata } from '../helpers';
import { ValidationError } from '../../src/types';

describe('quality operation', () => {
  describe('parse', () => {
    it('parses "q_80" to { q: 80 }', () => {
      expect(quality.parse('q_80')).toEqual({ q: 80 });
    });
    it('parses "Q_90" to { Q: 90 }', () => {
      expect(quality.parse('Q_90')).toEqual({ Q: 90 });
    });
    it('parses "q_50,Q_75" to { q: 50, Q: 75 }', () => {
      expect(quality.parse('q_50,Q_75')).toEqual({ q: 50, Q: 75 });
    });
  });

  describe('validate', () => {
    it('accepts q=80', () => { expect(() => quality.validate({ q: 80 })).not.toThrow(); });
    it('accepts Q=90', () => { expect(() => quality.validate({ Q: 90 })).not.toThrow(); });
    it('accepts q=1 (lower bound)', () => { expect(() => quality.validate({ q: 1 })).not.toThrow(); });
    it('accepts q=100 (upper bound)', () => { expect(() => quality.validate({ q: 100 })).not.toThrow(); });
    it('throws ValidationError when q is below range', () => { expect(() => quality.validate({ q: 0 })).toThrow(ValidationError); });
    it('throws ValidationError when q is above range', () => { expect(() => quality.validate({ q: 101 })).toThrow(ValidationError); });
    it('throws ValidationError when Q is below range', () => { expect(() => quality.validate({ Q: 0 })).toThrow(ValidationError); });
    it('throws ValidationError when Q is above range', () => { expect(() => quality.validate({ Q: 101 })).toThrow(ValidationError); });
    it('accepts empty options (neither q nor Q)', () => { expect(() => quality.validate({})).not.toThrow(); });
  });

  describe('serialize', () => {
    it('serializes { q: 80 } to "q_80"', () => { expect(quality.serialize({ q: 80 })).toBe('q_80'); });
    it('serializes { Q: 90 } to "Q_90"', () => { expect(quality.serialize({ Q: 90 })).toBe('Q_90'); });
  });

  describe('apply', () => {
    it('returns sharp instance unchanged (deferred to pipeline)', async () => {
      const buf = await loadFixtureJpeg();
      const instance = sharp(buf);
      const result = quality.apply(instance, { q: 80 });
      expect(result).toBe(instance);
    });
  });

  describe('pipeline integration', () => {
    it('applies quality to JPEG output (low q smaller than high q)', async () => {
      const buf = await loadFixtureJpeg();
      const highQ = await executePipeline(buf, [{ name: 'quality', options: { q: 95 } }]);
      const lowQ = await executePipeline(buf, [{ name: 'quality', options: { q: 10 } }]);
      expect(lowQ.length).toBeLessThan(highQ.length);
      await expect(lowQ).toMatchFileSnapshot('./__snapshots__/quality/jpeg-q10.jpg');
      await expect(highQ).toMatchFileSnapshot('./__snapshots__/quality/jpeg-q95.jpg');
    });

    it('does not change format when quality is applied to JPEG', async () => {
      const buf = await loadFixtureJpeg();
      const result = await executePipeline(buf, [{ name: 'quality', options: { q: 80 } }]);
      const meta = await getMetadata(result);
      expect(meta.format).toBe('jpeg');
    });

    it('applies quality to WebP when format is set', async () => {
      const buf = await loadFixtureJpeg();
      const result = await executePipeline(buf, [
        { name: 'format', options: { type: 'webp' } },
        { name: 'quality', options: { q: 50 } },
      ]);
      const meta = await getMetadata(result);
      expect(meta.format).toBe('webp');
      await expect(result).toMatchFileSnapshot('./__snapshots__/quality/webp-q50.webp');
    });

    it('skips quality for PNG output (lossless)', async () => {
      const buf = await loadFixturePng();
      const withQ = await executePipeline(buf, [{ name: 'quality', options: { q: 10 } }]);
      const withoutQ = await executePipeline(buf, []);
      expect(withQ.length).toBe(withoutQ.length);
    });

    it('Q applies absolute quality', async () => {
      const buf = await loadFixtureJpeg();
      const result = await executePipeline(buf, [{ name: 'quality', options: { Q: 50 } }]);
      expect(result.length).toBeGreaterThan(0);
      await expect(result).toMatchFileSnapshot('./__snapshots__/quality/jpeg-Q50.jpg');
    });

    it('quality + format use a single encode (low q is smaller than high q)', async () => {
      const buf = await loadFixturePng();
      const lowQ = await executePipeline(buf, [
        { name: 'format', options: { type: 'jpg' } },
        { name: 'quality', options: { q: 10 } },
      ]);
      const highQ = await executePipeline(buf, [
        { name: 'format', options: { type: 'jpg' } },
        { name: 'quality', options: { q: 95 } },
      ]);
      const lowMeta = await getMetadata(lowQ);
      const highMeta = await getMetadata(highQ);
      expect(lowMeta.format).toBe('jpeg');
      expect(highMeta.format).toBe('jpeg');
      expect(lowQ.length).toBeLessThan(highQ.length);
      await expect(lowQ).toMatchFileSnapshot('./__snapshots__/quality/png-to-jpg-q10.jpg');
      await expect(highQ).toMatchFileSnapshot('./__snapshots__/quality/png-to-jpg-q95.jpg');
    });
  });
});
