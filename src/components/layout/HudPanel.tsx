"use client";

import type { ReactNode } from "react";
import { HUD_PANEL } from "@/lib/hudConfig";

type HudPanelProps = {
  children: ReactNode;
  /** Optional fixed width; otherwise scales from displayHeight. */
  width?: number;
  /** Override rendered height (defaults to HUD_PANEL.displayHeight). */
  displayHeight?: number;
  /** Tighter insets for compact strips (e.g. music control). */
  compact?: boolean;
  className?: string;
};

// Wooden parchment HUD strip for corner UI clusters.
export function HudPanel({
  children,
  width,
  displayHeight = HUD_PANEL.displayHeight,
  compact = false,
  className = "",
}: HudPanelProps) {
  const height = displayHeight;
  const panelWidth =
    width ?? height * (HUD_PANEL.width / HUD_PANEL.height);
  const paddingTop = compact ? 0.12 : HUD_PANEL.paddingTop;
  const paddingBottom = compact ? 0.12 : HUD_PANEL.paddingBottom;
  const paddingLeft = compact ? 0.06 : HUD_PANEL.paddingLeft;
  const paddingRight = compact ? 0.06 : HUD_PANEL.paddingRight;

  return (
    <div
      className={`relative shrink-0 hud-panel ${className}`}
      style={{ width: panelWidth, height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HUD_PANEL.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full pixel-art object-fill"
        aria-hidden
      />

      <div
        className="relative z-10 box-border flex h-full items-center justify-center gap-1.5 sm:gap-2"
        style={{
          paddingTop: height * paddingTop,
          paddingBottom: height * paddingBottom,
          paddingLeft: panelWidth * paddingLeft,
          paddingRight: panelWidth * paddingRight,
        }}
      >
        {children}
      </div>
    </div>
  );
}
