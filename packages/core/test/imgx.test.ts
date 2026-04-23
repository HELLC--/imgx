import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imgx } from '../src/imgx';
import '../src/operations/index';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from './helpers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_INPUT = join(__dirname, 'fixtures', 'tmp-imgx-input.jpg');
const TMP_OUTPUT = join(__dirname, 'fixtures', 'tmp-imgx-output.png');

describe('imgx chainable API', () => {
  let testBuffer: Buffer;

  beforeAll(async () => {
    testBuffer = await loadFixtureJpeg();
    writeFileSync(TMP_INPUT, testBuffer);
  });

  afterAll(() => {
    try { unlinkSync(TMP_INPUT); } catch {}
    try { unlinkSync(TMP_OUTPUT); } catch {}
  });

  it('chains resize and outputs buffer (snapshot)', async () => {
    const result = await imgx(testBuffer)
      .resize({ w: 100, h: 50, m: 'fill' })
      .toBuffer();
    const meta = await getMetadata(result);
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(50);
    await expect(result).toMatchFileSnapshot('./__snapshots__/imgx/resize.jpg');
  });

  it('chains multiple operations (snapshot)', async () => {
    const result = await imgx(testBuffer)
      .resize({ w: 100 })
      .rotate({ value: 90 })
      .toBuffer();
    const meta = await getMetadata(result);
    // resize lfit w=100 on 400x536 → 100 wide, height=134; rotate 90 → 134x100
    expect(meta.height).toBe(100);
    await expect(result).toMatchFileSnapshot('./__snapshots__/imgx/resize-rotate.jpg');
  });

  it('supports format and quality (snapshot)', async () => {
    const result = await imgx(testBuffer)
      .format({ type: 'png' })
      .toBuffer();
    const meta = await getMetadata(result);
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(JPG_WIDTH);
    expect(meta.height).toBe(JPG_HEIGHT);
    await expect(result).toMatchFileSnapshot('./__snapshots__/imgx/format-png.png');
  });

  it('supports file path input', async () => {
    const result = await imgx(TMP_INPUT)
      .resize({ w: 50 })
      .toBuffer();
    const meta = await getMetadata(result);
    expect(meta.width).toBe(50);
  });

  it('supports toFile output', async () => {
    await imgx(testBuffer)
      .resize({ w: 50 })
      .format({ type: 'png' })
      .toFile(TMP_OUTPUT);
    expect(existsSync(TMP_OUTPUT)).toBe(true);
    const meta = await getMetadata(readFileSync(TMP_OUTPUT));
    expect(meta.format).toBe('png');
  });

  it('supports toStream output', async () => {
    const stream = imgx(testBuffer)
      .resize({ w: 50 })
      .toStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const result = Buffer.concat(chunks);
    expect(result.length).toBeGreaterThan(0);
  });
});
