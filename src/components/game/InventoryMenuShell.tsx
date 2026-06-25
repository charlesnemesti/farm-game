"use client";

import { useCallback, useRef, useState } from "react";
import type { CoverTransform } from "@/hooks/useCoverTransform";
import { GameMenuPanel } from "@/components/game/GameMenuPanel";
import { InventoryPanel } from "@/components/game/InventoryPanel";
import { MenuStatsPanel } from "@/components/game/MenuStatsPanel";
import {
  clampMenuPosition,
  menuPositionToRatio,
  toLocalMenuLayout,
  type GameMenuLayout,
} from "@/lib/menuCoordinates";
import {
  MENU_CLOSE_BUTTON,
  MENU_DRAG_HANDLE_HEIGHT_RATIO,
} from "@/lib/uiConfig";

type InventoryMenuShellProps = {
  layout: GameMenuLayout;
  transform: CoverTransform;
  calibratorActive?: boolean;
  onClose: () => void;
  onPositionCommit: (ratio: { xRatio: number; yRatio: number }) => void;
};

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

// Draggable inventory menu shell with close control in the top-right corner.
export function InventoryMenuShell({
  layout,
  transform,
  calibratorActive = false,
  onClose,
  onPositionCommit,
}: InventoryMenuShellProps) {
  const dragRef = useRef<DragSession | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  const { size } = layout;
  const position = dragPosition ?? layout.position;
  const localLayout = toLocalMenuLayout({ ...layout, position: { x: 0, y: 0 } });
  const closeSize = Math.max(31, size.width * MENU_CLOSE_BUTTON.sizeRatio);
  const handleHeight = size.height * MENU_DRAG_HANDLE_HEIGHT_RATIO;

  const finishDrag = useCallback(
    (nextPosition: { x: number; y: number }) => {
      const clamped = clampMenuPosition(
        nextPosition,
        size.width,
        size.height,
        transform.viewportWidth,
        transform.viewportHeight,
      );
      onPositionCommit(
        menuPositionToRatio(
          clamped,
          size.width,
          size.height,
          transform.viewportWidth,
          transform.viewportHeight,
        ),
      );
      setDragPosition(null);
    },
    [
      onPositionCommit,
      size.height,
      size.width,
      transform.viewportHeight,
      transform.viewportWidth,
    ],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const next = clampMenuPosition(
      {
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      },
      size.width,
      size.height,
      transform.viewportWidth,
      transform.viewportHeight,
    );
    setDragPosition(next);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const next = clampMenuPosition(
      {
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      },
      size.width,
      size.height,
      transform.viewportWidth,
      transform.viewportHeight,
    );
    finishDrag(next);
  };

  return (
    <div
      className="absolute z-[45]"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      <div className="relative h-full w-full">
        <GameMenuPanel layout={localLayout} calibratorActive={calibratorActive} />

        <InventoryPanel menuLayout={localLayout} />

        <MenuStatsPanel menuLayout={localLayout} />

        <div
          className={`absolute inset-x-0 top-0 z-[50] touch-none ${
            calibratorActive ? "" : "cursor-grab active:cursor-grabbing"
          }`}
          style={{ height: handleHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          aria-label="Drag inventory menu"
          role="button"
          tabIndex={-1}
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="absolute z-[51] cursor-pointer opacity-0"
          style={{
            top: size.height * MENU_CLOSE_BUTTON.topRatio + MENU_CLOSE_BUTTON.screenOffsetY,
            right: size.width * MENU_CLOSE_BUTTON.rightRatio - MENU_CLOSE_BUTTON.screenOffsetX,
            width: closeSize,
            height: closeSize,
          }}
          aria-label="Close inventory menu"
        />
      </div>
    </div>
  );
}
