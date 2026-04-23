"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ParamsInput } from "./ParamsInput";
import { PresetList } from "./PresetList";
import { PreviewPane, type PreviewMeta } from "./PreviewPane";
import { ErrorMessage, type PlaygroundError } from "./ErrorMessage";

const SAMPLE_ID = "default";

export function PlaygroundClient() {
  const t = useTranslations("playground");
  const [params, setParams] = useState("resize,w_300");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<PreviewMeta | null>(null);
  const [error, setError] = useState<PlaygroundError | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  function buildAPIURL(p: string): string {
    return `/api/process?sample=${SAMPLE_ID}&params=${encodeURIComponent(`image/${p}`)}`;
  }

  async function run(nextParams: string = params) {
    const prevUrl = blobUrlRef.current;
    setStatus("loading");
    setError(null);
    setMeta(null);
    try {
      const res = await fetch(buildAPIURL(nextParams));
      if (!res.ok) {
        const json = await res.json().catch(() => ({
          error: { code: "INTERNAL_ERROR", message: res.statusText },
        }));
        setError(json.error);
        setStatus("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setBlobUrl(url);
      setMeta({
        inputBytes: Number(res.headers.get("x-imgx-input-bytes") ?? 0),
        outputBytes: Number(
          res.headers.get("x-imgx-output-bytes") ?? blob.size,
        ),
        durationMs: Number(res.headers.get("x-imgx-duration-ms") ?? 0),
      });
      setStatus("success");
      // Revoke previous blob only after new one is set
      if (prevUrl) URL.revokeObjectURL(prevUrl);
    } catch (err) {
      setError({ code: "INTERNAL_ERROR", message: (err as Error).message });
      setStatus("error");
    }
  }

  function applyPreset(p: string) {
    setParams(p);
    void run(p);
  }

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  useEffect(() => {
    void run(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      {/* Preview ----------------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-8">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {t("title")}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight leading-tight">
          {t("title")}
        </h1>

        <div className="mt-8">
          <PreviewPane
            blobUrl={blobUrl}
            meta={meta}
            loading={status === "loading"}
          />
          {error && <ErrorMessage error={error} />}
        </div>
      </section>

      {/* Controls ---------------------------------------------------------- */}
      <section className="mx-auto max-w-2xl px-6 pb-20 space-y-8 text-[17px]">
        <div>
          <ParamsInput
            value={params}
            onChange={setParams}
            onRun={() => void run()}
            loading={status === "loading"}
          />
        </div>
        <div>
          <PresetList onSelect={applyPreset} />
        </div>
      </section>
    </main>
  );
}
