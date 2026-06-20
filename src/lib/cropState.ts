// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { SeedRarity } from "./seedConfig";
import { SEED_STATS } from "./seedConfig";

export type PlantedCrop = {
  plotId: number;
  slotId: number;
  rarity: SeedRarity;
  cycleStartedAt: number;
};

export function cropKey(plotId: number, slotId: number): string {
  return `${plotId}-${slotId}`;
}

export function findPlantedCrop(
  plantedCrops: PlantedCrop[],
  plotId: number,
  slotId: number,
): PlantedCrop | undefined {
  return plantedCrops.find(
    (crop) => crop.plotId === plotId && crop.slotId === slotId,
  );
}

export function getCycleProgress(
  crop: PlantedCrop,
  now = Date.now(),
): { remainingMs: number; progress: number } {
  const cycleMs = SEED_STATS[crop.rarity].harvestCycleSeconds * 1000;
  const elapsed = now - crop.cycleStartedAt;
  const remainder = ((elapsed % cycleMs) + cycleMs) % cycleMs;
  const remainingMs = cycleMs - remainder;
  const progress = remainder / cycleMs;
  return { remainingMs, progress };
}

export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}s`;
}
