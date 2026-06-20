"use client";

import {
  FARM_MENU,
  getGameMenuDisplaySize,
  type ScreenPosition,
} from "@/lib/uiConfig";

type GameMenuPanelProps = {
  position: ScreenPosition;
  calibratorActive?: boolean;
};

// Pixel-art game menu shell — transparent PNG, ready for future UI content.
export function GameMenuPanel({
  position,
  calibratorActive = false,
}: GameMenuPanelProps) {
  const { width, height } = getGameMenuDisplaySize();

  return (
    <div
      className="pointer-events-none absolute z-[45]"
      style={{ left: position.x, top: position.y, width, height }}
    >
      <div
        className={`relative h-full w-full ${calibratorActive ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FARM_MENU.src}
          alt="Game menu"
          draggable={false}
          className="pointer-events-none h-full w-full object-contain pixel-art"
        />
      </div>
    </div>
  );
}
