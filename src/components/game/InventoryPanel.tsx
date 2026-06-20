"use client";

import { useState } from "react";
import { useGame } from "@/context/GameProvider";
import { INVENTORY_SLOTS } from "@/lib/inventoryBoard";
import { getMenuScale, menuToScreen } from "@/lib/menuCoordinates";
import { isSeedPack } from "@/lib/itemConfig";
import type { ScreenPosition } from "@/lib/uiConfig";
import { InventoryItemVisual } from "./InventoryItemTooltip";
import { InventorySlotBoard } from "./InventorySlotBoard";
import { SeedPackOpeningModal } from "./SeedPackOpeningModal";

type InventoryPanelProps = {
  menuPosition: ScreenPosition;
};

const BASE_ITEM_SIZE = 72;
const ITEM_SIZE_SCALE = 1.44;

// Inventory hitboxes, item visuals, and seed pack opening flow.
export function InventoryPanel({ menuPosition }: InventoryPanelProps) {
  const { inventory, canOpenSeedPack, selectPlantingSeed, plantingSeedSlot } =
    useGame();
  const [openingPackSlot, setOpeningPackSlot] = useState<number | null>(null);
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);
  const scale = getMenuScale();
  const itemSize = BASE_ITEM_SIZE * ITEM_SIZE_SCALE * scale;

  const tryOpenPack = (slotId: number) => {
    const entry = inventory[slotId];
    if (!entry || !isSeedPack(entry.itemId)) return;

    if (!canOpenSeedPack(slotId)) {
      setInventoryMessage("Need at least 2 empty inventory slots to open a pack.");
      window.setTimeout(() => setInventoryMessage(null), 2500);
      return;
    }

    setInventoryMessage(null);
    setOpeningPackSlot(slotId);
  };

  return (
    <>
      <InventorySlotBoard
        menuPosition={menuPosition}
        occupiedSlotIds={inventory
          .map((entry, index) => (entry !== null ? index : -1))
          .filter((index) => index >= 0)}
      />

      {INVENTORY_SLOTS.map((slot) => {
        const entry = inventory[slot.id];
        if (!entry) return null;

        const screen = menuToScreen(slot.x, slot.y, menuPosition);

        return (
          <div
            key={slot.id}
            className="pointer-events-auto absolute z-[47]"
            style={{
              left: screen.x - itemSize / 2,
              top: screen.y - itemSize / 2,
              width: itemSize,
              height: itemSize,
            }}
          >
            <InventoryItemVisual
              entry={entry}
              itemSize={itemSize}
              selected={plantingSeedSlot === slot.id}
              onOpenPack={() => tryOpenPack(slot.id)}
              onSelectSeed={() => selectPlantingSeed(slot.id)}
            />
          </div>
        );
      })}

      {plantingSeedSlot !== null ? (
        <div className="pointer-events-none absolute top-20 left-1/2 z-[48] -translate-x-1/2 rounded-lg border border-farm-sun/40 bg-black/85 px-3 py-2 text-xs text-farm-sun shadow-lg">
          Click a glowing furrow to plant your seed.
        </div>
      ) : null}

      {inventoryMessage ? (
        <div className="pointer-events-none absolute top-20 left-1/2 z-[48] -translate-x-1/2 rounded-lg border border-white/20 bg-black/85 px-3 py-2 text-xs text-white shadow-lg">
          {inventoryMessage}
        </div>
      ) : null}

      {openingPackSlot !== null ? (
        <SeedPackOpeningModal
          packSlotIndex={openingPackSlot}
          onClose={() => setOpeningPackSlot(null)}
        />
      ) : null}
    </>
  );
}
