"use client";

import { useState } from "react";
import { useDrag } from "@/context/DragProvider";
import { useGame } from "@/context/GameProvider";
import { useTutorial } from "@/context/TutorialProvider";
import { INVENTORY_SLOTS } from "@/lib/inventoryBoard";
import { CORN_SEED_ITEM, isSeedPack, SEED_PACK_TOOLTIP } from "@/lib/itemConfig";
import { menuToScreen, type GameMenuLayout } from "@/lib/menuCoordinates";
import { RARITY_LABELS } from "@/lib/seedConfig";
import { ConfirmDialog } from "./ConfirmDialog";
import { InventoryItemVisual } from "./InventoryItemTooltip";
import { InventorySlotBoard } from "./InventorySlotBoard";
import { SeedPackOpeningModal } from "./SeedPackOpeningModal";

type InventoryPanelProps = {
  menuLayout: GameMenuLayout;
};

const BASE_ITEM_SIZE = 72;
const ITEM_SIZE_SCALE = 1.44;

// Inventory hitboxes, item visuals, and seed pack opening flow.
export function InventoryPanel({ menuLayout }: InventoryPanelProps) {
  const {
    inventory,
    canOpenSeedPack,
    selectPlantingSeed,
    plantingSeedSlot,
    discardInventoryItem,
  } = useGame();
  const { notifyEvent } = useTutorial();
  const { isDragging, dragSourceSlotId } = useDrag();
  const [openingPackSlot, setOpeningPackSlot] = useState<number | null>(null);
  const [openPackTarget, setOpenPackTarget] = useState<number | null>(null);
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);
  const [discardTarget, setDiscardTarget] = useState<{
    slotId: number;
    label: string;
  } | null>(null);
  const { position: menuPosition, scale } = menuLayout;
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
    setOpenPackTarget(slotId);
    notifyEvent("pack-clicked");
  };

  const requestDiscard = (slotId: number) => {
    const entry = inventory[slotId];
    if (!entry) return;

    const label = isSeedPack(entry.itemId)
      ? SEED_PACK_TOOLTIP.title
      : entry.rarity
        ? RARITY_LABELS[entry.rarity]
        : entry.itemId;

    setDiscardTarget({ slotId, label });
  };

  const packSlotId = inventory.findIndex(
    (entry) => entry !== null && isSeedPack(entry.itemId),
  );
  const seedSlotId = inventory.findIndex(
    (entry) =>
      entry !== null &&
      entry.itemId === CORN_SEED_ITEM.id &&
      entry.rarity !== undefined,
  );

  return (
    <>
      <InventorySlotBoard menuLayout={menuLayout} />

      {INVENTORY_SLOTS.map((slot) => {
        const entry = inventory[slot.id];
        if (!entry) return null;

        const screen = menuToScreen(slot.x, slot.y, menuPosition, scale);

        return (
          <div
            key={slot.id}
            className="pointer-events-auto absolute z-[47]"
            data-tutorial={
              slot.id === packSlotId
                ? "inventory-pack"
                : slot.id === seedSlotId
                  ? "inventory-seed"
                  : undefined
            }
            style={{
              left: screen.x - itemSize / 2,
              top: screen.y - itemSize / 2,
              width: itemSize,
              height: itemSize,
            }}
          >
            <InventoryItemVisual
              slotId={slot.id}
              entry={entry}
              itemSize={itemSize}
              selected={plantingSeedSlot === slot.id}
              isDragSource={isDragging && dragSourceSlotId === slot.id}
              onOpenPack={() => tryOpenPack(slot.id)}
              onSelectSeed={() => {
                const wasSelected = plantingSeedSlot === slot.id;
                selectPlantingSeed(slot.id);
                if (!wasSelected) {
                  notifyEvent("seed-selected");
                }
              }}
              onDiscard={() => requestDiscard(slot.id)}
            />
          </div>
        );
      })}

      {plantingSeedSlot !== null ? (
        <div className="pointer-events-none absolute top-20 left-1/2 z-[48] -translate-x-1/2 rounded-lg border border-farm-sun/40 bg-black/85 px-3 py-2 text-xs text-farm-sun shadow-lg">
          Click or drag your seed onto a glowing furrow to plant.
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

      <ConfirmDialog
        open={openPackTarget !== null}
        title="Open seed pack?"
        message={`Open ${SEED_PACK_TOOLTIP.title}? ${SEED_PACK_TOOLTIP.description} This cannot be undone.`}
        confirmLabel="Open pack"
        confirmTone="primary"
        confirmTutorialId="confirm-open-pack"
        onConfirm={() => {
          if (openPackTarget === null) return;
          setOpeningPackSlot(openPackTarget);
          setOpenPackTarget(null);
          notifyEvent("pack-confirmed");
        }}
        onCancel={() => setOpenPackTarget(null)}
      />

      <ConfirmDialog
        open={discardTarget !== null}
        title="Discard item?"
        message={
          discardTarget
            ? `Throw away ${discardTarget.label}? This cannot be undone.`
            : ""
        }
        confirmLabel="Discard"
        onConfirm={() => {
          if (!discardTarget) return;
          discardInventoryItem(discardTarget.slotId);
          setDiscardTarget(null);
        }}
        onCancel={() => setDiscardTarget(null)}
      />
    </>
  );
}
