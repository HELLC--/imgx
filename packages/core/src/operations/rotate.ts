import type { Sharp } from 'sharp';
import type { Operation } from '../types';
import { ValidationError } from '../types';

export const rotate: Operation = {
  name: 'rotate',

  parse(params: string): Record<string, unknown> {
    return { value: params === '' ? NaN : Number(params) };
  },

  serialize(options: Record<string, unknown>): string {
    return String(options.value);
  },

  validate(options: Record<string, unknown>): void {
    const v = options.value as number;
    if (typeof v !== 'number' || Number.isNaN(v)) {
      throw new ValidationError('rotate', 'value', 'value is required');
    }
    if (v < 0 || v > 360) {
      throw new ValidationError('rotate', 'value', 'value must be 0-360');
    }
  },

  apply(sharp: Sharp, options: Record<string, unknown>): Sharp {
    const angle = options.value as number;
    if (angle === 0) {
      return sharp;
    }
    return sharp.rotate(angle, { background: { r: 255, g: 255, b: 255, alpha: 0 } });
  },
};
