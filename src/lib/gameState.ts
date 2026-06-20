// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { INVENTORY_SLOT_COUNT } from "./inventoryBoard";
import type { PlantedCrop } from "./cropState";
import { applyHarvestProgress } from "./harvestProgress";
import {
  deriveUnlockedPlotIdsFromCrops,
  getStarterUnlockedPlotIds,
  normalizeUnlockedPlotIds,
} from "./plotUnlock";
import type { SeedRarity } from "./seedConfig";

export type InventoryEntry = {
  itemId: string;
  quantity: number;
  rarity?: SeedRarity;
};

export type GameState = {
  corn: number;
  xp: number;
  unlockedPlotIds: number[];
  inventory: (InventoryEntry | null)[];
  plantedCrops: PlantedCrop[];
};

export const GAME_STATE_STORAGE_KEY = "solfarm-game-state-v5";
export const LEGACY_GAME_STATE_STORAGE_KEY = "solfarm-game-state-v4";
export const LEGACY_GAME_STATE_STORAGE_KEY_V3 = "solfarm-game-state-v3";
export const STARTING_CORN = 5000;

export function createEmptyInventory(): (InventoryEntry | null)[] {
  return Array.from({ length: INVENTORY_SLOT_COUNT }, () => null);
}

export function createInitialGameState(): GameState {
  return {
    corn: STARTING_CORN,
    xp: 0,
    unlockedPlotIds: getStarterUnlockedPlotIds(),
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

function isValidUnlockedPlotIds(value: unknown): value is number[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (plotId) => typeof plotId === "number" && Number.isInteger(plotId) && plotId >= 0,
  );
}

function attachUnlockedPlotIds(
  state: Omit<GameState, "unlockedPlotIds"> & { unlockedPlotIds?: number[] },
): GameState {
  const unlockedPlotIds = state.unlockedPlotIds
    ? normalizeUnlockedPlotIds(state.unlockedPlotIds)
    : deriveUnlockedPlotIdsFromCrops(state.plantedCrops);

  return {
    ...state,
    unlockedPlotIds,
  };
}

export function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== "object") return false;
  const state = data as GameState;
  if (typeof state.corn !== "number" || !Number.isFinite(state.corn)) return false;
  if (typeof state.xp !== "number" || !Number.isFinite(state.xp) || state.xp < 0) {
    return false;
  }
  if (!isValidUnlockedPlotIds(state.unlockedPlotIds)) return false;
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

function isValidLegacyGameState(
  data: unknown,
): data is Omit<GameState, "unlockedPlotIds" | "xp"> & { xp?: number; unlockedPlotIds?: number[] } {
  if (!data || typeof data !== "object") return false;
  const state = data as Omit<GameState, "xp">;
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

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as unknown;
      if (isValidGameState(data)) return applyHarvestProgress(data).state;
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    }

    const legacyV4Raw = localStorage.getItem(LEGACY_GAME_STATE_STORAGE_KEY);
    if (legacyV4Raw) {
      const legacy = JSON.parse(legacyV4Raw) as unknown;
      if (isValidLegacyGameState(legacy)) {
        return applyHarvestProgress(
          attachUnlockedPlotIds({
            ...legacy,
            xp: legacy.xp ?? 0,
          }),
        ).state;
      }
      localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY);
    }

    const legacyV3Raw = localStorage.getItem(LEGACY_GAME_STATE_STORAGE_KEY_V3);
    if (legacyV3Raw) {
      const legacy = JSON.parse(legacyV3Raw) as unknown;
      if (isValidLegacyGameState(legacy)) {
        return applyHarvestProgress(
          attachUnlockedPlotIds({
            ...legacy,
            xp: 0,
          }),
        ).state;
      }
      localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY_V3);
    }
  } catch {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY_V3);
  }

  return null;
}

export function saveGameState(state: GameState, currentTime = Date.now()) {
  const { state: progressed } = applyHarvestProgress(state, currentTime);
  const normalized: GameState = {
    ...progressed,
    unlockedPlotIds: normalizeUnlockedPlotIds(progressed.unlockedPlotIds),
  };
  localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(normalized));
  localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY_V3);
  return normalized;
}

export function clearAllSavedGameState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GAME_STATE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_GAME_STATE_STORAGE_KEY_V3);
}
