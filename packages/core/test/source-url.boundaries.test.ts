import { describe, it, expect } from 'vitest';
import { createUrlProvider, urlProvider } from '../src/source/url';

const PUBLIC_IP = '93.184.216.34';
const publicLookup = () => async () => [{ address: PUBLIC_IP, family: 4 }];

describe('urlProvider additional boundaries', () => {
  it('match() returns false for non-string input', () => {
    expect(urlProvider.match(Buffer.from('x'))).toBe(false);
    expect(urlProvider.match(123 as unknown as string)).toBe(false);
  });

  it('match() returns false for non-http(s) strings', () => {
    expect(urlProvider.match('file:///etc/passwd')).toBe(false);
    expect(urlProvider.match('s3://bucket/key')).toBe(false);
    expect(urlProvider.match('plain-string')).toBe(false);
  });

  it('match() returns true for http and https URLs', () => {
    expect(urlProvider.match('http://e.com/a')).toBe(true);
    expect(urlProvider.match('https://e.com/a')).toBe(true);
  });

  it('throws on non-2xx, non-3xx responses', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('nope', { status: 404, statusText: 'Not Found' }),
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://example.com/missing')).rejects.toThrow(/404/);
  });

  it('throws when 3xx response is missing a Location header', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response(null, { status: 302 }),
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://example.com/r')).rejects.toThrow(/Location/);
  });

  it('throws when DNS resolves to no addresses', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [],
    });
    await expect(p.resolve('http://nxdomain.example/img')).rejects.toThrow(
      /did not resolve/,
    );
  });

  it('blocks 0.0.0.0', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [{ address: '0.0.0.0', family: 4 }],
    });
    await expect(p.resolve('http://example.com/x')).rejects.toThrow(/non-public/);
  });

  it('blocks multicast IPv4 (224.0.0.1)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [{ address: '224.0.0.1', family: 4 }],
    });
    await expect(p.resolve('http://example.com/x')).rejects.toThrow(/non-public/);
  });

  it('blocks CGNAT (100.64.x.x)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [{ address: '100.64.0.1', family: 4 }],
    });
    await expect(p.resolve('http://example.com/x')).rejects.toThrow(/non-public/);
  });

  it('blocks IPv6 link-local (fe80::)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [],
    });
    await expect(p.resolve('http://[fe80::1]/x')).rejects.toThrow(/non-public/);
  });

  it('blocks IPv4-mapped private IPv6 (::ffff:127.0.0.1)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [],
    });
    await expect(p.resolve('http://[::ffff:127.0.0.1]/x')).rejects.toThrow(/non-public/);
  });

  it('honours content-length when within limit then reads body', async () => {
    const p = createUrlProvider({
      maxSize: 1024,
      fetch: async () =>
        new Response('payload', {
          status: 200,
          headers: { 'content-length': '7' },
        }),
      lookup: publicLookup(),
    });
    const buf = await p.resolve('http://example.com/ok');
    expect(buf.toString()).toBe('payload');
  });

  it('rejects body without content-length when arrayBuffer exceeds limit', async () => {
    // Force the no-stream path by handing fetch a Response whose body is null.
    const p = createUrlProvider({
      maxSize: 4,
      fetch: async () => {
        const res = new Response('toolong', { status: 200 });
        Object.defineProperty(res, 'body', { value: null });
        return res;
      },
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://example.com/x')).rejects.toThrow(/exceeds/);
  });
});
