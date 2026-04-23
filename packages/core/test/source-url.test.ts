import { describe, it, expect } from 'vitest';
import { createUrlProvider } from '../src/source/url';

const PUBLIC_IP = '93.184.216.34'; // example.com

function publicLookup() {
  return async () => [{ address: PUBLIC_IP, family: 4 }];
}

describe('urlProvider SSRF guards', () => {
  it('blocks private IPv4 (10.x) after DNS resolution', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [{ address: '10.0.0.1', family: 4 }],
    });
    await expect(p.resolve('http://attacker.example/img.jpg')).rejects.toThrow(/non-public/);
  });

  it('blocks loopback (127.0.0.1)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [{ address: '127.0.0.1', family: 4 }],
    });
    await expect(p.resolve('http://localhost/img.jpg')).rejects.toThrow(/non-public/);
  });

  it('blocks cloud metadata IP literal (169.254.169.254)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [],
    });
    await expect(p.resolve('http://169.254.169.254/latest/')).rejects.toThrow(/non-public/);
  });

  it('blocks IPv6 loopback literal ([::1])', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [],
    });
    await expect(p.resolve('http://[::1]/img')).rejects.toThrow(/non-public/);
  });

  it('blocks unique-local IPv6 (fc00::/7)', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: async () => [],
    });
    await expect(p.resolve('http://[fc00::1]/img')).rejects.toThrow(/non-public/);
  });

  it('rejects URLs with credentials', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://user:pass@example.com/img')).rejects.toThrow(/credentialed/);
  });

  it('rejects unsupported protocol', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('x'),
      lookup: publicLookup(),
    });
    // match() only allows http/https, so we reach into resolve() directly with a forced URL
    await expect(p.resolve('ftp://example.com/img')).rejects.toThrow(/protocol/);
  });

  it('rejects oversize Content-Length before exhausting body', async () => {
    const body = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array(1024));
      },
    });
    const p = createUrlProvider({
      maxSize: 100,
      fetch: async () =>
        new Response(body, {
          status: 200,
          headers: { 'content-length': '999999' },
        }),
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://example.com/big')).rejects.toThrow(/exceeds/);
  });

  it('aborts streaming when body exceeds limit (no content-length)', async () => {
    let cancelled = false;
    const body = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array(200));
      },
      cancel() {
        cancelled = true;
      },
    });
    const p = createUrlProvider({
      maxSize: 100,
      fetch: async () => new Response(body, { status: 200 }),
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://example.com/big')).rejects.toThrow(/exceeds/);
    expect(cancelled).toBe(true);
  });

  it('follows one safe redirect and re-validates the target', async () => {
    let calls = 0;
    const visited: string[] = [];
    const p = createUrlProvider({
      fetch: async (url) => {
        visited.push(url as string);
        calls++;
        if (calls === 1) {
          return new Response(null, {
            status: 302,
            headers: { location: 'http://final.example.com/img' },
          });
        }
        return new Response('imgdata', { status: 200 });
      },
      lookup: publicLookup(),
    });
    const buf = await p.resolve('http://example.com/r');
    expect(buf.toString()).toBe('imgdata');
    expect(calls).toBe(2);
    expect(visited[1]).toBe('http://final.example.com/img');
  });

  it('blocks redirect whose target resolves to a private IP', async () => {
    const p = createUrlProvider({
      fetch: async () =>
        new Response(null, {
          status: 302,
          headers: { location: 'http://internal.lan/x' },
        }),
      lookup: async (host) =>
        host === 'example.com'
          ? [{ address: PUBLIC_IP, family: 4 }]
          : [{ address: '10.0.0.5', family: 4 }],
    });
    await expect(p.resolve('http://example.com/r')).rejects.toThrow(/non-public/);
  });

  it('caps redirects (default 1)', async () => {
    const p = createUrlProvider({
      fetch: async () =>
        new Response(null, {
          status: 302,
          headers: { location: 'http://hop.example.com/x' },
        }),
      lookup: publicLookup(),
    });
    await expect(p.resolve('http://example.com/r')).rejects.toThrow(/too many redirects/);
  });

  it('honors allowHosts allowlist', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('ok', { status: 200 }),
      lookup: publicLookup(),
      allowHosts: (h) => h === 'cdn.example.com',
    });
    await expect(p.resolve('http://example.com/img')).rejects.toThrow(/allowlist/);
    const buf = await p.resolve('http://cdn.example.com/img');
    expect(buf.toString()).toBe('ok');
  });

  it('allows a public host end-to-end', async () => {
    const p = createUrlProvider({
      fetch: async () => new Response('hello', { status: 200 }),
      lookup: publicLookup(),
    });
    const buf = await p.resolve('http://example.com/img');
    expect(buf.toString()).toBe('hello');
  });
});
