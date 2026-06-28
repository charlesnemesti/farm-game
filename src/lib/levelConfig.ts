// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { SeedRarity } from "./seedConfig";

/** XP granted when a crop completes one harvest cycle. */
export const XP_PER_CYCLE: Record<SeedRarity, number> = {
  common: 12,
  rare: 30,
  epic: 60,
};

/** Base XP required to advance from level L to level L + 1. */
export const XP_PER_LEVEL_STEP = 140;

export function xpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  const steps = level - 1;
  return (XP_PER_LEVEL_STEP * steps * (steps + 1)) / 2;
}

export function getLevelFromTotalXp(totalXp: number): number {
  const safeXp = Math.max(0, totalXp);
  let level = 1;

  while (xpToReachLevel(level + 1) <= safeXp) {
    level += 1;
  }

  return level;
}

export type XpProgress = {
  level: number;
  totalXp: number;
  /** XP earned within the current level (resets each level-up). */
  currentXp: number;
  /** XP needed within the current level to reach the next level. */
  xpForNextLevel: number;
};

export function getXpProgress(totalXp: number): XpProgress {
  const safeXp = Math.max(0, totalXp);
  const level = getLevelFromTotalXp(safeXp);
  const levelStartXp = xpToReachLevel(level);
  const nextLevelXp = xpToReachLevel(level + 1);

  return {
    level,
    totalXp: safeXp,
    currentXp: safeXp - levelStartXp,
    xpForNextLevel: nextLevelXp - levelStartXp,
  };
}

export function formatXpProgress(progress: XpProgress): string {
  return `${progress.currentXp.toLocaleString("en-US")} / ${progress.xpForNextLevel.toLocaleString("en-US")} XP`;
}
