// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export type SeedRarity = "common" | "rare" | "epic";

export type RolledSeed = {
  rarity: SeedRarity;
};

export const SEEDS_PER_PACK = 3;

export const RARITY_DROP_WEIGHTS: Record<SeedRarity, number> = {
  common: 85,
  rare: 10,
  epic: 5,
};

export const RARITY_LABELS: Record<SeedRarity, string> = {
  common: "Common Seed",
  rare: "Rare Seed",
  epic: "Epic Seed",
};

/** Human-readable drop rate lines for pack UI. */
export function getPackDropRateLines(): { rarity: SeedRarity; label: string; percent: number }[] {
  return (Object.keys(RARITY_DROP_WEIGHTS) as SeedRarity[]).map((rarity) => ({
    rarity,
    label: RARITY_LABELS[rarity],
    percent: RARITY_DROP_WEIGHTS[rarity],
  }));
}

export const RARITY_TEXT_CLASS: Record<SeedRarity, string> = {
  common: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
};

export const RARITY_GLOW_CLASS: Record<SeedRarity, string> = {
  common: "shadow-[0_0_18px_rgba(74,222,128,0.55)]",
  rare: "shadow-[0_0_18px_rgba(96,165,250,0.55)]",
  epic: "shadow-[0_0_18px_rgba(192,132,252,0.55)]",
};

export type SeedStats = {
  description: string;
  harvestCycleSeconds: number;
  cornPerCycle: number;
};

export const SEED_STATS: Record<SeedRarity, SeedStats> = {
  common: {
    description: "A reliable staple crop with steady harvest rewards.",
    harvestCycleSeconds: 150,
    cornPerCycle: 420,
  },
  rare: {
    description: "Grows faster and yields more $CORN each cycle.",
    harvestCycleSeconds: 110,
    cornPerCycle: 1_100,
  },
  epic: {
    description: "Premium corn with the shortest cycle and highest payout.",
    harvestCycleSeconds: 75,
    cornPerCycle: 2_100,
  },
};

export function formatHarvestCycle(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    if (remainder === 0) return `${minutes} min`;
    return `${minutes} min ${remainder} sec`;
  }
  return `${seconds} sec`;
}

export function rollSeedRarity(): SeedRarity {
  const roll = Math.random() * 100;
  if (roll < RARITY_DROP_WEIGHTS.common) return "common";
  if (roll < RARITY_DROP_WEIGHTS.common + RARITY_DROP_WEIGHTS.rare) return "rare";
  return "epic";
}

export function rollPackSeeds(count = SEEDS_PER_PACK): RolledSeed[] {
  return Array.from({ length: count }, () => ({ rarity: rollSeedRarity() }));
}

/** Need two empty slots besides the pack slot (pack frees one of three). */
export function canFitOpenedSeeds(
  inventory: ({ itemId: string } | null)[],
  packSlotIndex: number,
): boolean {
  const emptyCount = inventory.filter((entry) => entry === null).length;
  return emptyCount >= SEEDS_PER_PACK - 1 && inventory[packSlotIndex]?.itemId === "seed-pack";
}
