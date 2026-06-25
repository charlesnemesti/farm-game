// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export type PlayMode = "demo" | "wallet";

import { STORAGE_PREFIX } from "./brandConfig";

export const PLAY_MODE_STORAGE_KEY = `${STORAGE_PREFIX}-play-mode-v1`;

/** Demo mode only allows the starter row (plot 0). */
export const DEMO_MAX_PLOT_ID = 0;

export function loadPlayMode(): PlayMode | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(PLAY_MODE_STORAGE_KEY);
  if (saved === "demo" || saved === "wallet") return saved;
  return null;
}

export function savePlayMode(mode: PlayMode) {
  localStorage.setItem(PLAY_MODE_STORAGE_KEY, mode);
}

export function clearPlayMode() {
  localStorage.removeItem(PLAY_MODE_STORAGE_KEY);
}

export function isDemoPlotLocked(plotId: number): boolean {
  return plotId > DEMO_MAX_PLOT_ID;
}
