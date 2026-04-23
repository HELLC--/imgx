import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '@/app/api/process/route';
import { _resetRateLimit } from '@/lib/rate-limit';
import { PRESETS } from '@/content/presets';

function makeReq(query: Record<string, string>): Request {
  const url = new URL('http://localhost/api/process');
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return new Request(url, { headers: { 'x-forwarded-for': '127.0.0.1' } });
}

beforeEach(() => _resetRateLimit());

describe('GET /api/process', () => {
  it('returns processed image for a valid sample + simple resize', async () => {
    const res = await GET(makeReq({ sample: 'default', params: 'image/resize,w_100' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/^image\//);
    expect(res.headers.get('cache-control')).toContain('immutable');
    expect(Number(res.headers.get('x-imgx-output-bytes'))).toBeGreaterThan(0);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
  });

  it('rejects unknown sample with INVALID_SAMPLE 400', async () => {
    const res = await GET(makeReq({ sample: 'nope', params: 'image/resize,w_100' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('INVALID_SAMPLE');
  });

  it('rejects malformed params with INVALID_PARAMS or OPERATION_FAILED', async () => {
    const res = await GET(makeReq({ sample: 'default', params: 'image/resize,w_NaN' }));
    expect([400, 422]).toContain(res.status);
    const json = await res.json();
    expect(['INVALID_PARAMS', 'OPERATION_FAILED']).toContain(json.error.code);
  });

  it('rejects operation chains > 8 with OPERATION_LIMIT 422', async () => {
    const ops = Array(9).fill('resize,w_100').join('/');
    const res = await GET(makeReq({ sample: 'default', params: `image/${ops}` }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe('OPERATION_LIMIT');
  });
});

// Single-operation smoke tests: verify each operation type used by the
// playground presets works in isolation against the bundled sample image.
describe('GET /api/process — single operation', () => {
  const SINGLE_CASES: Array<{ name: string; params: string }> = [
    { name: 'resize',          params: 'image/resize,w_120' },
    { name: 'rotate',          params: 'image/rotate,90' },
    { name: 'flip',            params: 'image/flip,1' },
    { name: 'circle',          params: 'image/circle,r_60' },
    { name: 'rounded-corners', params: 'image/rounded-corners,r_30' },
    { name: 'format',          params: 'image/format,webp' },
    { name: 'quality',         params: 'image/quality,q_75' },
    { name: 'blur',            params: 'image/blur,r_8,s_5' },
    { name: 'watermark',       params: 'image/watermark,text_SGVsbG8sd_t_50,g_se' },
  ];

  it.each(SINGLE_CASES)('runs $name on default sample', async ({ params }) => {
    const res = await GET(makeReq({ sample: 'default', params }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/^image\//);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
  });
});

// Combo tests: every preset advertised in the playground UI must succeed
// against the bundled sample image. Catches drift between PRESETS strings
// and the underlying @imgx-kit/core operation API.
describe('GET /api/process — playground presets (combo)', () => {
  it.each(PRESETS)('preset $i18nKey ($params) returns processed image', async (preset) => {
    const res = await GET(makeReq({ sample: 'default', params: `image/${preset.params}` }));
    if (res.status !== 200) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`preset "${preset.i18nKey}" (${preset.params}) failed: ${res.status} ${JSON.stringify(body)}`);
    }
    expect(res.headers.get('content-type')).toMatch(/^image\//);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
  });
});
