import sharp from 'sharp';
import type { OperationDescriptor } from './types';
import { ValidationError } from './types';
import { getOperation } from './operations/index';

const MAX_SOURCE_SIZE = 20 * 1024 * 1024;
const MAX_SOURCE_EDGE = 30_000;
const MAX_SOURCE_PIXELS = 250_000_000;
const SUPPORTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'tiff', 'heif', 'bmp', 'avif']);

const FORMAT_MAP: Record<string, string> = { jpg: 'jpeg', heic: 'heif' };
const LOSSLESS = new Set(['png', 'gif']);

async function validateSource(buffer: Buffer): Promise<void> {
  if (buffer.length > MAX_SOURCE_SIZE) {
    throw new ValidationError('source', 'size', `exceeds 20MB limit: ${buffer.length} bytes`);
  }
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (meta.format && !SUPPORTED_FORMATS.has(meta.format)) {
    throw new ValidationError('source', 'format', `unsupported format: ${meta.format}`);
  }
  if (w > MAX_SOURCE_EDGE || h > MAX_SOURCE_EDGE) {
    throw new ValidationError('source', 'dimensions', `edge exceeds 30,000px: ${w}x${h}`);
  }
  if (w * h > MAX_SOURCE_PIXELS) {
    throw new ValidationError('source', 'pixels', `exceeds 250M pixel limit: ${w * h}`);
  }
}

function resolveSharpFormat(type: string): string {
  return FORMAT_MAP[type] ?? type;
}

function pickQualityValue(options: Record<string, unknown>): number | undefined {
  const Q = options.Q as number | undefined;
  const q = options.q as number | undefined;
  if (Q !== undefined) return Q;
  if (q !== undefined) return q;
  return undefined;
}

async function applyFinalEncode(
  buffer: Buffer,
  formatDesc: OperationDescriptor | undefined,
  qualityDesc: OperationDescriptor | undefined,
): Promise<Buffer> {
  if (!formatDesc && !qualityDesc) return buffer;

  const meta = await sharp(buffer).metadata();
  const targetFormat = formatDesc
    ? resolveSharpFormat(formatDesc.options.type as string)
    : meta.format ?? 'jpeg';

  const encoderOpts: Record<string, unknown> = {};

  if (formatDesc?.options.interlace) {
    encoderOpts.progressive = true;
  }

  if (qualityDesc && !LOSSLESS.has(targetFormat)) {
    const qv = pickQualityValue(qualityDesc.options);
    if (qv !== undefined) encoderOpts.quality = qv;
  }

  // If neither encoder option matters and format is unchanged, skip the re-encode.
  if (Object.keys(encoderOpts).length === 0 && (!formatDesc || targetFormat === meta.format)) {
    return buffer;
  }

  return sharp(buffer)
    .toFormat(targetFormat as keyof sharp.FormatEnum, encoderOpts)
    .toBuffer();
}

export async function executePipeline(
  input: Buffer,
  operations: OperationDescriptor[],
): Promise<Buffer> {
  await validateSource(input);

  const qualityDesc = operations.find((op) => op.name === 'quality');
  const formatDesc = operations.find((op) => op.name === 'format');
  const regularOps = operations.filter((op) => op.name !== 'quality' && op.name !== 'format');

  // Validate format/quality up front so errors surface before any work is done.
  if (formatDesc) {
    const op = getOperation('format')!;
    op.validate(formatDesc.options);
  }
  if (qualityDesc) {
    const op = getOperation('quality')!;
    op.validate(qualityDesc.options);
  }

  let buffer = input;
  for (const desc of regularOps) {
    const op = getOperation(desc.name);
    if (!op) {
      console.warn(`Unknown operation: ${desc.name}, skipping`);
      continue;
    }
    op.validate(desc.options);
    const s = sharp(buffer);
    const result = await op.apply(s, desc.options);
    buffer = await result.toBuffer();
  }

  return applyFinalEncode(buffer, formatDesc, qualityDesc);
}
