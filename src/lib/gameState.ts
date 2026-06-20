// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { INVENTORY_SLOT_COUNT } from "./inventoryBoard";
import type { PlantedCrop } from "./cropState";
import type { SeedRarity } from "./seedConfig";

export type InventoryEntry = {
  itemId: string;
  quantity: number;
  rarity?: SeedRarity;
};

export type GameState = {
  corn: number;
  inventory: (InventoryEntry | null)[];
  plantedCrops: PlantedCrop[];
};

export const GAME_STATE_STORAGE_KEY = "solfarm-game-state-v3";
export const STARTING_CORN = 5000;

export function createEmptyInventory(): (InventoryEntry | null)[] {
  return Array.from({ length: INVENTORY_SLOT_COUNT }, () => null);
}

export function createInitialGameState(): GameState {
  return {
    corn: STARTING_CORN,
    inventory: createEmptyInventory(),
    plantedCrops: [],
  };
}

function isValidPlantedCrop(value: unknown): value is PlantedCrop {
  if (!value || typeof value !== "object") return false;
  const crop = value as PlantedCrop;
  return (
    typeof crop.plotId === "number" &&
    typeof crop.slotId === "number" &&
    typeof crop.cycleStartedAt === "number" &&
    (crop.rarity === "common" ||
      crop.rarity === "rare" ||
      crop.rarity === "epic")
  );
}

export function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== "object") return false;
  const state = data as GameState;
  if (typeof state.corn !== "number" || !Number.isFinite(state.corn)) return false;
  if (!Array.isArray(state.inventory) || state.inventory.length !== INVENTORY_SLOT_COUNT) {
    return false;
  }
  if (!Array.isArray(state.plantedCrops)) return false;
  if (!state.plantedCrops.every(isValidPlantedCrop)) return false;

  return state.inventory.every(
    (entry) =>
      entry === null ||
      (typeof entry === "object" &&
        typeof entry.itemId === "string" &&
        typeof entry.quantity === "number" &&
        entry.quantity > 0 &&
        (entry.rarity === undefined ||
          entry.rarity === "common" ||
          entry.rarity === "rare" ||
          entry.rarity === "epic")),
  );
}
