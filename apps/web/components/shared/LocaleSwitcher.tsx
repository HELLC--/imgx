"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/lib/i18n";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale() as Locale;

  const switchTo = (next: Locale) => {
    if (next === current) return;
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  };

  const activeIndex = Math.max(0, locales.indexOf(current));
  const itemCount = locales.length;
  const indicatorWidthPct = 100 / itemCount;
  const indicatorOffsetPct = activeIndex * 100;

  return (
    <div
      role="group"
      aria-label={t("a11y.languageSwitcher")}
      className="relative inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] p-0.5"
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-out"
        style={{
          width: `calc(${indicatorWidthPct}% - 4px)`,
          left: "2px",
          transform: `translateX(${indicatorOffsetPct}%)`,
        }}
      />
      {locales.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            aria-pressed={active}
            className={`relative z-[1] px-3 py-1 text-xs rounded-full transition-colors ${active ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            {t(`localeSwitcher.short.${l}`)}
          </button>
        );
      })}
    </div>
  );
}
