'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export interface PlaygroundError {
  code: string;
  message: string;
  detail?: string;
}

export function ErrorMessage({ error }: { error: PlaygroundError }) {
  const t = useTranslations('playground');
  const te = useTranslations('errors');
  const [open, setOpen] = useState(false);
  let label: string = error.code;
  try {
    label = te(error.code as never);
  } catch {
    /* fall through */
  }
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 text-sm">
      <p className="font-medium text-red-800">
        {t('errorTitle')}: {label}
      </p>
      <p className="mt-1 text-red-700">{error.message}</p>
      {error.detail && (
        <>
          <button onClick={() => setOpen((o) => !o)} className="mt-2 text-xs underline text-red-600">
            {t('errorDetailToggle')}
          </button>
          {open && <pre className="mt-2 text-xs whitespace-pre-wrap text-red-700">{error.detail}</pre>}
        </>
      )}
    </div>
  );
}
