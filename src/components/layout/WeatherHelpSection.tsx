"use client";

import { useEffect, useState } from "react";
import { WeatherWheel } from "@/components/layout/WeatherWheel";
import { WeatherCountdown } from "@/components/layout/WeatherCountdown";
import {
  dismissWeatherInfo,
  isWeatherInfoDismissed,
} from "@/lib/weatherInfoState";

// Weather wheel with dismissible help panel and persistent ? toggle.
export function WeatherHelpSection() {
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setExpanded(!isWeatherInfoDismissed());
    setReady(true);
  }, []);

  const handleDismiss = () => {
    dismissWeatherInfo();
    setExpanded(false);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-start gap-1.5">
        <div className="flex flex-col items-center gap-0.5">
          <WeatherWheel />
          <WeatherCountdown />
        </div>
        {ready && !expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4a3428]/35 bg-[#f5e6c8]/95 text-sm font-bold text-[#4a3428] shadow-md transition hover:bg-[#e8d4a8]"
            aria-label="Show weather help"
            title="Weather help"
          >
            ?
          </button>
        ) : (
          <div className="h-7 w-7 shrink-0" aria-hidden />
        )}
      </div>

      {ready && expanded ? (
        <div className="weather-info-tooltip pointer-events-auto w-[min(calc(100vw-1.5rem),15rem)] rounded-lg border border-[#4a3428]/25 bg-[#f5e6c8]/95 px-3 py-2.5 text-left text-[#4a3428] shadow-lg">
          <p className="text-[11px] font-bold leading-snug sm:text-xs">Weather system</p>
          <p className="mt-1.5 text-[10px] leading-snug text-[#4a3428]/90 sm:text-[11px]">
            Every 3 minutes the wheel spins and picks the next weather at random
            (50% sunny, 20% rain, 20% snow, 10% wind).
          </p>
          <ul className="mt-2 space-y-1 text-[10px] leading-snug text-[#4a3428]/90 sm:text-[11px]">
            <li>
              <span className="font-semibold">Sunny:</span> normal growth
            </li>
            <li>
              <span className="font-semibold">Rain:</span> +25% growth and $CORN
            </li>
            <li>
              <span className="font-semibold">Snow:</span> −25% growth speed
            </li>
            <li>
              <span className="font-semibold">Wind:</span> small chance to uproot
              a crop (seed returns to inventory)
            </li>
          </ul>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-2.5 w-full rounded-md border border-[#4a3428]/30 bg-[#e8d4a8] px-2 py-1 text-[10px] font-bold text-[#4a3428] transition hover:bg-[#dcc898] sm:text-[11px]"
          >
            Got it
          </button>
        </div>
      ) : null}
    </div>
  );
}
