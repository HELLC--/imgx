import type { Metadata } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HomeCompareImage } from "@/components/shared/HomeCompareImage";
import { InstallBox } from "@/components/shared/InstallBox";
import hljs from "highlight.js/lib/core";
import ts from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", ts);

function highlight(code: string) {
  return hljs.highlight(code, { language: "typescript" }).value;
}

const SAMPLE_PARAMS = {
  c1: "image/resize,w_300",
  c2: "image/resize,w_200,h_200,m_fill/circle,r_100",
  c3: "image/resize,w_400/watermark,text_SGVsbG8sd_t_50,g_se",
} as const;

const URL_EXAMPLE = `import { processImage } from '@imgx/core';

const buf = await processImage(
  './photo.jpg',
  'image/resize,w_300/format,webp',
);`;

const BUILDER_EXAMPLE = `import { imgx } from '@imgx/core';

const buf = await imgx('./photo.jpg')
  .resize({ w: 300 })
  .format({ type: 'webp' })
  .toBuffer();`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return { title: t("title"), description: t("description") };
}

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const locale = useLocale();
  const link = (p: string) => `/${locale}${p}`;
  const apiURL = (params: string) =>
    `/api/process?sample=default&params=${encodeURIComponent(params)}`;

  return (
    <main>
      {/* Hero ------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div
          className="dotted-bg absolute inset-0 -z-10 opacity-70"
          aria-hidden
        />
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-8 text-center sm:pt-28 sm:pb-24">
          <span className="eyebrow">{tc("site.tagline")}</span>
          <h1 className="display-heading mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-[88px]">
            {t("heroHeadline")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-strong)] sm:text-lg">
            {t("heroLead")}
          </p>
          <InstallBox />
          <p className="mt-4 text-xs text-[var(--muted)]">
            <Link
              href={link("/docs")}
              className="underline underline-offset-2 hover:text-[var(--foreground)] transition-colors"
            >
              {t("ctaDocs")}
            </Link>
            {" · "}{t("heroNodeNote")}
          </p>
        </div>
      </section>

      {/* itsycal-style narrow document ----------------------------------- */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-[17px] leading-relaxed text-[var(--foreground)]">
        {/* Features */}
        <h2 className="text-xl font-semibold tracking-tight">
          {t("featuresTitle")}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-[var(--muted)]">
          {[1, 2, 3, 4].map((i) => (
            <li key={`f${i}`}>
              <span className="font-medium">{t(`feature${i}Title`)}</span>
              <span className="text-[var(--muted-strong)]">
                {" — "}
                {t(`feature${i}Desc`)}
              </span>
            </li>
          ))}
        </ul>

        {/* Examples */}
        <h2 className="mt-14 text-xl font-semibold tracking-tight">
          {t("examplesTitle")}
        </h2>
        <p className="mt-3 text-[var(--muted-strong)]">
          {t("examplesLead")}
        </p>
        <div className="mt-6 space-y-6">
          <CodeBlock label={t("exampleUrlLabel")} code={URL_EXAMPLE} />
          <CodeBlock
            label={t("exampleBuilderLabel")}
            code={BUILDER_EXAMPLE}
          />
        </div>

        {/* Showcase */}
        <h2 className="mt-14 text-xl font-semibold tracking-tight">
          {t("comparisonTitle")}
        </h2>
        <p className="mt-3 text-[var(--muted-strong)]">
          {t("comparisonLead")}
        </p>

        <div className="mt-6 space-y-5">
          {(["c1", "c2", "c3"] as const).map((key, idx) => (
            <div key={key} className="flex items-start gap-4">
              <div className="w-32 shrink-0">
                <HomeCompareImage
                  src={apiURL(SAMPLE_PARAMS[key])}
                  alt={t(`compare${idx + 1}Caption`)}
                  errorLabel={t("comparePreviewError")}
                />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium leading-snug">{t(`compare${idx + 1}Caption`)}</p>
                <code className="mt-1 block break-all text-[12px] text-[var(--muted)]">{SAMPLE_PARAMS[key]}</code>
              </div>
            </div>
          ))}
        </div>

        {/* Trailing note (itsycal-style) */}
        <p className="mt-14 text-[var(--muted-strong)]">
          {t.rich("trailingNote", {
            sharpLink: (chunks) => (
              <a
                href="https://sharp.pixelplumbing.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[#0066cc] hover:underline"
              >
                {chunks}
              </a>
            ),
            vipsLink: (chunks) => (
              <a
                href="https://www.libvips.org/"
                target="_blank"
                rel="noreferrer"
                className="text-[#0066cc] hover:underline"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </section>
    </main>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  const html = highlight(code);
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <pre className="hljs overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--code-bg)] p-4 text-[13px] leading-relaxed text-[var(--code-fg)]">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
