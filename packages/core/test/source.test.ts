import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Readable } from 'node:stream';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSource, registerProvider } from '../src/source/index';
import { loadFixtureJpeg } from './helpers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP_FILE = join(__dirname, 'fixtures', 'tmp-source-test.jpg');

describe('source providers', () => {
  let testBuffer: Buffer;

  beforeAll(async () => {
    testBuffer = await loadFixtureJpeg();
    writeFileSync(TMP_FILE, testBuffer);
  });

  afterAll(() => {
    try { unlinkSync(TMP_FILE); } catch {}
  });

  it('resolves Buffer input', async () => {
    const result = await resolveSource(testBuffer);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(testBuffer.length);
  });

  it('resolves Readable stream input', async () => {
    const stream = Readable.from(testBuffer);
    const result = await resolveSource(stream);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(testBuffer.length);
  });

  it('resolves file path input', async () => {
    const result = await resolveSource(TMP_FILE);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(testBuffer.length);
  });

  it('throws for unsupported input', async () => {
    await expect(resolveSource(12345)).rejects.toThrow('No source provider');
  });

  it('supports custom provider registration', async () => {
    registerProvider({
      name: 'test-custom',
      match: (input) => typeof input === 'string' && input.startsWith('test://'),
      resolve: async () => testBuffer,
    });
    const result = await resolveSource('test://anything');
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('handles a custom provider that returns a Readable stream', async () => {
    registerProvider({
      name: 'test-stream',
      match: (input) => typeof input === 'string' && input.startsWith('teststream://'),
      // Returning a stream exercises the consume-loop in resolveSource.
      resolve: async () => Readable.from(testBuffer) as unknown as Buffer,
    });
    const result = await resolveSource('teststream://anything');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(testBuffer.length);
  });
});
