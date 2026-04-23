import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

export const indexcrop: Operation = {
  name: 'indexcrop',

  parse(params: string) {
    const kv = parseKV(params);
    const result: Record<string, unknown> = {};
    if (kv.x) result.x = parseInt(kv.x, 10);
    if (kv.y) result.y = parseInt(kv.y, 10);
    if (kv.i) result.i = parseInt(kv.i, 10);
    return result;
  },

  serialize(options) {
    const parts: Record<string, unknown> = {};
    if (options.x !== undefined) parts.x = options.x;
    if (options.y !== undefined) parts.y = options.y;
    if (options.i !== undefined) parts.i = options.i;
    return serializeKV(parts);
  },

  validate(options) {
    if (options.x === undefined && options.y === undefined) {
      throw new ValidationError('indexcrop', 'x/y', 'either x or y is required');
    }
  },

  async apply(sharp: Sharp, options) {
    const meta = await sharp.metadata();
    const w = meta.width!;
    const h = meta.height!;
    const i = (options.i as number) ?? 0;

    if (options.y !== undefined) {
      const sliceH = options.y as number;
      const numSlices = Math.ceil(h / sliceH);
      if (i >= numSlices) return sharp;
      const top = i * sliceH;
      const height = Math.min(sliceH, h - top);
      return sharp.extract({ left: 0, top, width: w, height });
    }

    if (options.x !== undefined) {
      const sliceW = options.x as number;
      const numSlices = Math.ceil(w / sliceW);
      if (i >= numSlices) return sharp;
      const left = i * sliceW;
      const width = Math.min(sliceW, w - left);
      return sharp.extract({ left, top: 0, width, height: h });
    }

    return sharp;
  },
};
