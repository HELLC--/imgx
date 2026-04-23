import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES_DIR = join(__dirname, '..', 'messages');
const LOCALES = ['zh', 'en'] as const;
const NAMESPACES = ['common', 'home', 'playground', 'docs', 'errors', 'metadata'] as const;

function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

function leafValues(obj: unknown): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') return [String(obj)];
  return Object.values(obj as Record<string, unknown>).flatMap(leafValues);
}

function loadNs(locale: string, ns: string): Record<string, unknown> {
  const p = join(MESSAGES_DIR, locale, `${ns}.json`);
  return JSON.parse(readFileSync(p, 'utf8'));
}

describe('i18n message files', () => {
  it('每个 locale 都存在所有命名空间文件', () => {
    for (const locale of LOCALES) {
      const dir = join(MESSAGES_DIR, locale);
      expect(statSync(dir).isDirectory()).toBe(true);
      const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
      expect(files).toEqual(NAMESPACES.map((n) => `${n}.json`).sort());
    }
  });

  it.each(NAMESPACES)('zh/en 在命名空间 %s 内 key 完全一致', (ns) => {
    const zh = flatten(loadNs('zh', ns)).sort();
    const en = flatten(loadNs('en', ns)).sort();
    expect(en).toEqual(zh);
  });

  it('禁止出现待译占位符或空值', () => {
    for (const locale of LOCALES) {
      for (const ns of NAMESPACES) {
        for (const value of leafValues(loadNs(locale, ns))) {
          expect(value, `${locale}/${ns} placeholder`).not.toMatch(/TODO|待译|FIXME/i);
          expect(value.trim().length, `${locale}/${ns} empty leaf`).toBeGreaterThan(0);
        }
      }
    }
  });
});
