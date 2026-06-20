// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { PLOT_COUNT } from "./plotBoard";

/** Number of furrow rows unlocked at game start (0-indexed plotId < this value). */
export const INITIAL_UNLOCKED_PLOT_ROWS = PLOT_COUNT;

export function isPlotSlotUnlocked(plotId: number): boolean {
  return plotId >= 0 && plotId < INITIAL_UNLOCKED_PLOT_ROWS;
}
