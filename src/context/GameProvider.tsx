"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { findPlantedCrop, type PlantedCrop } from "@/lib/cropState";
import {
  createInitialGameState,
  GAME_STATE_STORAGE_KEY,
  isValidGameState,
  type GameState,
  type InventoryEntry,
} from "@/lib/gameState";
import { CORN_SEED_ITEM } from "@/lib/itemConfig";
import { isPlotSlotUnlocked } from "@/lib/plotUnlock";
import {
  canFitOpenedSeeds,
  SEED_STATS,
  type RolledSeed,
  SEEDS_PER_PACK,
} from "@/lib/seedConfig";
import type { ShopItem } from "@/lib/shopConfig";

type BuyResult = "success" | "insufficient-corn" | "inventory-full";
type CommitSeedsResult = "success" | "inventory-full" | "invalid-pack";
type PlantResult = "success" | "no-seed-selected" | "slot-unavailable" | "invalid-seed";

type GameContextValue = {
  corn: number;
  inventory: (InventoryEntry | null)[];
  plantedCrops: PlantedCrop[];
  plantingSeedSlot: number | null;
  now: number;
  hydrated: boolean;
  buyItem: (item: ShopItem) => BuyResult;
  canOpenSeedPack: (slotIndex: number) => boolean;
  commitOpenedSeeds: (packSlotIndex: number, seeds: RolledSeed[]) => CommitSeedsResult;
  selectPlantingSeed: (inventorySlotIndex: number | null) => void;
  plantSelectedSeed: (plotId: number, slotId: number) => PlantResult;
  isSlotPlantable: (plotId: number, slotId: number) => boolean;
  getCropAt: (plotId: number, slotId: number) => PlantedCrop | undefined;
};

const GameContext = createContext<GameContextValue | null>(null);

function loadSavedState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!isValidGameState(data)) {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    return null;
  }
}

function persistState(state: GameState) {
  localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
}

