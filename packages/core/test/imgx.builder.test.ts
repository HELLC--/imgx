import { describe, it, expect } from 'vitest';
import { imgx } from '../src/imgx';
import '../src/operations/index';
import { loadFixtureJpeg, getMetadata } from './helpers';

describe('imgx builder coverage', () => {
  it('exposes every operation as a chainable method', async () => {
    const buf = await loadFixtureJpeg();
    // Two-stage chain: stage 1 exercises geometry / orientation builders,
    // stage 2 exercises decoration / encoding builders. Splitting avoids
    // composing transforms that don't make sense together (e.g. circle
    // before crop on an already-tiny canvas).
    const stage1 = await imgx(buf)
      .autoOrient({ value: 1 })
      .rotate({ value: 90 })
      .flip({ value: 0 })
      .blur({ r: 3, s: 2 })
      .crop({ g: 'center', w: 200, h: 200 })
      .indexcrop({ x: 100, i: 0 })
      .toBuffer();
    expect((await getMetadata(stage1)).width).toBeGreaterThan(0);

    const stage2 = await imgx(stage1)
      .roundedCorners({ r: 10 })
      .circle({ r: 30 })
      .watermark({ text: Buffer.from('hi').toString('base64'), size: 12, t: 80 })
      .quality({ Q: 80 })
      .format({ type: 'png' })
      .toBuffer();
    const meta = await getMetadata(stage2);
    expect(meta.format).toBe('png');
  });

  it('resize alone still works (sanity check)', async () => {
    const buf = await loadFixtureJpeg();
    const result = await imgx(buf).resize({ w: 50 }).toBuffer();
    const meta = await getMetadata(result);
    expect(meta.width).toBe(50);
  });

  it('toStream propagates errors via the "error" event', async () => {
    const buf = await loadFixtureJpeg();
    // resize w=0 fails validation → pipeline rejects → stream destroys with err
    const stream = imgx(buf).resize({ w: 0 }).toStream();
    const err = await new Promise<Error>((resolve, reject) => {
      stream.on('error', resolve);
      stream.on('end', () => reject(new Error('expected stream to error')));
      stream.resume();
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toMatch(/1-16384/);
  });
});
