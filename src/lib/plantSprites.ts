// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { SeedRarity } from "./seedConfig";

export type GrowthPhase = {
  /** Inclusive first frame of this phase (0-based). */
  startFrame: number;
  /** Inclusive last frame of this phase (0-based). */
  endFrame: number;
  /** Cycle progress (0–1) at which this phase ends. */
  progressEnd: number;
};

/** Corn growth phases mapped to the 20-frame horizontal spritesheet. */
export const CORN_GROWTH_PHASES: GrowthPhase[] = [
  { startFrame: 0, endFrame: 2, progressEnd: 0.15 }, // seeds
  { startFrame: 3, endFrame: 5, progressEnd: 0.3 }, // early sprout
  { startFrame: 6, endFrame: 9, progressEnd: 0.5 }, // young stalk
  { startFrame: 10, endFrame: 13, progressEnd: 0.7 }, // vegetative growth
  { startFrame: 14, endFrame: 15, progressEnd: 0.8 }, // budding
  { startFrame: 16, endFrame: 18, progressEnd: 0.95 }, // developing cob
  { startFrame: 19, endFrame: 19, progressEnd: 1 }, // mature / harvest-ready
];

export const CORN_SPRITE = {
  src: "/assets/plants/corn-growth.png",
  frameWidth: 16,
  frameHeight: 32,
  frameCount: 20,
  growthPhases: CORN_GROWTH_PHASES,
} as const;

export type CropKind = "corn";

export type PlantRarityTint = "blue" | "purple";

export function growthFrameForProgress(
  progress: number,
  phases: readonly GrowthPhase[],
): number {
  const clamped = Math.min(1, Math.max(0, progress));
  let previousEnd = 0;

  for (const phase of phases) {
    if (clamped > phase.progressEnd && phase !== phases[phases.length - 1]) {
      previousEnd = phase.progressEnd;
      continue;
    }

    const phaseSpan = phase.progressEnd - previousEnd;
    const phaseProgress =
      phaseSpan > 0 ? (clamped - previousEnd) / phaseSpan : 1;
    const frameCount = phase.endFrame - phase.startFrame + 1;
    const frameOffset = Math.min(
      frameCount - 1,
      Math.floor(phaseProgress * frameCount),
    );

    return phase.startFrame + frameOffset;
  }

  return phases[phases.length - 1].endFrame;
}

export function rarityTintForSeed(rarity: SeedRarity): PlantRarityTint | undefined {
  switch (rarity) {
    case "common":
      return undefined;
    case "rare":
      return "blue";
    case "epic":
      return "purple";
  }
}
