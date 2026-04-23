import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

export const roundedCorners: Operation = {
  name: 'rounded-corners',

  parse(params: string) {
    const kv = parseKV(params);
    return { r: parseInt(kv.r, 10) };
  },

  serialize(options) {
    return serializeKV({ r: options.r });
  },

  validate(options) {
    const r = options.r as number | undefined;
    if (r === undefined) throw new ValidationError('rounded-corners', 'r', 'required');
    if (r < 1 || r > 4096) throw new ValidationError('rounded-corners', 'r', 'must be 1-4096');
  },

  async apply(sharp: Sharp, options) {
    const r = options.r as number;
    const meta = await sharp.metadata();
    const w = meta.width!;
    const h = meta.height!;
    const actualR = Math.min(r, Math.floor(Math.min(w, h) / 2));

    const mask = Buffer.from(
      `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${actualR}" ry="${actualR}" fill="white"/></svg>`,
    );

    return sharp
      .ensureAlpha()
      .composite([{ input: mask, blend: 'dest-in' }])
      .png();
  },
};
