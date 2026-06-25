"use client";

import { useWeather } from "@/context/WeatherProvider";
import { formatWeatherCountdown } from "@/lib/weatherConfig";

// Compact countdown until the next weather roulette spin.
export function WeatherCountdown() {
  const { msUntilChange, isSpinning, hydrated } = useWeather();

  if (!hydrated) {
    return (
      <p
        className="pointer-events-none -mt-0.5 text-center text-[10px] font-bold tabular-nums leading-none text-[#4a3428]/85 opacity-0 sm:text-[11px]"
        aria-hidden
      >
        0:00
      </p>
    );
  }

  const label = isSpinning ? "Rolling…" : formatWeatherCountdown(msUntilChange);

  return (
    <p
      className="pointer-events-none -mt-0.5 text-center text-[10px] font-bold tabular-nums leading-none text-[#4a3428]/85 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)] sm:text-[11px]"
      aria-live="polite"
      title={isSpinning ? "Weather roulette spinning" : "Time until next weather change"}
    >
      {label}
    </p>
  );
}
