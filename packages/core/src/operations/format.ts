import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';

const VALID_FORMATS = ['jpg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'heic', 'avif'] as const;

const FORMAT_MAP: Record<string, string> = {
  jpg: 'jpeg',
  heic: 'heif',
};

export const format: Operation = {
  name: 'format',

  parse(params: string): Record<string, unknown> {
    return { type: params };
  },

  serialize(options: Record<string, unknown>): string {
    return options.type as string;
  },

  validate(options: Record<string, unknown>): void {
    const type = options.type as string;
    if (!type || !VALID_FORMATS.includes(type as (typeof VALID_FORMATS)[number])) {
      throw new ValidationError(
        'format',
        'type',
        `type must be one of: ${VALID_FORMATS.join(', ')}`,
      );
    }
  },

  apply(sharp: Sharp, options: Record<string, unknown>): Sharp {
    const type = options.type as string;
    const sharpFormat = FORMAT_MAP[type] ?? type;
    const formatOptions: Record<string, unknown> = {};
    if (options.interlace) {
      formatOptions.progressive = true;
    }
    return sharp.toFormat(sharpFormat as keyof import('sharp').FormatEnum, formatOptions);
  },
};
