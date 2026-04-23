import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { executePipeline } from '../src/pipeline';
import { ValidationError } from '../src/types';
import '../src/operations/index';
import { loadFixtureJpeg, getMetadata } from './helpers';

async function makeJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 200, b: 200 } },
  })
    .jpeg({ quality: 50 })
    .toBuffer();
}

describe('pipeline source validation', () => {
  it('throws ValidationError when source exceeds 20MB', async () => {
    const huge = Buffer.alloc(20 * 1024 * 1024 + 1, 0xff);
    const err = await executePipeline(huge, []).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.operation).toBe('source');
    expect(err.param).toBe('size');
  });

  it('throws ValidationError for unsupported source format (svg)', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
    );
    const err = await executePipeline(svg, []).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.operation).toBe('source');
    expect(err.param).toBe('format');
  });

  it('throws ValidationError when an edge exceeds 30,000px', async () => {
    const wide = await makeJpeg(30001, 10);
    const err = await executePipeline(wide, []).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.operation).toBe('source');
    expect(err.param).toBe('dimensions');
  }, 20000);

  it('throws ValidationError when total pixels exceed 250M', async () => {
    // 16000x16000 = 256M pixels (>250M), still under sharp's default 0x3FFF^2 limit (~268M).
    const big = await makeJpeg(16000, 16000);
    const err = await executePipeline(big, []).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.operation).toBe('source');
    expect(err.param).toBe('pixels');
  }, 60000);
});

describe('pipeline encode merging', () => {
  it('skips quality re-encode when target format is lossless (png)', async () => {
    const buf = await loadFixtureJpeg();
    const out = await executePipeline(buf, [
      { name: 'format', options: { type: 'png' } },
      { name: 'quality', options: { Q: 50 } },
    ]);
    const meta = await getMetadata(out);
    expect(meta.format).toBe('png');
  });

  it('emits progressive JPEG when format+interlace is set', async () => {
    const buf = await loadFixtureJpeg();
    const out = await executePipeline(buf, [
      { name: 'format', options: { type: 'jpg', interlace: true } },
    ]);
    const meta = await getMetadata(out);
    expect(meta.format).toBe('jpeg');
    expect(meta.isProgressive).toBe(true);
  });

  it('does not re-encode when no format change and no encoder option', async () => {
    const buf = await loadFixtureJpeg();
    const out = await executePipeline(buf, []);
    expect(out.equals(buf)).toBe(true);
  });

  it('uses Q over q when both provided', async () => {
    const buf = await loadFixtureJpeg();
    const high = await executePipeline(buf, [
      { name: 'format', options: { type: 'jpg' } },
      { name: 'quality', options: { q: 10, Q: 95 } },
    ]);
    const low = await executePipeline(buf, [
      { name: 'format', options: { type: 'jpg' } },
      { name: 'quality', options: { Q: 10 } },
    ]);
    expect(high.length).toBeGreaterThan(low.length);
  });
});
