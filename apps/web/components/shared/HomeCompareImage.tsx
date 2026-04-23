"use client";

import { useState } from "react";

export function HomeCompareImage({
  src,
  alt,
  errorLabel,
  className,
}: {
  src: string;
  alt: string;
  errorLabel: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-xs text-[var(--muted)] ${className ?? ""}`}
      >
        {errorLabel}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] ${className ?? ""}`}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
