"use client";

import { useEffect, useState } from "react";
import { DocsBackToFarmButton } from "@/components/docs/DocsBackToFarmButton";
import { DOCS_NAV_GROUPS } from "@/lib/docsContent";

export function DocsSidebar() {
  const [activeId, setActiveId] = useState<string>("overview");

  useEffect(() => {
    const sectionIds = DOCS_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.id),
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Documentation sections"
      className="docs-sidebar flex max-h-[calc(100vh-8rem)] flex-col overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-sm sm:max-h-[calc(100vh-9rem)]"
    >
      <DocsBackToFarmButton className="mb-4 w-full justify-center" />

      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
        On this page
      </p>

      <div className="mt-3 space-y-5">
        {DOCS_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-farm-sun/80">
              {group.label}
            </p>
            <ul className="space-y-0.5 border-l border-white/10 pl-3">
              {group.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block rounded-md py-1 pl-2 pr-1 text-sm leading-snug transition ${
                        isActive
                          ? "bg-farm-sun/10 font-medium text-farm-sun"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
