import type { Readable } from 'node:stream';
import type { SourceProvider } from '../types';
import { bufferProvider } from './buffer';
import { streamProvider } from './stream';
import { fileProvider } from './file';
import { urlProvider } from './url';

const providers: SourceProvider[] = [
  bufferProvider,
  streamProvider,
  fileProvider,
  urlProvider,
];

export function registerProvider(provider: SourceProvider): void {
  providers.unshift(provider);
}

export async function resolveSource(input: unknown): Promise<Buffer> {
  for (const provider of providers) {
    if (provider.match(input)) {
      const result = await provider.resolve(input);
      if (Buffer.isBuffer(result)) return result;
      const stream = result as Readable;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
      }
      return Buffer.concat(chunks);
    }
  }
  throw new Error(`No source provider matched input: ${typeof input}`);
}
