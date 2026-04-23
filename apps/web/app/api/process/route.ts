import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { parseURL, executePipeline, ValidationError } from '@imgx/core';
import { getSample } from '@/content/samples';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPERATIONS = 8;

interface ErrorBody {
  code: string;
  message: string;
  detail?: string;
}

function errorResponse(status: number, body: ErrorBody, extraHeaders: Record<string, string> = {}): Response {
  return Response.json({ error: body }, { status, headers: extraHeaders });
}

function getClientIP(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

const MIME_BY_FORMAT: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg:  'image/jpeg',
  png:  'image/png',
  webp: 'image/webp',
  gif:  'image/gif',
  avif: 'image/avif',
  tiff: 'image/tiff',
  bmp:  'image/bmp',
};

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const sampleId = url.searchParams.get('sample');
  const params = url.searchParams.get('params');

  if (!sampleId || !params) {
    return errorResponse(400, { code: 'INVALID_PARAMS', message: 'sample and params are required' });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return errorResponse(429,
      { code: 'RATE_LIMITED', message: 'Too many requests' },
      { 'Retry-After': String(rl.retryAfterSeconds) });
  }

  const sample = getSample(sampleId);
  if (!sample) {
    return errorResponse(400, { code: 'INVALID_SAMPLE', message: `Unknown sample: ${sampleId}` });
  }

  let operations;
  try {
    operations = parseURL(params);
  } catch (err) {
    if (err instanceof ValidationError) {
      return errorResponse(400, { code: 'INVALID_PARAMS', message: err.message, detail: `${err.operation}.${err.param}` });
    }
    return errorResponse(400, { code: 'INVALID_PARAMS', message: (err as Error).message });
  }

  if (operations.length > MAX_OPERATIONS) {
    return errorResponse(422, {
      code: 'OPERATION_LIMIT',
      message: `Too many operations (got ${operations.length}, max ${MAX_OPERATIONS})`,
    });
  }

  let inputBuf: Buffer;
  try {
    inputBuf = await readFile(join(process.cwd(), 'public', 'samples', sample.filename));
  } catch (err) {
    return errorResponse(500, { code: 'INTERNAL_ERROR', message: 'Failed to load sample image', detail: (err as Error).message });
  }

  const start = Date.now();
  let outputBuf: Buffer;
  try {
    outputBuf = await executePipeline(inputBuf, operations);
  } catch (err) {
    if (err instanceof ValidationError) {
      return errorResponse(400, { code: 'INVALID_PARAMS', message: err.message, detail: `${err.operation}.${err.param}` });
    }
    return errorResponse(422, { code: 'OPERATION_FAILED', message: (err as Error).message });
  }
  const duration = Date.now() - start;

  let mime = 'application/octet-stream';
  try {
    const meta = await sharp(outputBuf).metadata();
    if (meta.format && MIME_BY_FORMAT[meta.format]) mime = MIME_BY_FORMAT[meta.format];
  } catch {
    // keep default
  }

  return new Response(new Uint8Array(outputBuf), {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Imgx-Input-Bytes':  String(inputBuf.length),
      'X-Imgx-Output-Bytes': String(outputBuf.length),
      'X-Imgx-Duration-Ms':  String(duration),
      'X-Imgx-Operations':   String(operations.length),
    },
  });
}
