"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const MANAGERS = ["npm", "pnpm", "yarn"] as const;
type Manager = (typeof MANAGERS)[number];

const CMD: Record<Manager, string> = {
  npm: "npm install @imgx-kit/core",
  pnpm: "pnpm add @imgx-kit/core",
  yarn: "yarn add @imgx-kit/core",
};

export function InstallBox() {
  const t = useTranslations("common");
  const [manager, setManager] = useState<Manager>("npm");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(CMD[manager]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto mt-10 flex w-full max-w-2xl items-stretch overflow-hidden rounded-2xl bg-[#0d0e11] text-sm shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]">
      {/* Manager selector */}
      <div className="relative flex items-center border-r border-white/10">
        <select
          value={manager}
          onChange={(e) => setManager(e.target.value as Manager)}
          className="h-full appearance-none bg-transparent py-4 pl-5 pr-8 font-medium text-white/80 focus:outline-none cursor-pointer"
          aria-label={t("a11y.packageManager")}
        >
          {MANAGERS.map((m) => (
            <option key={m} value={m} className="bg-[#0d0e11]">
              {m}
            </option>
          ))}
        </select>
        {/* chevron */}
        <svg
          aria-hidden
          className="pointer-events-none absolute right-2.5 text-white/40"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Command */}
      <code className="flex flex-1 items-center overflow-x-auto px-5 py-4 font-mono text-sm tracking-tight text-white/70 whitespace-nowrap select-all">
        {CMD[manager]}
      </code>

      {/* Copy button */}
      <button
        type="button"
        onClick={copy}
        aria-label={t("a11y.copyInstall")}
        className="flex items-center gap-2 bg-[#238636] px-5 py-4 font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#238636]"
      >
        {copied ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
            </svg>
            {t("copy.done")}
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden
            >
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
            </svg>
            {t("copy.idle")}
          </>
        )}
      </button>
    </div>
  );
}
