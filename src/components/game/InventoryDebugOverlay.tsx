"use client";

import { useRef } from "react";
import type { CalibrationTarget } from "@/hooks/useSlotCalibration";
import type { InventorySlot } from "@/lib/inventoryBoard";
import { menuToScreen, screenToMenu, type GameMenuLayout } from "@/lib/menuCoordinates";

type InventoryDebugOverlayProps = {
  menuLayout: GameMenuLayout;
  slots: InventorySlot[];
  target: CalibrationTarget;
  visible?: boolean;
  onSelect: (target: CalibrationTarget) => void;
  onMoveSlot: (row: number, col: number, x: number, y: number) => void;
};

function isInventorySelected(
  row: number,
  col: number,
  target: CalibrationTarget,
): boolean {
  switch (target.kind) {
    case "inventoryAll":
      return false;
    case "invRow":
      return row === target.row;
    case "invCol":
      return col === target.col;
    case "invSlot":
      return row === target.row && col === target.col;
    default:
      return false;
  }
}

// Purple markers for inventory slot calibration (MENU.png space).
export function InventoryDebugOverlay({
  menuLayout,
  slots,
  target,
  visible = false,
  onSelect,
  onMoveSlot,
}: InventoryDebugOverlayProps) {
  const { position: menuPosition, scale } = menuLayout;
  const dragRef = useRef<{
    row: number;
    col: number;
    pointerId: number;
  } | null>(null);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { row, col, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect({ kind: "invSlot", row, col });
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const menu = screenToMenu(event.clientX, event.clientY, menuPosition, scale);
    onMoveSlot(row, col, menu.x, menu.y);
  };

  const releasePointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[110]">
      {slots.map((slot) => {
        const screen = menuToScreen(slot.x, slot.y, menuPosition, scale);
        const selected = isInventorySelected(slot.row, slot.col, target);

        return (
          <button
            key={slot.id}
            type="button"
            aria-label={`Inventory ${slot.row + 1}-${slot.col + 1}`}
            className="pointer-events-auto absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center"
            style={{ left: screen.x, top: screen.y }}
            onPointerDown={(event) =>
              handlePointerDown(event, slot.row, slot.col)
            }
            onPointerMove={(event) =>
              handlePointerMove(event, slot.row, slot.col)
            }
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
          >
            <span
              className={`rounded-full ring-2 ring-white/90 ${
                selected ? "bg-yellow-400" : "bg-violet-500"
              }`}
              style={{ width: 8, height: 8 }}
            />
          </button>
        );
      })}
    </div>
  );
}
