import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';

export const autoOrient: Operation = {
  name: 'auto-orient',

  parse(params: string): Record<string, unknown> {
    return { value: Number(params) };
  },

  serialize(options: Record<string, unknown>): string {
    return String(options.value);
  },

  validate(options: Record<string, unknown>): void {
    const v = options.value as number;
    if (v !== 0 && v !== 1) {
      throw new ValidationError('auto-orient', 'value', 'value must be 0 or 1');
    }
  },

  apply(sharp: Sharp, options: Record<string, unknown>): Sharp {
    const v = options.value as number;
    if (v === 1) {
      return sharp.rotate();
    }
    return sharp;
  },
};
