import { readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { Locale } from "./i18n";

export interface DocFrontmatter {
  title: string;
  category: string;
  order: number;
}

export interface Doc {
  slug: string;
  frontmatter: DocFrontmatter;
  body: string;
}

export interface DocNavItem {
  slug: string;
  title: string;
  order: number;
}

export interface DocNavGroup {
  category: string;
  items: DocNavItem[];
}

export interface DocHeading {
  depth: number;
  text: string;
  slug: string;
}

/**
 * Extract h2/h3 headings from a markdown body, skipping headings inside
 * fenced code blocks. Slugs match those produced by `rehype-slug`.
 */
export function extractHeadings(markdown: string): DocHeading[] {
  const slugger = new GithubSlugger();
  const headings: DocHeading[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length;
    // Strip inline markdown markers (backticks, emphasis, links).
    const text = m[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
      .trim();
    headings.push({ depth, text, slug: slugger.slug(text) });
  }
  return headings;
}

const ROOT = resolve(process.cwd(), "content/docs");

function localeDir(locale: Locale): string {
  return join(ROOT, locale);
}

export async function getDocSlugs(locale: Locale): Promise<string[]> {
  const entries = await readdir(localeDir(locale), { withFileTypes: true });
  return entries
    .filter(
      (e) => e.isFile() && e.name.endsWith(".md") && !e.name.startsWith("_"),
    )
    .map((e) => e.name.replace(/\.md$/, ""));
}

export async function getDocContent(
  locale: Locale,
  slug: string,
): Promise<Doc | null> {
  try {
    const raw = await readFile(join(localeDir(locale), `${slug}.md`), "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      frontmatter: {
        title: String(data.title ?? slug),
        category: String(data.category ?? "misc"),
        order: typeof data.order === "number" ? data.order : 999,
      },
      body: content,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function getDocsNav(locale: Locale): Promise<DocNavGroup[]> {
  const slugs = await getDocSlugs(locale);
  const docs = await Promise.all(slugs.map((s) => getDocContent(locale, s)));
  const groups = new Map<string, DocNavItem[]>();
  for (const doc of docs) {
    if (!doc) continue;
    const items = groups.get(doc.frontmatter.category) ?? [];
    items.push({
      slug: doc.slug,
      title: doc.frontmatter.title,
      order: doc.frontmatter.order,
    });
    groups.set(doc.frontmatter.category, items);
  }
  const ORDER = ["overview", "size", "transform", "effect", "security", "misc"];
  return Array.from(groups.entries())
    .sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.order - b.order),
    }));
}
