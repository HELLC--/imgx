import { describe, it, expect } from 'vitest';
import { executePipeline } from '../src/pipeline';
import '../src/operations/index';
import { loadFixtureJpeg, getMetadata, JPG_WIDTH, JPG_HEIGHT } from './helpers';

describe('executePipeline', () => {
  it('executes empty pipeline (returns input)', async () => {
    const buf = await loadFixtureJpeg();
    const result = await executePipeline(buf, []);
    const meta = await getMetadata(result);
    expect(meta.width).toBe(JPG_WIDTH);
    expect(meta.height).toBe(JPG_HEIGHT);
  });

  it('executes single operation (snapshot)', async () => {
    const buf = await loadFixtureJpeg();
    const result = await executePipeline(buf, [
      { name: 'rotate', options: { value: 90 } },
    ]);
    const meta = await getMetadata(result);
    expect(meta.width).toBe(JPG_HEIGHT);
    expect(meta.height).toBe(JPG_WIDTH);
    await expect(result).toMatchFileSnapshot('./__snapshots__/pipeline/single-rotate90.jpg');
  });

  it('executes chained operations (snapshot)', async () => {
    const buf = await loadFixtureJpeg();
    const result = await executePipeline(buf, [
      { name: 'resize', options: { w: 100, h: 50, m: 'fill' } },
      { name: 'rotate', options: { value: 90 } },
    ]);
    const meta = await getMetadata(result);
    expect(meta.width).toBe(50);
    expect(meta.height).toBe(100);
    await expect(result).toMatchFileSnapshot('./__snapshots__/pipeline/chained.jpg');
  });

  it('skips unknown operations', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const buf = await loadFixtureJpeg();
    const result = await executePipeline(buf, [
      { name: 'nonexistent', options: {} },
      { name: 'flip', options: { value: 1 } },
    ]);
    const meta = await getMetadata(result);
    expect(meta.width).toBe(JPG_WIDTH);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('throws on validation error', async () => {
    const buf = await loadFixtureJpeg();
    await expect(
      executePipeline(buf, [
        { name: 'blur', options: { r: 999, s: 999 } },
      ]),
    ).rejects.toThrow();
  });
});
