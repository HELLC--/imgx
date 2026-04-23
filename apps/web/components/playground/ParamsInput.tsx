"use client";

import { useTranslations } from "next-intl";

export function ParamsInput({
  value,
  onChange,
  onRun,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  loading: boolean;
}) {
  const t = useTranslations("playground");
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
        {t("paramsLabel")}
      </p>
      <div className="flex items-stretch rounded-lg border border-border focus-within:border-(--border-strong) bg-surface transition-colors">
        <span className="px-3 py-2 text-muted text-xs font-mono select-none border-r border-border bg-(--surface-soft) rounded-l-lg whitespace-nowrap">
          x-oss-process=image/
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("paramsPlaceholder")}
          rows={3}
          className="flex-1 p-2 font-mono text-sm bg-transparent focus:outline-none resize-none text-foreground placeholder:text-muted"
        />
      </div>
      <button
        onClick={onRun}
        disabled={loading}
        className="mt-3 px-4 py-2 rounded-lg bg-accent text-(--accent-fg) text-xs font-mono font-medium disabled:opacity-40 hover:opacity-85 transition-opacity cursor-pointer"
      >
        ▶ {loading ? t("running") : t("run")}
      </button>
    </div>
  );
}
