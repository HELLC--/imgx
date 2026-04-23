import { lookup as dnsLookup } from 'node:dns/promises';
import net from 'node:net';
import type { SourceProvider } from '../types';

const MAX_SIZE = 20 * 1024 * 1024;
const MAX_REDIRECTS = 1;

export interface UrlProviderOptions {
  /** Maximum size in bytes for the fetched body. Default 20 MiB. */
  maxSize?: number;
  /** Maximum number of redirects to follow (each is re-validated). Default 1. */
  maxRedirects?: number;
  /** Override fetch implementation (for tests or custom transports). */
  fetch?: typeof globalThis.fetch;
  /** Override DNS lookup (for tests). */
  lookup?: (host: string) => Promise<Array<{ address: string; family: number }>>;
  /** Optional allowlist predicate; when set, only matching hostnames are allowed. */
  allowHosts?: (host: string) => boolean;
}

function defaultLookup(host: string) {
  return dnsLookup(host, { all: true });
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return true;
  const [a, b] = parts;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fec0:')) return true; // link/site-local
  if (/^f[cd]/.test(lower)) return true; // unique-local fc00::/7
  if (lower.startsWith('::ffff:')) return isPrivateIPv4(lower.slice(7));
  return false;
}

function isPrivateIp(ip: string): boolean {
  return net.isIPv6(ip) ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

async function assertPublicHost(
  host: string,
  lookupFn: NonNullable<UrlProviderOptions['lookup']>,
): Promise<void> {
  const cleanHost = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
  const ips = net.isIP(cleanHost)
    ? [cleanHost]
    : (await lookupFn(cleanHost)).map((r) => r.address);
  if (ips.length === 0) {
    throw new Error(`blocked: ${host} did not resolve to any address`);
  }
  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new Error(`blocked: ${host} resolves to non-public address ${ip}`);
    }
  }
}

async function readWithLimit(res: Response, limit: number): Promise<Buffer> {
  const cl = res.headers.get('content-length');
  if (cl) {
    const n = Number(cl);
    if (Number.isFinite(n) && n > limit) {
      throw new Error(`Source exceeds ${limit} bytes (content-length: ${n})`);
    }
  }
  const body = res.body as ReadableStream<Uint8Array> | null;
  if (!body) {
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > limit) {
      throw new Error(`Source exceeds ${limit} bytes: ${buf.length}`);
    }
    return buf;
  }
  const reader = body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > limit) {
        try { await reader.cancel(); } catch { /* ignore */ }
        throw new Error(`Source exceeds ${limit} bytes`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    try { reader.releaseLock(); } catch { /* ignore */ }
  }
  return Buffer.concat(chunks);
}

export function createUrlProvider(opts: UrlProviderOptions = {}): SourceProvider {
  const maxSize = opts.maxSize ?? MAX_SIZE;
  const maxRedirects = opts.maxRedirects ?? MAX_REDIRECTS;
  const fetchFn = opts.fetch ?? globalThis.fetch;
  const lookupFn = opts.lookup ?? defaultLookup;

  return {
    name: 'url',
    match: (input) =>
      typeof input === 'string' &&
      (input.startsWith('http://') || input.startsWith('https://')),
    async resolve(input) {
      let current = input as string;
      for (let hop = 0; hop <= maxRedirects; hop++) {
        const url = new URL(current);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error(`unsupported protocol: ${url.protocol}`);
        }
        if (url.username || url.password) {
          throw new Error('credentialed URLs are not allowed');
        }
        if (opts.allowHosts && !opts.allowHosts(url.hostname)) {
          throw new Error(`host not in allowlist: ${url.hostname}`);
        }
        await assertPublicHost(url.hostname, lookupFn);

        const res = await fetchFn(current, { redirect: 'manual' });

        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get('location');
          if (!loc) throw new Error(`redirect ${res.status} without Location header`);
          if (hop >= maxRedirects) {
            throw new Error(`too many redirects (max ${maxRedirects})`);
          }
          current = new URL(loc, current).toString();
          continue;
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        return readWithLimit(res, maxSize);
      }
      throw new Error('redirect loop');
    },
  };
}

export const urlProvider: SourceProvider = createUrlProvider();
