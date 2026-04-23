import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('common.footer');
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold uppercase text-[var(--accent-fg)]"
          >
            ix
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">imgx</p>
            <p className="text-xs text-[var(--muted)]">{t('tagline')}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)]">{t('copyright', { year })}</p>
      </div>
    </footer>
  );
}
