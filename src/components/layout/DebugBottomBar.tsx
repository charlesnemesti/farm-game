"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useGame } from "@/context/GameProvider";
import { useDebugUi } from "@/context/DebugUiProvider";
import { useWeather } from "@/context/WeatherProvider";

const DEBUG_CORN_AMOUNT = 5_000;
const DEBUG_XP_AMOUNT = 500;

function CalibrateToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  const toggleCalibrator = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (debug) {
      params.delete("debug");
    } else {
      params.set("debug", "1");
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  return (
    <button
      type="button"
      onClick={toggleCalibrator}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        debug
          ? "border-lime-400/50 bg-lime-500/20 text-lime-100 hover:bg-lime-500/30"
          : "border-white/20 bg-black/70 text-white hover:bg-black/85"
      }`}
    >
      {debug ? "Exit calibrator" : "Calibrate spots"}
    </button>
  );
}

function DevDebugTools() {
  const searchParams = useSearchParams();
  const shouldReset = searchParams.get("reset") === "1";
  const { hydrated, resetSavedGame, addDebugCorn, addDebugXp } = useGame();
  const { triggerWeatherSpin, weather, isSpinning } = useWeather();
  const { calibratorOpen, openCalibrator } = useDebugUi();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldReset || !hydrated) return;
    resetSavedGame();
    setMessage("Save reset to a fresh game.");
    const url = new URL(window.location.href);
    url.searchParams.delete("reset");
    window.history.replaceState({}, "", url.toString());
  }, [hydrated, resetSavedGame, shouldReset]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2000);
  };

  return (
    <>
      {!calibratorOpen ? (
        <button
          type="button"
          onClick={openCalibrator}
          className="rounded-lg border border-white/20 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/85"
        >
          Open calibrator
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (triggerWeatherSpin()) {
            flash("Weather spin started.");
          } else {
            flash(isSpinning ? "Spin already in progress." : "Weather not ready.");
          }
        }}
        disabled={isSpinning}
        className="rounded-lg border border-cyan-400/40 bg-black/70 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-900/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Spin weather ({weather})
      </button>

      <button
        type="button"
        onClick={() => {
          resetSavedGame();
          flash("Save reset.");
        }}
        className="rounded-lg border border-red-500/40 bg-red-950/80 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-900/90"
      >
        Reset save
      </button>
      <button
        type="button"
        onClick={() => {
          addDebugCorn(DEBUG_CORN_AMOUNT);
          flash(`+${DEBUG_CORN_AMOUNT.toLocaleString("en-US")} $CORN`);
        }}
        className="rounded-lg border border-farm-sun/40 bg-black/70 px-3 py-1.5 text-xs font-semibold text-farm-sun transition hover:bg-farm-sun/15"
      >
        +{DEBUG_CORN_AMOUNT.toLocaleString("en-US")} $CORN
      </button>
      <button
        type="button"
        onClick={() => {
          addDebugXp(DEBUG_XP_AMOUNT);
          flash(`+${DEBUG_XP_AMOUNT.toLocaleString("en-US")} XP`);
        }}
        className="rounded-lg border border-blue-400/40 bg-black/70 px-3 py-1.5 text-xs font-semibold text-blue-200 transition hover:bg-blue-900/70"
      >
        +{DEBUG_XP_AMOUNT.toLocaleString("en-US")} XP
      </button>

      {message ? (
        <span className="rounded-lg border border-white/15 bg-black/80 px-2 py-1 text-[10px] text-white/80">
          {message}
        </span>
      ) : null}
    </>
  );
}

function DebugBottomBarContent() {
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[120] flex flex-wrap items-center justify-center gap-2 px-3">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
        <Suspense fallback={null}>
          <CalibrateToggle />
        </Suspense>
        {debug ? (
          <Suspense fallback={null}>
            <DevDebugTools />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}

export function DebugBottomBar() {
  return (
    <Suspense fallback={null}>
      <DebugBottomBarContent />
    </Suspense>
  );
}
