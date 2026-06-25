// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const INVENTORY_MENU_STORAGE_KEY = "cornfarm-inventory-menu-v1";

export type MenuPositionRatio = {
  xRatio: number;
  yRatio: number;
};

export type InventoryMenuPersistedState = {
  open: boolean;
  positionRatio: MenuPositionRatio | null;
};

export function loadInventoryMenuState(): InventoryMenuPersistedState {
  if (typeof window === "undefined") {
    return { open: true, positionRatio: null };
  }

  try {
    const raw = localStorage.getItem(INVENTORY_MENU_STORAGE_KEY);
    if (!raw) return { open: true, positionRatio: null };

    const parsed = JSON.parse(raw) as Partial<InventoryMenuPersistedState>;
    const positionRatio =
      parsed.positionRatio &&
      typeof parsed.positionRatio.xRatio === "number" &&
      typeof parsed.positionRatio.yRatio === "number"
        ? {
            xRatio: clampRatio(parsed.positionRatio.xRatio),
            yRatio: clampRatio(parsed.positionRatio.yRatio),
          }
        : null;

    return {
      open: parsed.open !== false,
      positionRatio,
    };
  } catch {
    return { open: true, positionRatio: null };
  }
}

export function saveInventoryMenuState(state: InventoryMenuPersistedState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INVENTORY_MENU_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode errors.
  }
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
