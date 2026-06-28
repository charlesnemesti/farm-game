"use client";

import { useState } from "react";
import { useGame } from "@/context/GameProvider";
import { usePlayMode } from "@/context/PlayModeProvider";
import { useWeather } from "@/context/WeatherProvider";
import { LeaderboardPanel } from "@/components/game/LeaderboardPanel";
import {
  calculateCornPerHour,
  formatCornPerHour,
} from "@/lib/cropState";
import { formatXpProgress, getXpProgress } from "@/lib/levelConfig";
import { menuToScreen, type GameMenuLayout } from "@/lib/menuCoordinates";
import { getWeatherProductionLabel } from "@/lib/weatherEffects";
import { STATS_TEXT_ANCHOR } from "@/lib/uiConfig";

type MenuStatsPanelProps = {
  menuLayout: GameMenuLayout;
};

// Production, level, XP, and weekly leaderboard entry in the menu Stats section.
export function MenuStatsPanel({ menuLayout }: MenuStatsPanelProps) {
  const { plantedCrops, xp, hydrated } = useGame();
  const { playMode, signOut, switchPlayMode } = usePlayMode();
  const { weather } = useWeather();
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { position: menuPosition, scale } = menuLayout;
  const anchor = menuToScreen(
    STATS_TEXT_ANCHOR.x,
    STATS_TEXT_ANCHOR.y,
    menuPosition,
    scale,
  );
  const fontSize = Math.max(12, 36 * scale);
  const lineGap = STATS_TEXT_ANCHOR.lineGap * scale;
  const cornPerHour = calculateCornPerHour(plantedCrops, weather);
  const xpProgress = getXpProgress(xp);
  const weatherLabel = getWeatherProductionLabel(weather);

  const productionLabel = hydrated
    ? weatherLabel
      ? `Production: ${formatCornPerHour(cornPerHour)} (${weatherLabel})`
      : `Production: ${formatCornPerHour(cornPerHour)}`
    : "Production: — $CORN/h";
  const levelLabel = hydrated ? `lv : ${xpProgress.level}` : "lv : —";
  const xpLabel = hydrated ? formatXpProgress(xpProgress) : "— / — XP";

  return (
    <>
      <div
        className="pointer-events-none absolute z-[46] flex w-[70%] -translate-x-1/2 flex-col items-center text-center font-semibold tracking-wide text-[#4a3428]"
        style={{
          left: anchor.x,
          top: anchor.y + STATS_TEXT_ANCHOR.screenOffsetY * scale,
          fontSize,
          gap: lineGap,
        }}
        aria-label="Farm stats"
      >
        <p>{productionLabel}</p>
        <p>{levelLabel}</p>
        <p>{xpLabel}</p>
        <button
          type="button"
          onClick={() => setLeaderboardOpen(true)}
          className="pointer-events-auto mt-1 rounded-md border border-[#4a3428]/25 bg-[#f5e6c8]/80 px-2 py-0.5 text-[0.85em] font-bold text-[#4a3428] transition hover:bg-[#f5e6c8]"
        >
          {playMode === "wallet" ? "Weekly rank" : "Leaderboard"}
        </button>
        <div className="pointer-events-auto mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={switchPlayMode}
            className="rounded-md border border-[#4a3428]/25 bg-[#f5e6c8]/80 px-2 py-0.5 text-[0.78em] font-bold text-[#4a3428] transition hover:bg-[#f5e6c8]"
          >
            Switch mode
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-[#4a3428]/25 bg-[#f5e6c8]/80 px-2 py-0.5 text-[0.78em] font-bold text-[#4a3428] transition hover:bg-[#f5e6c8]"
          >
            Sign out
          </button>
        </div>
      </div>

      <LeaderboardPanel open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </>
  );
}
