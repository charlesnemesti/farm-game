"use client";

import {
  FARM_MENU,
  MENU_ARTWORK_INSET,
  MENU_ARTWORK_INSET_CLAMP_FACTOR,
  MENU_TITLE,
} from "@/lib/uiConfig";
import type { GameMenuLayout } from "@/lib/menuCoordinates";

type GameMenuPanelProps = {
  layout: GameMenuLayout;
  calibratorActive?: boolean;
};

// Pixel-art game menu shell — transparent PNG, ready for future UI content.
export function GameMenuPanel({
  layout,
  calibratorActive = false,
}: GameMenuPanelProps) {
  const { scale } = layout;
  const titleLeft = (MENU_TITLE.anchorX / FARM_MENU.width) * 100;
  const titleTop = (MENU_TITLE.anchorY / FARM_MENU.height) * 100;
  const titleWidth = (MENU_TITLE.displayWidth / FARM_MENU.width) * 100;
  const referenceScale = FARM_MENU.displayWidth / FARM_MENU.width;
  const offsetScale = scale / referenceScale;
  const ringInsetFactor = MENU_ARTWORK_INSET_CLAMP_FACTOR;
  const ringInset = {
    left: MENU_ARTWORK_INSET.left * scale * ringInsetFactor,
    top: MENU_ARTWORK_INSET.top * scale * ringInsetFactor,
    right: MENU_ARTWORK_INSET.right * scale * ringInsetFactor,
    bottom: MENU_ARTWORK_INSET.bottom * scale * ringInsetFactor,
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FARM_MENU.src}
        alt="Game menu"
        draggable={false}
        className="pointer-events-none h-full w-full object-contain pixel-art"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MENU_TITLE.src}
        alt="Corn Farm"
        draggable={false}
        className="pointer-events-none absolute z-10 h-auto -translate-x-1/2 -translate-y-1/2 object-contain pixel-art mix-blend-screen"
        style={{
          left: `calc(${titleLeft}% + ${MENU_TITLE.screenOffsetX * offsetScale}px)`,
          top: `calc(${titleTop}% + ${MENU_TITLE.screenOffsetY * offsetScale}px)`,
          width: `${titleWidth}%`,
        }}
      />

      {calibratorActive ? (
        <div
          className="pointer-events-none absolute ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent"
          style={{
            left: ringInset.left,
            top: ringInset.top,
            right: ringInset.right,
            bottom: ringInset.bottom,
          }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
