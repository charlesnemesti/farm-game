"use client";

import { useGame } from "@/context/GameProvider";
import { CURRENCY_TICKER } from "@/lib/brandConfig";

export function CornCounter() {
  const { corn, hydrated } = useGame();

  return (
    <div
      className="flex w-full items-center justify-center gap-1.5 sm:gap-2"
      aria-label={`${CURRENCY_TICKER} balance`}
    >
      <span className="text-sm leading-none sm:text-base">🌽</span>
      <span className="text-xs font-bold tabular-nums text-[#4a3428] sm:text-sm">
        {hydrated ? corn.toLocaleString("en-US") : "—"}
      </span>
      <span className="text-[10px] font-bold text-[#8b6914] sm:text-xs">{CURRENCY_TICKER}</span>
    </div>
  );
}
