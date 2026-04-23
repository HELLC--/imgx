import type { Readable } from 'node:stream';
import type { SourceProvider } from '../types';

export const streamProvider: SourceProvider = {
  name: 'stream',
  match: (input) => input !== null && typeof input === 'object' && typeof (input as any).pipe === 'function',
  async resolve(input) {
    const stream = input as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  },
};
