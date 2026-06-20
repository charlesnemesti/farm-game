"use client";

import { useEffect } from "react";
import { PLANT_SPRITE_SIZE } from "@/lib/plotBoard";

const FLOAT_DURATION_MS = 1600;

type HarvestFloatPopupProps = {
  /** X offset inside the crop slot container (px). */
  x: number;
  /** Y offset inside the crop slot container (px). */
  y: number;
  scale: number;
  cornAmount: number;
  onDone: () => void;
};

export function HarvestFloatPopup({
  x,
  y,
  scale,
  cornAmount,
  onDone,
}: HarvestFloatPopupProps) {
  const fontSize = Math.max(10, 8 * scale);

  useEffect(() => {
    const timerId = window.setTimeout(onDone, FLOAT_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none absolute z-40"
      style={{
        left: x,
        top: y - PLANT_SPRITE_SIZE.height * scale - 8,
        transform: "translateX(-50%)",
      }}
      aria-hidden
    >
      <p
        className="harvest-float whitespace-nowrap font-bold text-farm-sun drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
        style={{ fontSize }}
      >
        +{cornAmount.toLocaleString("en-US")} $CORN
      </p>
    </div>
  );
}
