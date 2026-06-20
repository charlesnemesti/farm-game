"use client";

import type { ReactNode } from "react";

type NpcPopupProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
};

// Compact popup anchored near an NPC — content can be filled in later.
export function NpcPopup({
  open,
  title,
  onClose,
  children,
  className,
}: NpcPopupProps) {
  if (!open) return null;

  return (
    <div
      className={`relative rounded-xl border border-white/15 bg-black/90 p-4 text-white shadow-2xl backdrop-blur-md ${className ?? "w-56"}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-farm-sun">{title}</h3>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/20 text-xs text-white/80 transition hover:bg-white/10"
        >
          ✕
        </button>
      </div>
      {children ?? (
        <p className="text-xs leading-relaxed text-white/50">
          Content coming soon.
        </p>
      )}
    </div>
  );
}
