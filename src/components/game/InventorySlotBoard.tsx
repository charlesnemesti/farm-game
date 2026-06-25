"use client";

import {
  INVENTORY_SLOT_SIZE,
  INVENTORY_SLOTS,
  type InventorySlot,
} from "@/lib/inventoryBoard";
import { useDrag } from "@/context/DragProvider";
import { menuToScreen, type GameMenuLayout } from "@/lib/menuCoordinates";

type InventorySlotBoardProps = {
  menuLayout: GameMenuLayout;
  slots?: InventorySlot[];
};

// Inventory drop zones — visible while dragging to reorder items.
export function InventorySlotBoard({
  menuLayout,
  slots = INVENTORY_SLOTS,
}: InventorySlotBoardProps) {
  const { isDragging } = useDrag();
  const { position: menuPosition, scale } = menuLayout;
  const hitSize = INVENTORY_SLOT_SIZE * scale;

  return (
    <>
      {slots.map((slot) => {
        const screen = menuToScreen(slot.x, slot.y, menuPosition, scale);

        return (
          <div
            key={slot.id}
            data-drop-target="inventory"
            data-inventory-slot={slot.id}
            className={`absolute rounded-md border ${
              isDragging
                ? "pointer-events-auto z-[49] border-farm-sun/35 bg-farm-sun/10"
                : "pointer-events-none z-[46] border-transparent opacity-0"
            }`}
            style={{
              left: screen.x - hitSize / 2,
              top: screen.y - hitSize / 2,
              width: hitSize,
              height: hitSize,
            }}
            aria-hidden={!isDragging}
          />
        );
      })}
    </>
  );
}
