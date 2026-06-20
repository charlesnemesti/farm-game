// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Crops keep growing while the tab is closed — rewards are applied from timestamps on load.

import type { GameState } from "./gameState";
import { XP_PER_CYCLE } from "./levelConfig";
import { SEED_STATS } from "./seedConfig";

export type HarvestReward = {
  plotId: number;
  slotId: number;
  cornAmount: number;
  /** Timestamp when the last completed cycle finished. */
  completedAt: number;
};

export type HarvestProgressResult = {
  state: GameState;
  rewards: HarvestReward[];
};

/** Apply all harvest cycles completed before currentTime (works offline / in background). */
export function applyHarvestProgress(
  state: GameState,
  currentTime = Date.now(),
): HarvestProgressResult {
  let cornGain = 0;
  let xpGain = 0;
  let changed = false;
  const rewards: HarvestReward[] = [];

  const nextCrops = state.plantedCrops.map((crop) => {
    const cycleMs = SEED_STATS[crop.rarity].harvestCycleSeconds * 1000;
    const elapsed = currentTime - crop.cycleStartedAt;
    if (elapsed < cycleMs) return crop;

    const completedCycles = Math.floor(elapsed / cycleMs);
    const cornPerCycle = SEED_STATS[crop.rarity].cornPerCycle;
    cornGain += completedCycles * cornPerCycle;
    xpGain += completedCycles * XP_PER_CYCLE[crop.rarity];
    changed = true;

    for (let cycle = 1; cycle <= completedCycles; cycle++) {
      rewards.push({
        plotId: crop.plotId,
        slotId: crop.slotId,
        cornAmount: cornPerCycle,
        completedAt: crop.cycleStartedAt + cycle * cycleMs,
      });
    }

    return {
      ...crop,
      cycleStartedAt: crop.cycleStartedAt + completedCycles * cycleMs,
    };
  });

  if (!changed) return { state, rewards: [] };

  return {
    state: {
      ...state,
      corn: state.corn + cornGain,
      xp: state.xp + xpGain,
      plantedCrops: nextCrops,
    },
    rewards,
  };
}

/** Only show floating harvest popups for cycles that finish while the player is watching. */
export function filterLiveHarvestRewards(
  rewards: HarvestReward[],
  currentTime: number,
  maxAgeMs = 1500,
): HarvestReward[] {
  return rewards.filter(
    (reward) => currentTime - reward.completedAt <= maxAgeMs,
  );
}
