import type { Sharp, ResizeOptions } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

const VALID_MODES = ['lfit', 'mfit', 'fill', 'pad', 'fixed'] as const;

const FIT_MAP: Record<string, ResizeOptions['fit']> = {
  lfit: 'inside',
  mfit: 'outside',
  fill: 'cover',
  pad: 'contain',
  fixed: 'fill',
};

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export const resize: Operation = {
  name: 'resize',

  parse(params: string) {
    const kv = parseKV(params);
    const result: Record<string, unknown> = {};
    if (kv.p) result.p = parseInt(kv.p, 10);
    if (kv.w) result.w = parseInt(kv.w, 10);
    if (kv.h) result.h = parseInt(kv.h, 10);
    if (kv.m) result.m = kv.m;
    if (kv.l) result.l = parseInt(kv.l, 10);
    if (kv.s) result.s = parseInt(kv.s, 10);
    if (kv.limit) result.limit = parseInt(kv.limit, 10);
    if (kv.color) result.color = kv.color;
    return result;
  },

  serialize(options) {
    return serializeKV(options);
  },

  validate(options) {
    const p = options.p as number | undefined;
    const w = options.w as number | undefined;
    const h = options.h as number | undefined;
    const m = options.m as string | undefined;
    const l = options.l as number | undefined;
    const s = options.s as number | undefined;

    if (p !== undefined && (p < 1 || p > 1000)) {
      throw new ValidationError('resize', 'p', 'must be 1-1000');
    }
    if (w !== undefined && (w < 1 || w > 16384)) {
      throw new ValidationError('resize', 'w', 'must be 1-16384');
    }
    if (h !== undefined && (h < 1 || h > 16384)) {
      throw new ValidationError('resize', 'h', 'must be 1-16384');
    }
    if (l !== undefined && (l < 1 || l > 16384)) {
      throw new ValidationError('resize', 'l', 'must be 1-16384');
    }
    if (s !== undefined && (s < 1 || s > 16384)) {
      throw new ValidationError('resize', 's', 'must be 1-16384');
    }
    if (m !== undefined && !VALID_MODES.includes(m as (typeof VALID_MODES)[number])) {
      throw new ValidationError('resize', 'm', `must be one of: ${VALID_MODES.join(', ')}`);
    }
  },

  async apply(sharp: Sharp, options) {
    const p = options.p as number | undefined;
    const w = options.w as number | undefined;
    const h = options.h as number | undefined;
    const m = (options.m as string) ?? 'lfit';
    const l = options.l as number | undefined;
    const s = options.s as number | undefined;
    const limit = (options.limit as number) ?? 1;
    const color = (options.color as string) ?? 'FFFFFF';
    // limit=1 means "do not enlarge", but m=fixed means the user explicitly
    // asked to stretch to the target size — honour that intent.
    const withoutEnlargement = limit === 1 && m !== 'fixed';

    if (p !== undefined) {
      const meta = await sharp.metadata();
      const targetW = Math.round(meta.width! * p / 100);
      const targetH = Math.round(meta.height! * p / 100);
      return sharp.resize(targetW, targetH, { fit: 'fill' });
    }

    if (l !== undefined || s !== undefined) {
      const meta = await sharp.metadata();
      const srcW = meta.width!;
      const srcH = meta.height!;
      const isWider = srcW >= srcH;

      if (l !== undefined && s !== undefined) {
        const fit = FIT_MAP[m] ?? 'inside';
        const targetW = isWider ? l : s;
        const targetH = isWider ? s : l;
        return sharp.resize(targetW, targetH, { fit, withoutEnlargement });
      }
      if (l !== undefined) {
        return isWider
          ? sharp.resize(l, null, { withoutEnlargement })
          : sharp.resize(null, l, { withoutEnlargement });
      }
      // s defined alone
      return isWider
        ? sharp.resize(null, s!, { withoutEnlargement })
        : sharp.resize(s!, null, { withoutEnlargement });
    }

    const fit = FIT_MAP[m] ?? 'inside';
    const resizeOpts: ResizeOptions = {
      fit,
      withoutEnlargement,
    };

    if (m === 'pad') {
      resizeOpts.background = { ...parseHexColor(color), alpha: 1 };
    }

    let targetW: number | null = w ?? null;
    let targetH: number | null = h ?? null;

    if ((m === 'pad' || m === 'fill') && (targetW === null) !== (targetH === null)) {
      targetW = targetW ?? targetH;
      targetH = targetH ?? targetW;
    }

    return sharp.resize(targetW, targetH, resizeOpts);
  },
};
