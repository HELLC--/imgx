export { type Operation } from '../types';

export function parseKV(params: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!params) return result;
  for (const part of params.split(',')) {
    const i = part.indexOf('_');
    if (i > 0) {
      result[part.slice(0, i)] = part.slice(i + 1);
    }
  }
  return result;
}

export function serializeKV(opts: Record<string, unknown>): string {
  return Object.entries(opts)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}_${v}`)
    .join(',');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
