import type { Operation } from '../types';
import { autoOrient } from './auto-orient';
import { rotate } from './rotate';
import { flip } from './flip';
import { blur } from './blur';
import { quality } from './quality';
import { format } from './format';
import { circle } from './circle';
import { roundedCorners } from './rounded-corners';
import { indexcrop } from './indexcrop';
import { crop } from './crop';
import { resize } from './resize';
import { watermark } from './watermark';

const registry = new Map<string, Operation>();

export function register(op: Operation): void {
  registry.set(op.name, op);
}

export function getOperation(name: string): Operation | undefined {
  return registry.get(name);
}

export function getAllOperations(): Operation[] {
  return Array.from(registry.values());
}

// Register built-in operations
register(autoOrient);
register(rotate);
register(flip);
register(blur);
register(quality);
register(format);
register(circle);
register(roundedCorners);
register(indexcrop);
register(crop);
register(resize);
register(watermark);
