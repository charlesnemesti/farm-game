"use client";

import {
  INVENTORY_SLOT_SIZE,
  INVENTORY_SLOTS,
  type InventorySlot,
} from "@/lib/inventoryBoard";
import { getMenuScale, menuToScreen } from "@/lib/menuCoordinates";
import type { ScreenPosition } from "@/lib/uiConfig";

type InventorySlotBoardProps = {
  menuPosition: ScreenPosition;
  slots?: InventorySlot[];
  occupiedSlotIds?: number[];
};

// Invisible inventory hitboxes aligned to the menu overlay.
export function InventorySlotBoard({
  menuPosition,
  slots = INVENTORY_SLOTS,
  occupiedSlotIds = [],
}: InventorySlotBoardProps) {
  const scale = getMenuScale();
  const hitSize = INVENTORY_SLOT_SIZE * scale;
  const occupied = new Set(occupiedSlotIds);

  return (
    <>
      {slots.map((slot) => {
        const screen = menuToScreen(slot.x, slot.y, menuPosition);
        const isOccupied = occupied.has(slot.id);

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isOccupied}
            className={`absolute z-[46] opacity-0 ${
              isOccupied ? "pointer-events-none" : "cursor-pointer"
            }`}
            style={{
              left: screen.x - hitSize / 2,
              top: screen.y - hitSize / 2,
              width: hitSize,
              height: hitSize,
            }}
            aria-label={`Inventory slot ${slot.row + 1}-${slot.col + 1}`}
            data-inventory-row={slot.row}
            data-inventory-col={slot.col}
          />
        );
      })}
    </>
  );
}
