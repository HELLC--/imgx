import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

export const circle: Operation = {
  name: 'circle',

  parse(params: string) {
    const kv = parseKV(params);
    return { r: parseInt(kv.r, 10) };
  },

  serialize(options) {
    return serializeKV({ r: options.r });
  },

  validate(options) {
    const r = options.r as number | undefined;
    if (r === undefined) throw new ValidationError('circle', 'r', 'required');
    if (r < 1 || r > 4096) throw new ValidationError('circle', 'r', 'must be 1-4096');
  },

  async apply(sharp: Sharp, options) {
    const r = options.r as number;
    const meta = await sharp.metadata();
    const w = meta.width!;
    const h = meta.height!;
    const minEdge = Math.min(w, h);
    const actualR = Math.min(r, Math.floor((minEdge - 1) / 2));
    const diameter = actualR * 2 + 1;

    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const left = cx - actualR;
    const top = cy - actualR;

    const mask = Buffer.from(
      `<svg width="${diameter}" height="${diameter}"><circle cx="${actualR}" cy="${actualR}" r="${actualR}" fill="white"/></svg>`,
    );

    return sharp
      .extract({ left, top, width: diameter, height: diameter })
      .ensureAlpha()
      .composite([{ input: mask, blend: 'dest-in' }])
      .png();
  },
};
