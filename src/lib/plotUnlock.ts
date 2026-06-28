// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { PlantedCrop } from "./cropState";
import { DEMO_MAX_PLOT_ID } from "./playMode";
import { PLOT_COUNT } from "./plotBoard";

export const STARTER_PLOT_ID = 0;

export type PlotRowUnlockConfig = {
  plotId: number;
  minLevel: number;
  cornCost: number;
};

/** Row 1 (plotId 0) is free; rows 2–5 unlock in order with level + $CORN. */
export const PLOT_ROW_UNLOCKS: PlotRowUnlockConfig[] = [
  { plotId: 1, minLevel: 5, cornCost: 90_000 },
  { plotId: 2, minLevel: 10, cornCost: 215_000 },
  { plotId: 3, minLevel: 15, cornCost: 390_000 },
  { plotId: 4, minLevel: 20, cornCost: 600_000 },
];

export type UnlockPlotFailureReason =
  | "already-unlocked"
  | "invalid-plot"
  | "previous-row-locked"
  | "level-too-low"
  | "insufficient-corn"
  | "demo-locked";

export type UnlockPlotResult = "success" | UnlockPlotFailureReason;

export function getStarterUnlockedPlotIds(): number[] {
  return [STARTER_PLOT_ID];
}

export function getPlotUnlockConfig(plotId: number): PlotRowUnlockConfig | undefined {
  return PLOT_ROW_UNLOCKS.find((row) => row.plotId === plotId);
}

export function isPlotRowUnlocked(
  plotId: number,
  unlockedPlotIds: readonly number[],
): boolean {
  return unlockedPlotIds.includes(plotId);
}

export function normalizeUnlockedPlotIds(plotIds: number[]): number[] {
  const unique = [...new Set(plotIds.filter((id) => id >= 0 && id < PLOT_COUNT))];
  unique.sort((a, b) => a - b);
  if (!unique.includes(STARTER_PLOT_ID)) {
    unique.unshift(STARTER_PLOT_ID);
  }
  return unique;
}

export function clampUnlockedPlotsForDemo(
  unlockedPlotIds: number[],
  demoMode: boolean,
): number[] {
  if (!demoMode) return normalizeUnlockedPlotIds(unlockedPlotIds);
  return normalizeUnlockedPlotIds(
    unlockedPlotIds.filter((id) => id <= DEMO_MAX_PLOT_ID),
  );
}

/** Keeps starter row plus any row that already has crops when migrating old saves. */
export function deriveUnlockedPlotIdsFromCrops(plantedCrops: PlantedCrop[]): number[] {
  const ids = new Set(getStarterUnlockedPlotIds());
  for (const crop of plantedCrops) {
    ids.add(crop.plotId);
  }
  return normalizeUnlockedPlotIds([...ids]);
}

export function canPurchasePlotRow(
  plotId: number,
  unlockedPlotIds: readonly number[],
  playerLevel: number,
  corn: number,
  demoMode = false,
): { ok: true } | { ok: false; reason: UnlockPlotFailureReason } {
  if (demoMode && plotId > DEMO_MAX_PLOT_ID) {
    return { ok: false, reason: "demo-locked" };
  }

  if (plotId <= STARTER_PLOT_ID || plotId >= PLOT_COUNT) {
    return { ok: false, reason: "invalid-plot" };
  }

  if (isPlotRowUnlocked(plotId, unlockedPlotIds)) {
    return { ok: false, reason: "already-unlocked" };
  }

  const config = getPlotUnlockConfig(plotId);
  if (!config) {
    return { ok: false, reason: "invalid-plot" };
  }

  if (!isPlotRowUnlocked(plotId - 1, unlockedPlotIds)) {
    return { ok: false, reason: "previous-row-locked" };
  }

  if (playerLevel < config.minLevel) {
    return { ok: false, reason: "level-too-low" };
  }

  if (corn < config.cornCost) {
    return { ok: false, reason: "insufficient-corn" };
  }

  return { ok: true };
}

export function getUnlockBlockMessage(
  reason: UnlockPlotFailureReason,
  plotId: number,
  config?: PlotRowUnlockConfig,
): string {
  switch (reason) {
    case "already-unlocked":
      return "This row is already unlocked.";
    case "invalid-plot":
      return "This row cannot be unlocked.";
    case "previous-row-locked":
      return `Unlock row ${plotId} before row ${plotId + 1}.`;
    case "level-too-low":
      return `Reach level ${config?.minLevel ?? "?"} to unlock this row.`;
    case "insufficient-corn":
      return `You need ${config?.cornCost.toLocaleString("en-US") ?? "?"} $CORN.`;
    case "demo-locked":
      return "Connect your wallet to unlock more rows. Demo is limited to row 1.";
    default:
      return "This row cannot be unlocked yet.";
  }
}
