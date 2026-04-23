import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../src/types';
import { resize } from '../../src/operations/resize';
import { crop } from '../../src/operations/crop';
import { watermark } from '../../src/operations/watermark';
import { loadFixtureJpeg, getMetadata } from '../helpers';
import sharp from 'sharp';

function expectVE(fn: () => void, op: string, param: string) {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ValidationError);
    expect((e as ValidationError).operation).toBe(op);
    expect((e as ValidationError).param).toBe(param);
    return;
  }
  throw new Error('expected ValidationError');
}

describe('operation error boundaries — ValidationError shape', () => {
  it('resize.p out of range carries operation/param', () => {
    expectVE(() => resize.validate({ p: 0 }), 'resize', 'p');
    expectVE(() => resize.validate({ p: 1001 }), 'resize', 'p');
  });

  it('resize.w/h/l/s out of range each set their own param', () => {
    expectVE(() => resize.validate({ w: 0 }), 'resize', 'w');
    expectVE(() => resize.validate({ h: 99999 }), 'resize', 'h');
    expectVE(() => resize.validate({ l: 0 }), 'resize', 'l');
    expectVE(() => resize.validate({ s: 99999 }), 'resize', 's');
  });

  it('resize.m unknown mode is rejected', () => {
    expectVE(() => resize.validate({ m: 'bogus' }), 'resize', 'm');
  });

  it('crop.g invalid gravity is rejected', () => {
    expectVE(() => crop.validate({ g: 'middle' }), 'crop', 'g');
  });

  it('watermark requires text or image', () => {
    expectVE(() => watermark.validate({}), 'watermark', 'text/image');
  });

  it('watermark image source is not yet supported', () => {
    expectVE(
      () => watermark.validate({ image: 'http://x/y.png' }),
      'watermark',
      'image',
    );
  });

  it('watermark.t out of 0..100 is rejected', () => {
    expectVE(
      () => watermark.validate({ text: 'aGVsbG8=', t: 150 }),
      'watermark',
      't',
    );
    expectVE(
      () => watermark.validate({ text: 'aGVsbG8=', t: -1 }),
      'watermark',
      't',
    );
  });

  it.each(['voffset', 'fill', 'padx', 'pady', 'order', 'align', 'interval', 'P'])(
    'watermark unsupported option %s is rejected',
    (key) => {
      expectVE(
        () => watermark.validate({ text: 'aGVsbG8=', [key]: 1 }),
        'watermark',
        key,
      );
    },
  );
});

describe('operation apply edge cases', () => {
  it('watermark.apply with no text and no image is a no-op', async () => {
    const buf = await loadFixtureJpeg();
    const before = await getMetadata(buf);
    const out = await watermark.apply(sharp(buf), {}).then((s) => s.toBuffer());
    const after = await getMetadata(out);
    expect(after.width).toBe(before.width);
    expect(after.height).toBe(before.height);
  });

  it('resize m=pad fills the missing edge from the supplied one', async () => {
    const buf = await loadFixtureJpeg();
    const out = await resize
      .apply(sharp(buf), { w: 100, m: 'pad' })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(100);
  });

  it('resize m=fill mirrors the missing edge as well', async () => {
    const buf = await loadFixtureJpeg();
    const out = await resize
      .apply(sharp(buf), { h: 80, m: 'fill' })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    expect(meta.width).toBe(80);
    expect(meta.height).toBe(80);
  });

  it('resize p=50 scales by percentage', async () => {
    const buf = await loadFixtureJpeg();
    const before = await getMetadata(buf);
    const out = await resize
      .apply(sharp(buf), { p: 50 })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    expect(meta.width).toBe(Math.round(before.width! * 0.5));
  });

  it('resize l alone resizes long edge', async () => {
    const buf = await loadFixtureJpeg();
    const out = await resize
      .apply(sharp(buf), { l: 100 })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    // long edge is height in our fixture (400x537)
    expect(Math.max(meta.width!, meta.height!)).toBe(100);
  });

  it('resize s alone resizes short edge', async () => {
    const buf = await loadFixtureJpeg();
    const out = await resize
      .apply(sharp(buf), { s: 100, limit: 0 })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    expect(Math.min(meta.width!, meta.height!)).toBe(100);
  });

  it('resize l+s together honor mode and orientation', async () => {
    const buf = await loadFixtureJpeg();
    const out = await resize
      .apply(sharp(buf), { l: 200, s: 100, m: 'fill', limit: 0 })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    expect(Math.max(meta.width!, meta.height!)).toBe(200);
    expect(Math.min(meta.width!, meta.height!)).toBe(100);
  });

  it('crop with unspecified width/height crops to the source size', async () => {
    const buf = await loadFixtureJpeg();
    const before = await getMetadata(buf);
    const out = await crop
      .apply(sharp(buf), { g: 'center' })
      .then((s) => s.toBuffer());
    const after = await getMetadata(out);
    expect(after.width).toBe(before.width);
    expect(after.height).toBe(before.height);
  });

  it('crop with right/bottom gravity offsets pull inward', async () => {
    const buf = await loadFixtureJpeg();
    const out = await crop
      .apply(sharp(buf), { g: 'se', w: 50, h: 50, x: 10, y: 10 })
      .then((s) => s.toBuffer());
    const meta = await getMetadata(out);
    expect(meta.width).toBe(50);
    expect(meta.height).toBe(50);
  });

  it.each(['nw', 'north', 'ne', 'west', 'center', 'east', 'sw', 'south', 'se'])(
    'crop.apply works for every gravity (%s)',
    async (g) => {
      const buf = await loadFixtureJpeg();
      const out = await crop
        .apply(sharp(buf), { g, w: 50, h: 50 })
        .then((s) => s.toBuffer());
      const meta = await getMetadata(out);
      expect(meta.width).toBe(50);
      expect(meta.height).toBe(50);
    },
  );

  it.each(['nw', 'north', 'ne', 'west', 'center', 'east', 'sw', 'south', 'se'])(
    'watermark.apply text path works for every gravity (%s)',
    async (g) => {
      const buf = await loadFixtureJpeg();
      const out = await watermark
        .apply(sharp(buf), { text: 'aGk=', g, size: 12, t: 80 })
        .then((s) => s.toBuffer());
      const meta = await getMetadata(out);
      expect(meta.width).toBeGreaterThan(0);
    },
  );
});
