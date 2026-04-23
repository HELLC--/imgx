import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

const GRAVITY_POSITIONS: Record<string, (srcW: number, srcH: number, w: number, h: number) => [number, number]> = {
  nw:     (srcW, srcH, w, h) => [0, 0],
  north:  (srcW, srcH, w, h) => [Math.floor(srcW / 2 - w / 2), 0],
  ne:     (srcW, srcH, w, h) => [srcW - w, 0],
  west:   (srcW, srcH, w, h) => [0, Math.floor(srcH / 2 - h / 2)],
  center: (srcW, srcH, w, h) => [Math.floor(srcW / 2 - w / 2), Math.floor(srcH / 2 - h / 2)],
  east:   (srcW, srcH, w, h) => [srcW - w, Math.floor(srcH / 2 - h / 2)],
  sw:     (srcW, srcH, w, h) => [0, srcH - h],
  south:  (srcW, srcH, w, h) => [Math.floor(srcW / 2 - w / 2), srcH - h],
  se:     (srcW, srcH, w, h) => [srcW - w, srcH - h],
};

export const crop: Operation = {
  name: 'crop',

  parse(params: string) {
    const kv = parseKV(params);
    const result: Record<string, unknown> = {};
    if (kv.w) result.w = parseInt(kv.w, 10);
    if (kv.h) result.h = parseInt(kv.h, 10);
    if (kv.x) result.x = parseInt(kv.x, 10);
    if (kv.y) result.y = parseInt(kv.y, 10);
    if (kv.g) result.g = kv.g;
    return result;
  },

  serialize(options) {
    return serializeKV(options);
  },

  validate(options) {
    const g = options.g as string | undefined;
    if (g && !GRAVITY_POSITIONS[g]) {
      throw new ValidationError('crop', 'g', `invalid gravity: ${g}`);
    }
  },

  async apply(sharp: Sharp, options) {
    const meta = await sharp.metadata();
    const srcW = meta.width!;
    const srcH = meta.height!;
    const cropW = (options.w as number) ?? srcW;
    const cropH = (options.h as number) ?? srcH;
    const g = (options.g as string) ?? 'nw';
    const offsetX = (options.x as number) ?? 0;
    const offsetY = (options.y as number) ?? 0;

    const calcPos = GRAVITY_POSITIONS[g] ?? GRAVITY_POSITIONS.nw;
    const [baseX, baseY] = calcPos(srcW, srcH, cropW, cropH);

    // x/y are interpreted as inward offsets from the gravity edge:
    // for left/top-anchored gravities they push toward the centre;
    // for right/bottom-anchored gravities they pull back from the edge.
    const isRight = g === 'ne' || g === 'east' || g === 'se';
    const isBottom = g === 'sw' || g === 'south' || g === 'se';
    const left = Math.max(0, baseX + (isRight ? -offsetX : offsetX));
    const top = Math.max(0, baseY + (isBottom ? -offsetY : offsetY));
    const width = Math.min(cropW, srcW - left);
    const height = Math.min(cropH, srcH - top);

    return sharp.extract({ left, top, width, height });
  },
};
