"use client";

import { useTranslations } from "next-intl";

export interface PreviewMeta {
  inputBytes: number;
  outputBytes: number;
  durationMs: number;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function PreviewPane({
  blobUrl,
  meta,
  loading,
}: {
  blobUrl: string | null;
  meta: PreviewMeta | null;
  loading: boolean;
}) {
  const t = useTranslations("playground");
  return (
    <div>
      <div className="relative w-full rounded-lg border border-border bg-surface overflow-hidden flex items-center justify-center min-h-70">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-(--background)/80 text-muted text-xs z-10 font-mono">
            {t("running")}
          </div>
        )}
        {blobUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobUrl}
            alt={t("afterLabel")}
            className="max-w-full max-h-120 object-contain p-4"
          />
        ) : (
          !loading && (
            <span className="text-xs text-muted font-mono">
              {t("afterLabel")}
            </span>
          )
        )}
      </div>
      {meta && (
        <div className="mt-3 flex gap-4 text-xs text-muted font-mono">
          <span>
            {t("metaInput")}: {formatBytes(meta.inputBytes)}
          </span>
          <span>→</span>
          <span>
            {t("metaOutput")}: {formatBytes(meta.outputBytes)}
          </span>
          <span>·</span>
          <span>
            {t("metaDuration")}: {meta.durationMs} ms
          </span>
        </div>
      )}
    </div>
  );
}
