// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { SeedRarity } from "./seedConfig";

export const CORN_SPRITE = {
  src: "/assets/plants/corn-shake.png",
  frameWidth: 16,
  frameHeight: 32,
  frameCount: 8,
  /** Milliseconds per animation frame. */
  frameDurationMs: 90,
} as const;

export type CropKind = "corn";

export type PlantRarityTint = "blue" | "purple";

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
