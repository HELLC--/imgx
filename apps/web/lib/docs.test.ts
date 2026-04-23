import { describe, it, expect } from 'vitest';
import { getDocSlugs, getDocContent, getDocsNav } from './docs';

describe('getDocSlugs', () => {
  it('returns all markdown slugs for zh locale', async () => {
    const slugs = await getDocSlugs('zh');
    expect(slugs).toContain('index');
    expect(slugs).toContain('resize-images');
    expect(slugs.length).toBeGreaterThanOrEqual(13);
  });

  it('returns english core slugs', async () => {
    const slugs = await getDocSlugs('en');
    expect(slugs).toEqual(
      expect.arrayContaining(['index', 'resize-images', 'custom-crop', 'rotate', 'convert-image-formats']),
    );
  });
});

describe('getDocContent', () => {
  it('reads markdown body and frontmatter', async () => {
    const doc = await getDocContent('zh', 'resize-images');
    expect(doc!.frontmatter.title).toBe('图片缩放 resize');
    expect(doc!.frontmatter.category).toBe('size');
    expect(doc!.body).toContain('# ');
  });

  it('returns null for unknown slug', async () => {
    const doc = await getDocContent('zh', 'no-such-slug');
    expect(doc).toBeNull();
  });
});

describe('getDocsNav', () => {
  it('groups by category and sorts by order', async () => {
    const nav = await getDocsNav('zh');
    const categories = nav.map((g) => g.category);
    expect(categories).toContain('size');
    const sizeGroup = nav.find((g) => g.category === 'size')!;
    const orders = sizeGroup.items.map((i) => i.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
