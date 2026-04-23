import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

export const blur: Operation = {
  name: 'blur',

  parse(params: string): Record<string, unknown> {
    const kv = parseKV(params);
    return {
      r: parseInt(kv.r, 10),
      s: parseInt(kv.s, 10),
    };
  },

  serialize(options: Record<string, unknown>): string {
    return serializeKV({ r: options.r, s: options.s });
  },

  validate(options: Record<string, unknown>): void {
    const r = options.r as number | undefined;
    const s = options.s as number | undefined;

    if (r === undefined || isNaN(r as number)) {
      throw new ValidationError('blur', 'r', 'r is required');
    }
    if (s === undefined || isNaN(s as number)) {
      throw new ValidationError('blur', 's', 's is required');
    }
    if (r < 1 || r > 50) {
      throw new ValidationError('blur', 'r', 'r must be between 1 and 50');
    }
    if (s < 1 || s > 50) {
      throw new ValidationError('blur', 's', 's must be between 1 and 50');
    }
  },

  apply(sharp: Sharp, options: Record<string, unknown>): Sharp {
    const s = options.s as number;
    return sharp.blur(s);
  },
};
