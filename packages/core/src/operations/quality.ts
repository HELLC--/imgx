import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';
import { parseKV, serializeKV } from './types';

export const quality: Operation = {
  name: 'quality',

  parse(params: string): Record<string, unknown> {
    const kv = parseKV(params);
    const result: Record<string, unknown> = {};
    if (kv.q !== undefined) result.q = parseInt(kv.q, 10);
    if (kv.Q !== undefined) result.Q = parseInt(kv.Q, 10);
    return result;
  },

  serialize(options: Record<string, unknown>): string {
    const out: Record<string, unknown> = {};
    if (options.q !== undefined) out.q = options.q;
    if (options.Q !== undefined) out.Q = options.Q;
    return serializeKV(out);
  },

  validate(options: Record<string, unknown>): void {
    const q = options.q as number | undefined;
    const Q = options.Q as number | undefined;

    if (q !== undefined) {
      if (q < 1 || q > 100) {
        throw new ValidationError('quality', 'q', 'q must be between 1 and 100');
      }
    }
    if (Q !== undefined) {
      if (Q < 1 || Q > 100) {
        throw new ValidationError('quality', 'Q', 'Q must be between 1 and 100');
      }
    }
  },

  apply(sharp: Sharp, _options: Record<string, unknown>): Sharp {
    // Quality is applied as a deferred operation by the pipeline,
    // which determines the output format and applies quality accordingly.
    return sharp;
  },
};
