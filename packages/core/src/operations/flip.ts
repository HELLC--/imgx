import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';

export const flip: Operation = {
  name: 'flip',

  parse(params: string): Record<string, unknown> {
    return { value: params === '' ? NaN : Number(params) };
  },

  serialize(options: Record<string, unknown>): string {
    return String(options.value);
  },

  validate(options: Record<string, unknown>): void {
    const v = options.value as number;
    if (typeof v !== 'number' || Number.isNaN(v)) {
      throw new ValidationError('flip', 'value', 'value is required');
    }
    if (v !== 0 && v !== 1 && v !== 2) {
      throw new ValidationError('flip', 'value', 'value must be 0, 1, or 2');
    }
  },

  apply(sharp: Sharp, options: Record<string, unknown>): Sharp {
    const v = options.value as number;
    if (v === 0) {
      return sharp.flip();
    }
    if (v === 1) {
      return sharp.flop();
    }
    // v === 2: both
    return sharp.flip().flop();
  },
};
