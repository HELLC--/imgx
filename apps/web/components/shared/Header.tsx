"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface NavItem {
  href: string;
  label: string;
  matchPrefix: boolean;
}

export function Header() {
  const tNav = useTranslations("common.nav");
  const tA11y = useTranslations("common.a11y");
  const locale = useLocale();
  const pathname = usePathname();

  // Strip the `/locale` prefix to get the logical path.
  const logical = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const link = (path: string) => `/${locale}${path}`;

  const items: NavItem[] = [
    { href: "/docs", label: tNav("docs"), matchPrefix: true },
    { href: "/playground", label: tNav("playground"), matchPrefix: true },
  ];

  function isActive(item: NavItem): boolean {
    if (item.href === "/") return logical === "/";
    return item.matchPrefix
      ? logical.startsWith(item.href)
      : logical === item.href;
  }

  return (
    <header className="sticky top-3 z-30 w-full px-4 sm:px-6 lg:px-10">
      <nav
        aria-label={tA11y("mainNav")}
        className="mx-auto flex h-14 w-fit items-center gap-6 rounded-full border border-[var(--border)] bg-[color:var(--pill-bg)] px-5 shadow-[var(--shadow-nav)] backdrop-blur-xl sm:px-7"
      >
        <Link
          href={link("/")}
          className="flex items-center gap-2 font-semibold tracking-tight text-[var(--foreground)]"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold uppercase text-[var(--accent-fg)]"
          >
            ix
          </span>
          <span className="text-base">imgx</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={link(item.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "font-semibold text-black"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 sm:border-l sm:border-[var(--border-strong)] sm:pl-4">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)] sm:inline"
          >
            {tNav("github")}
          </a>
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