function isPlantableSeed(entry: InventoryEntry | null): entry is InventoryEntry {
  return (
    entry !== null &&
    entry.itemId === CORN_SEED_ITEM.id &&
    entry.rarity !== undefined
  );
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialGameState());
  const [plantingSeedSlot, setPlantingSeedSlot] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSavedState();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timerId = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timerId);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    setState((prev) => {
      const currentTime = Date.now();
      let cornGain = 0;
      let changed = false;

      const nextCrops = prev.plantedCrops.map((crop) => {
        const cycleMs = SEED_STATS[crop.rarity].harvestCycleSeconds * 1000;
        const elapsed = currentTime - crop.cycleStartedAt;
        if (elapsed < cycleMs) return crop;

        const completedCycles = Math.floor(elapsed / cycleMs);
        cornGain += completedCycles * SEED_STATS[crop.rarity].cornPerCycle;
        changed = true;
        return {
          ...crop,
          cycleStartedAt: crop.cycleStartedAt + completedCycles * cycleMs,
        };
      });

      if (!changed) return prev;

      const next: GameState = {
        ...prev,
        corn: prev.corn + cornGain,
        plantedCrops: nextCrops,
      };
      persistState(next);
      return next;
    });
  }, [hydrated, now]);

  const buyItem = useCallback((item: ShopItem): BuyResult => {
    let result: BuyResult = "success";

    setState((prev) => {
      if (prev.corn < item.priceCorn) {
        result = "insufficient-corn";
        return prev;
      }

      const emptySlotIndex = prev.inventory.findIndex((entry) => entry === null);
      if (emptySlotIndex === -1) {
        result = "inventory-full";
        return prev;
      }

      const nextInventory = [...prev.inventory];
      nextInventory[emptySlotIndex] = { itemId: item.id, quantity: 1 };

      const next: GameState = {
        ...prev,
        corn: prev.corn - item.priceCorn,
        inventory: nextInventory,
      };
      persistState(next);
      return next;
    });

    return result;
  }, []);

  const canOpenSeedPack = useCallback(
    (slotIndex: number) => canFitOpenedSeeds(state.inventory, slotIndex),
    [state.inventory],
  );

  const commitOpenedSeeds = useCallback(
    (packSlotIndex: number, seeds: RolledSeed[]): CommitSeedsResult => {
      let result: CommitSeedsResult = "success";

      setState((prev) => {
        if (seeds.length !== SEEDS_PER_PACK) {
          result = "invalid-pack";
          return prev;
        }

        if (!canFitOpenedSeeds(prev.inventory, packSlotIndex)) {
          result = "inventory-full";
          return prev;
        }

        const emptySlots = prev.inventory
          .map((entry, index) => (entry === null ? index : -1))
          .filter((index) => index >= 0);

        const targetSlots = [
          packSlotIndex,
          ...emptySlots.filter((index) => index !== packSlotIndex),
        ].slice(0, SEEDS_PER_PACK);

        const nextInventory = [...prev.inventory];
        for (const slot of targetSlots) {
          nextInventory[slot] = null;
        }

        seeds.forEach((seed, index) => {
          nextInventory[targetSlots[index]] = {
            itemId: CORN_SEED_ITEM.id,
            quantity: 1,
            rarity: seed.rarity,
          };
        });

        const next: GameState = { ...prev, inventory: nextInventory };
        persistState(next);
        return next;
      });

      return result;
    },
    [],
  );

  const selectPlantingSeed = useCallback((inventorySlotIndex: number | null) => {
    setPlantingSeedSlot((current) =>
      inventorySlotIndex !== null && current === inventorySlotIndex
        ? null
        : inventorySlotIndex,
    );
  }, []);

  const isSlotPlantable = useCallback(
    (plotId: number, slotId: number) => {
      if (!isPlotSlotUnlocked(plotId)) return false;
      if (findPlantedCrop(state.plantedCrops, plotId, slotId)) return false;
      return true;
    },
    [state.plantedCrops],
  );

  const getCropAt = useCallback(
    (plotId: number, slotId: number) =>
      findPlantedCrop(state.plantedCrops, plotId, slotId),
    [state.plantedCrops],
  );

  const plantSelectedSeed = useCallback(
    (plotId: number, slotId: number): PlantResult => {
      let result: PlantResult = "success";

      setState((prev) => {
        if (plantingSeedSlot === null) {
          result = "no-seed-selected";
          return prev;
        }

        const seedEntry = prev.inventory[plantingSeedSlot];
        if (!isPlantableSeed(seedEntry)) {
          result = "invalid-seed";
          return prev;
        }

        if (!isPlotSlotUnlocked(plotId)) {
          result = "slot-unavailable";
          return prev;
        }

        if (findPlantedCrop(prev.plantedCrops, plotId, slotId)) {
          result = "slot-unavailable";
          return prev;
        }

        const nextInventory = [...prev.inventory];
        if (seedEntry.quantity > 1) {
          nextInventory[plantingSeedSlot] = {
            ...seedEntry,
            quantity: seedEntry.quantity - 1,
          };
        } else {
          nextInventory[plantingSeedSlot] = null;
        }

        const next: GameState = {
          ...prev,
          inventory: nextInventory,
          plantedCrops: [
            ...prev.plantedCrops,
            {
              plotId,
              slotId,
              rarity: seedEntry.rarity!,
              cycleStartedAt: Date.now(),
            },
          ],
        };
        persistState(next);
        return next;
      });

      if (result === "success") {
        setPlantingSeedSlot(null);
      }

      return result;
    },
    [plantingSeedSlot],
  );

  const value = useMemo(
    () => ({
      corn: state.corn,
      inventory: state.inventory,
      plantedCrops: state.plantedCrops,
      plantingSeedSlot,
      now,
      hydrated,
      buyItem,
      canOpenSeedPack,
      commitOpenedSeeds,
      selectPlantingSeed,
      plantSelectedSeed,
      isSlotPlantable,
      getCropAt,
    }),
    [
      buyItem,
      canOpenSeedPack,
      commitOpenedSeeds,
      getCropAt,
      hydrated,
      isSlotPlantable,
      now,
      plantSelectedSeed,
      plantingSeedSlot,
      selectPlantingSeed,
      state.corn,
      state.inventory,
      state.plantedCrops,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}
