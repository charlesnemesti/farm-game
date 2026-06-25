"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWeather } from "@/context/WeatherProvider";
import {
  WEATHER_NEEDLE_DEG,
  WEATHER_SPIN_DURATION_MS,
  WEATHER_SPIN_SCALE,
  WEATHER_SPIN_SCALE_DOWN_MS,
  WEATHER_SPIN_SCALE_UP_MS,
  WEATHER_WHEEL,
  computeSpinNeedleDelta,
  easeOutCubic,
} from "@/lib/weatherConfig";

type WheelArtProps = {
  size: number;
  needleDeg: number;
  label: string;
};

function WheelArt({ size, needleDeg, label }: WheelArtProps) {
  return (
    <div
      className="pointer-events-none relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={WEATHER_WHEEL.src}
        alt=""
        draggable={false}
        className="h-full w-full object-contain pixel-art drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        aria-hidden
      />

      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `rotate(${needleDeg}deg)`,
          transformOrigin: "50% 50%",
        }}
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-1/2 flex flex-col items-center"
          style={{ height: "18%", transform: "translate(-50%, -100%)" }}
        >
          <div className="h-0 w-0 shrink-0 border-x-[8px] border-x-transparent border-b-[9px] border-b-[#dc2626]" />
          <div className="w-[5%] min-h-0 flex-1 rounded-[1px] bg-[#dc2626] shadow-[0_0_0_0.5px_#7f1d1d]" />
        </div>
      </div>
    </div>
  );
}

// Static weather wheel with a center needle; spins and scales up on weather change.
export function WeatherWheel() {
  const { weather, spinSession, hydrated } = useWeather();
  const size = WEATHER_WHEEL.displaySize;
  const [mounted, setMounted] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [overlayScale, setOverlayScale] = useState(1);
  const [spinNeedleDeg, setSpinNeedleDeg] = useState(0);

  const activeWeather = hydrated ? weather : "sunny";
  const settledNeedleDeg = WEATHER_NEEDLE_DEG[activeWeather];
  const inlineNeedleDeg = spinSession
    ? WEATHER_NEEDLE_DEG[spinSession.from]
    : settledNeedleDeg;
  const inlineLabel = spinSession
    ? "Weather: spinning…"
    : `Weather: ${activeWeather}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!spinSession) {
      setOverlayActive(false);
      setOverlayScale(1);
      return;
    }

    const fromDeg = WEATHER_NEEDLE_DEG[spinSession.from];
    const toDeg = WEATHER_NEEDLE_DEG[spinSession.to];
    const totalNeedleDelta = computeSpinNeedleDelta(
      spinSession.from,
      spinSession.to,
    );
    const scaleUpMs = WEATHER_SPIN_SCALE_UP_MS;
    const spinMs = WEATHER_SPIN_DURATION_MS;
    const scaleDownMs = WEATHER_SPIN_SCALE_DOWN_MS;
    const totalMs = scaleUpMs + spinMs + scaleDownMs;

    setOverlayActive(true);
    setSpinNeedleDeg(fromDeg);

    const start = performance.now();
    let rafId = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;

      let scale = 1;
      if (elapsed < scaleUpMs) {
        scale = 1 + (WEATHER_SPIN_SCALE - 1) * easeOutCubic(elapsed / scaleUpMs);
      } else if (elapsed < scaleUpMs + spinMs) {
        scale = WEATHER_SPIN_SCALE;
      } else {
        const downProgress = Math.min(
          (elapsed - scaleUpMs - spinMs) / scaleDownMs,
          1,
        );
        scale =
          WEATHER_SPIN_SCALE -
          (WEATHER_SPIN_SCALE - 1) * easeOutCubic(downProgress);
      }

      let needleProgress = 0;
      if (elapsed > scaleUpMs) {
        needleProgress = easeOutCubic(
          Math.min((elapsed - scaleUpMs) / spinMs, 1),
        );
      }

      setOverlayScale(scale);
      setSpinNeedleDeg(fromDeg + totalNeedleDelta * needleProgress);

      if (elapsed < totalMs) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      setSpinNeedleDeg(toDeg);
      setOverlayScale(1);
      setOverlayActive(false);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      setOverlayActive(false);
      setOverlayScale(1);
    };
  }, [spinSession]);

  if (!hydrated) {
    return (
      <div
        className="pointer-events-none relative shrink-0 opacity-0"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <>
      <WheelArt size={size} needleDeg={inlineNeedleDeg} label={inlineLabel} />

      {mounted && overlayActive && spinSession
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-[1px]"
              aria-live="polite"
              aria-label="Weather roulette spinning"
            >
              <div
                className="will-change-transform"
                style={{
                  transform: `scale(${overlayScale})`,
                }}
              >
                <WheelArt
                  size={size}
                  needleDeg={spinNeedleDeg}
                  label="Weather: spinning…"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
