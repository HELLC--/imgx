import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  extractHeadings,
  getDocContent,
  getDocSlugs,
  getDocsNav,
} from "@/lib/docs";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { locales, type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  const all = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await getDocSlugs(locale);
      return slugs.map((slug) => ({ locale, slug }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = await getDocContent(locale, slug);
  if (!doc) return {};
  const t = await getTranslations({ locale, namespace: "metadata.docsArticle" });
  return {
    title: t("titleTemplate", { title: doc.frontmatter.title }),
    description: doc.frontmatter.title,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = await getDocContent(locale, slug);
  const nav = await getDocsNav(locale);
  const t = await getTranslations({ locale, namespace: "docs" });

  if (!doc && locale === "en") {
    const zhDoc = await getDocContent("zh", slug);
    if (!zhDoc) notFound();
    const headings = extractHeadings(zhDoc.body);
    return (
      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10 lg:gap-12">
        <DocsSidebar nav={nav} locale={locale} currentSlug={slug} />
        <main className="min-w-0 flex-1">
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("translatingPlaceholder")}{" "}
            <a
              className="underline underline-offset-2"
              href={`/zh/docs/${slug}`}
            >
              /zh/docs/{slug}
            </a>
          </div>
          <MarkdownRenderer>{zhDoc.body}</MarkdownRenderer>
        </main>
        <TableOfContents headings={headings} label={t("onThisPage")} />
      </div>
    );
  }

  if (!doc) notFound();
  const headings = extractHeadings(doc.body);

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10 lg:gap-12">
      <DocsSidebar nav={nav} locale={locale} currentSlug={slug} />
      <main className="min-w-0 flex-1">
        <MarkdownRenderer>{doc.body}</MarkdownRenderer>
      </main>
      <TableOfContents headings={headings} label={t("onThisPage")} />
    </div>
  );
}
