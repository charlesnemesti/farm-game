// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Slot {x,y} values use MENU.png space (1133×1600) — same on every screen.

import { FARM_MENU } from "./uiConfig";

export const INVENTORY_COLS = 5;
export const INVENTORY_ROWS = 4;
export const INVENTORY_SLOT_COUNT = INVENTORY_COLS * INVENTORY_ROWS;

/** Hit area size in MENU.png pixels. */
export const INVENTORY_SLOT_SIZE = 110;

export type InventorySlot = {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
};

/** Bounding box reference for the inventory parchment area. */
export const INVENTORY_BOARD = {
  x: 220,
  y: 280,
  width: 690,
  height: 340,
};

/** Calibrated inventory slot anchors aligned to the menu overlay. */
export const INVENTORY_SLOTS: InventorySlot[] = [
  { id: 0, row: 0, col: 0, x: 299, y: 413 },
  { id: 1, row: 0, col: 1, x: 422, y: 413 },
  { id: 2, row: 0, col: 2, x: 545, y: 413 },
  { id: 3, row: 0, col: 3, x: 668, y: 413 },
  { id: 4, row: 0, col: 4, x: 791, y: 413 },
  { id: 5, row: 1, col: 0, x: 299, y: 538 },
  { id: 6, row: 1, col: 1, x: 422, y: 538 },
  { id: 7, row: 1, col: 2, x: 545, y: 538 },
  { id: 8, row: 1, col: 3, x: 668, y: 538 },
  { id: 9, row: 1, col: 4, x: 791, y: 538 },
  { id: 10, row: 2, col: 0, x: 299, y: 663 },
  { id: 11, row: 2, col: 1, x: 422, y: 663 },
  { id: 12, row: 2, col: 2, x: 545, y: 663 },
  { id: 13, row: 2, col: 3, x: 668, y: 663 },
  { id: 14, row: 2, col: 4, x: 791, y: 663 },
  { id: 15, row: 3, col: 0, x: 299, y: 788 },
  { id: 16, row: 3, col: 1, x: 422, y: 788 },
  { id: 17, row: 3, col: 2, x: 545, y: 788 },
  { id: 18, row: 3, col: 3, x: 668, y: 788 },
  { id: 19, row: 3, col: 4, x: 791, y: 788 },
];

export { FARM_MENU };
