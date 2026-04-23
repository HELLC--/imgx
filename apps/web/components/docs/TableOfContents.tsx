"use client";

import { useEffect, useState } from "react";
import type { DocHeading } from "@/lib/docs";

interface Props {
  headings: DocHeading[];
  label: string;
}

export function TableOfContents({ headings, label }: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.slug ?? null,
  );

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pl-6 text-sm">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <ul className="space-y-2">
          {headings.map((h) => {
            const active = h.slug === activeId;
            return (
              <li
                key={h.slug}
                style={{ paddingLeft: h.depth === 3 ? "0.85rem" : "0" }}
              >
                <a
                  href={`#${h.slug}`}
                  className={`block leading-snug transition-colors ${
                    active
                      ? "text-foreground font-medium"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
