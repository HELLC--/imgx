import Link from "next/link";
import { useTranslations } from "next-intl";
import type { DocNavGroup } from "@/lib/docs";

export function DocsSidebar({
  nav,
  locale,
  currentSlug,
}: {
  nav: DocNavGroup[];
  locale: string;
  currentSlug?: string;
}) {
  const t = useTranslations("docs.categories");
  return (
    <aside className="hidden md:block w-60 shrink-0">
      <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-4 text-sm">
        {nav.map((group) => (
          <div key={group.category} className="mb-7">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              {t(group.category as never)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.slug === currentSlug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/${locale}/docs/${item.slug}`}
                      className={`block rounded-md px-2.5 py-1.5 leading-snug transition-colors ${
                        active
                          ? "bg-(--surface-soft) text-foreground font-medium"
                          : "text-muted hover:bg-(--surface-soft) hover:text-foreground"
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
