"use client";

import { useGame } from "@/context/GameProvider";

export function CornCounter() {
  const { corn, hydrated } = useGame();

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-farm-sun/40 bg-black/70 px-3 py-1.5 shadow-sm backdrop-blur-sm"
      aria-label="CORN balance"
    >
      <span className="text-base leading-none">🌽</span>
      <span className="text-sm font-bold tabular-nums text-farm-sun">
        {hydrated ? corn.toLocaleString("en-US") : "—"}
      </span>
      <span className="text-xs font-semibold text-farm-sun/80">$CORN</span>
    </div>
  );
}
