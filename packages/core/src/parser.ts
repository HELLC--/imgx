import type { OperationDescriptor } from './types';
import { getOperation } from './operations/index';

export function parseURL(url: string): OperationDescriptor[] {
  if (!url) return [];

  let input = url;
  if (input.startsWith('image/')) {
    input = input.slice(6);
  }

  const segments = input.split('/');
  const ops: OperationDescriptor[] = [];
  let pendingInterlace: boolean | undefined;

  for (const segment of segments) {
    if (!segment) continue;
    const firstComma = segment.indexOf(',');
    const name = firstComma === -1 ? segment : segment.slice(0, firstComma);
    const params = firstComma === -1 ? '' : segment.slice(firstComma + 1);

    if (name === 'interlace') {
      const value = params === '1' || params === '';
      const formatOp = ops.find((op) => op.name === 'format');
      if (formatOp) {
        formatOp.options.interlace = value;
      } else {
        pendingInterlace = value;
      }
      continue;
    }

    const op = getOperation(name);
    if (!op) {
      console.warn(`Unknown operation: ${name}, skipping`);
      continue;
    }

    const parsed = { name, options: op.parse(params) };
    ops.push(parsed);

    if (name === 'format' && pendingInterlace !== undefined) {
      parsed.options.interlace = pendingInterlace;
      pendingInterlace = undefined;
    }
  }

  return ops;
}
