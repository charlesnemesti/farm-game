// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { INVENTORY_SLOT_COUNT } from "./inventoryBoard";
import type { PlantedCrop } from "./cropState";
import { applyHarvestProgress } from "./harvestProgress";
import { PLOT_COUNT } from "./plotBoard";
import {
  getStarterUnlockedPlotIds,
  normalizeUnlockedPlotIds,
} from "./plotUnlock";
import { STORAGE_PREFIX } from "./brandConfig";
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
  /** Timestamp of last harvest progress tick — used for offline cap. */
  lastProgressAt?: number;
};

export const GAME_STATE_STORAGE_KEY = `${STORAGE_PREFIX}-game-state-v1`;
export const STARTING_CORN = 430_000;
export const WALLET_STARTING_CORN = 0;

export function createEmptyInventory(): (InventoryEntry | null)[] {
  return Array.from({ length: INVENTORY_SLOT_COUNT }, () => null);
}

export function createInitialGameState(): GameState {
  return createGameStateWithCorn(STARTING_CORN);
}

export function createWalletInitialGameState(): GameState {
  return createGameStateWithCorn(WALLET_STARTING_CORN);
}

function createGameStateWithCorn(corn: number): GameState {
  const now = Date.now();
  return {
    corn,
    xp: 0,
    unlockedPlotIds: getStarterUnlockedPlotIds(),
    inventory: createEmptyInventory(),
    plantedCrops: [],
    lastProgressAt: now,
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

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as unknown;
    if (isValidGameState(data)) return applyHarvestProgress(data).state;

    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
  } catch {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
  }

  return null;
}

export function saveGameState(state: GameState, currentTime = Date.now()) {
  const { state: progressed } = applyHarvestProgress(state, currentTime);
  const normalized: GameState = {
    ...progressed,
    unlockedPlotIds: normalizeUnlockedPlotIds(progressed.unlockedPlotIds),
    plantedCrops: progressed.plantedCrops.filter((crop) => crop.plotId < PLOT_COUNT),
    lastProgressAt: currentTime,
  };
  localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearAllSavedGameState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GAME_STATE_STORAGE_KEY);
}
