import { readFile } from 'node:fs/promises';
import type { SourceProvider } from '../types';

export const fileProvider: SourceProvider = {
  name: 'file',
  match: (input) => typeof input === 'string' && !input.startsWith('http://') && !input.startsWith('https://'),
  resolve: async (input) => readFile(input as string),
};
