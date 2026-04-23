"use client";

import { useTranslations } from "next-intl";
import { PRESETS } from "@/content/presets";

export function PresetList({
  onSelect,
}: {
  onSelect: (params: string) => void;
}) {
  const t = useTranslations("playground");
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
        {t("presetsTitle")}
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.i18nKey}
            onClick={() => onSelect(p.params)}
            className="px-3 py-1.5 text-xs font-mono rounded-full border border-border bg-surface text-(--muted-strong) hover:border-(--border-strong) hover:text-foreground transition-colors cursor-pointer"
            title={p.params}
          >
            {t(`presets.${p.i18nKey}` as `presets.${string}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
