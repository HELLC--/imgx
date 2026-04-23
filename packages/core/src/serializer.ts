import type { OperationDescriptor } from './types';
import { getOperation } from './operations/index';

export function buildURL(operations: OperationDescriptor[]): string {
  const segments: string[] = [];

  for (const desc of operations) {
    const op = getOperation(desc.name);
    if (!op) continue;

    if (desc.name === 'format' && desc.options.interlace) {
      const { interlace, ...formatOpts } = desc.options;
      const params = op.serialize(formatOpts);
      segments.push(params ? `format,${params}` : 'format');
      if (interlace) {
        segments.push('interlace,1');
      }
    } else {
      const params = op.serialize(desc.options);
      segments.push(params ? `${desc.name},${params}` : desc.name);
    }
  }

  return 'image' + (segments.length ? '/' + segments.join('/') : '');
}
