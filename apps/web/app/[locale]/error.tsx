"use client";
import { useTranslations } from "next-intl";

export default function LocaleError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("common.errorBoundary");
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-4 text-[var(--muted-strong)]">{t("description")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-block underline"
      >
        {t("retry")}
      </button>
    </main>
  );
}
