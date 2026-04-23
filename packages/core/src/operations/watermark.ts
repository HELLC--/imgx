import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

const GRAVITY_MAP: Record<string, { left: (w: number, mw: number) => number; top: (h: number, mh: number) => number }> = {
  nw:     { left: () => 0,                              top: () => 0 },
  north:  { left: (w, mw) => Math.floor((w - mw) / 2), top: () => 0 },
  ne:     { left: (w, mw) => w - mw,                    top: () => 0 },
  west:   { left: () => 0,                              top: (h, mh) => Math.floor((h - mh) / 2) },
  center: { left: (w, mw) => Math.floor((w - mw) / 2), top: (h, mh) => Math.floor((h - mh) / 2) },
  east:   { left: (w, mw) => w - mw,                    top: (h, mh) => Math.floor((h - mh) / 2) },
  sw:     { left: () => 0,                              top: (h, mh) => h - mh },
  south:  { left: (w, mw) => Math.floor((w - mw) / 2), top: (h, mh) => h - mh },
  se:     { left: (w, mw) => w - mw,                    top: (h, mh) => h - mh },
};

function decodeBase64Url(encoded: string): string {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const watermark: Operation = {
  name: 'watermark',

  parse(params: string) {
    const kv = parseKV(params);
    const result: Record<string, unknown> = {};
    if (kv.text) result.text = kv.text;
    if (kv.image) result.image = kv.image;
    if (kv.type) result.type = kv.type;
    if (kv.color) result.color = kv.color;
    if (kv.size) result.size = parseInt(kv.size, 10);
    if (kv.shadow) result.shadow = parseInt(kv.shadow, 10);
    if (kv.rotate) result.rotate = parseInt(kv.rotate, 10);
    if (kv.t) result.t = parseInt(kv.t, 10);
    if (kv.g) result.g = kv.g;
    if (kv.x) result.x = parseInt(kv.x, 10);
    if (kv.y) result.y = parseInt(kv.y, 10);
    if (kv.voffset) result.voffset = parseInt(kv.voffset, 10);
    if (kv.fill) result.fill = parseInt(kv.fill, 10);
    if (kv.order) result.order = parseInt(kv.order, 10);
    if (kv.align) result.align = parseInt(kv.align, 10);
    if (kv.interval) result.interval = parseInt(kv.interval, 10);
    if (kv.P) result.P = parseInt(kv.P, 10);
    if (kv.padx) result.padx = parseInt(kv.padx, 10);
    if (kv.pady) result.pady = parseInt(kv.pady, 10);
    return result;
  },

  serialize(options) {
    return serializeKV(options);
  },

  validate(options) {
    if (!options.text && !options.image) {
      throw new ValidationError('watermark', 'text/image', 'either text or image is required');
    }
    if (options.image) {
      throw new ValidationError(
        'watermark',
        'image',
        'image watermarks are not yet supported',
      );
    }
    const UNSUPPORTED = ['voffset', 'fill', 'padx', 'pady', 'order', 'align', 'interval', 'P'] as const;
    for (const key of UNSUPPORTED) {
      if (options[key] !== undefined) {
        throw new ValidationError(
          'watermark',
          key,
          `${key} is not yet supported`,
        );
      }
    }
    const t = options.t as number | undefined;
    if (t !== undefined && (t < 0 || t > 100)) {
      throw new ValidationError('watermark', 't', 'must be 0-100');
    }
  },

  async apply(sharp: Sharp, options) {
    const meta = await sharp.metadata();
    const imgW = meta.width!;
    const imgH = meta.height!;
    const g = (options.g as string) ?? 'se';
    const offsetX = (options.x as number) ?? 10;
    const offsetY = (options.y as number) ?? 10;
    const opacity = ((options.t as number) ?? 100) / 100;

    if (options.text) {
      const decodedText = decodeBase64Url(options.text as string);
      const fontSize = (options.size as number) ?? 40;
      const color = (options.color as string) ?? '000000';
      const charWidth = fontSize * 0.6;
      const wmW = Math.ceil(decodedText.length * charWidth);
      const wmH = Math.ceil(fontSize * 1.4);

      const gravity = GRAVITY_MAP[g] ?? GRAVITY_MAP.se;
      const isLeft = g === 'nw' || g === 'west' || g === 'sw';
      const isRight = g === 'ne' || g === 'east' || g === 'se';
      const isTop = g === 'nw' || g === 'north' || g === 'ne';
      const isBottom = g === 'sw' || g === 'south' || g === 'se';

      let left = gravity.left(imgW, wmW) + (isLeft ? offsetX : isRight ? -offsetX : 0);
      let top = gravity.top(imgH, wmH) + (isTop ? offsetY : isBottom ? -offsetY : 0);

      left = Math.max(0, Math.min(left, imgW - wmW));
      top = Math.max(0, Math.min(top, imgH - wmH));

      const svg = Buffer.from(
        `<svg width="${wmW}" height="${wmH}">
          <text x="0" y="${fontSize}" font-size="${fontSize}" fill="#${color}" opacity="${opacity}" font-family="sans-serif">${escapeXml(decodedText)}</text>
        </svg>`,
      );

      return sharp.composite([{ input: svg, left, top }]);
    }

    return sharp;
  },
};
