import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function LocaleNotFound() {
  const t = useTranslations("common.notFound");
  const locale = useLocale();
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-4 text-[var(--muted-strong)]">{t("description")}</p>
      <Link href={`/${locale}`} className="mt-6 inline-block underline">
        {t("ctaHome")}
      </Link>
    </main>
  );
}
