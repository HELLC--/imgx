import type { SourceProvider } from '../types';

export const bufferProvider: SourceProvider = {
  name: 'buffer',
  match: (input) => Buffer.isBuffer(input),
  resolve: async (input) => input as Buffer,
};
