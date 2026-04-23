import type { Metadata } from "next";
import { getDocsNav } from "@/lib/docs";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.docs" });
  return { title: t("title"), description: t("description") };
}

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getDocsNav(locale);
  const t = await getTranslations({ locale, namespace: "docs" });
  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10 lg:gap-12">
      <DocsSidebar nav={nav} locale={locale} />
      <main className="min-w-0 flex-1">
        <h1 className="font-mono text-3xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-(--muted-strong)">
          {t("indexDescription")}
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {nav
            .flatMap((g) => g.items)
            .map((item) => (
              <li key={item.slug}>
                <a
                  href={`/${locale}/docs/${item.slug}`}
                  className="block rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground transition-colors hover:border-(--border-strong) hover:bg-(--surface-soft)"
                >
                  <span className="font-medium">{item.title}</span>
                </a>
              </li>
            ))}
        </ul>
      </main>
    </div>
  );
}
