import { describe, it, expect } from 'vitest';
import { imgx, processImage, parseURL, buildURL } from '../src/index';
import { loadFixtureJpeg, getMetadata } from './helpers';

describe('public API', () => {
  describe('processImage', () => {
    it('processes image with URL params (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await processImage(buf, 'image/resize,w_100/rotate,90');
      const meta = await getMetadata(result);
      // resize lfit w=100 on 400x536 → 100x134; rotate 90 → 134x100
      expect(meta.height).toBe(100);
      await expect(result).toMatchFileSnapshot('./__snapshots__/integration/resize-rotate.jpg');
    });
  });

  describe('parseURL', () => {
    it('parses URL into operation descriptors', () => {
      const ops = parseURL('image/rotate,90/flip,1');
      expect(ops).toHaveLength(2);
      expect(ops[0].name).toBe('rotate');
      expect(ops[1].name).toBe('flip');
    });
  });

  describe('buildURL', () => {
    it('builds URL from operation descriptors', () => {
      const url = buildURL([
        { name: 'rotate', options: { value: 90 } },
        { name: 'flip', options: { value: 1 } },
      ]);
      expect(url).toBe('image/rotate,90/flip,1');
    });
  });

  describe('roundtrip', () => {
    it('parseURL → buildURL preserves operations', () => {
      const original = 'image/rotate,90/flip,1';
      const ops = parseURL(original);
      const rebuilt = buildURL(ops);
      expect(rebuilt).toBe(original);
    });
  });

  describe('imgx chainable', () => {
    it('is exported and functional', async () => {
      const buf = await loadFixtureJpeg();
      const result = await imgx(buf).resize({ w: 50 }).toBuffer();
      const meta = await getMetadata(result);
      expect(meta.width).toBe(50);
    });
  });

  describe('full pipeline', () => {
    it('resize → format (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await processImage(buf, 'image/resize,w_100/format,png');
      const meta = await getMetadata(result);
      expect(meta.width).toBe(100);
      expect(meta.format).toBe('png');
      await expect(result).toMatchFileSnapshot('./__snapshots__/integration/resize-format.png');
    });

    it('crop → rounded-corners → format (snapshot)', async () => {
      const buf = await loadFixtureJpeg();
      const result = await processImage(buf, 'image/crop,w_80,h_80/rounded-corners,r_10/format,png');
      const meta = await getMetadata(result);
      expect(meta.width).toBe(80);
      expect(meta.height).toBe(80);
      expect(meta.channels).toBe(4);
      await expect(result).toMatchFileSnapshot('./__snapshots__/integration/crop-rounded-png.png');
    });
  });
});
