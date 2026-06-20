"use client";

import { useRef } from "react";
import type { CalibrationTarget } from "@/hooks/useSlotCalibration";
import { isRouteTarget } from "@/hooks/useSlotCalibration";
import type { CoverTransform } from "@/hooks/useCoverTransform";
import { designToScreen, screenToDesign } from "@/hooks/useCoverTransform";
import type { PlotSlotConfig } from "@/lib/plotBoard";
import type { RoutePoint } from "@/lib/routeConfig";

type DebugOverlayProps = {
  transform: CoverTransform;
  slots: PlotSlotConfig[];
  routePoints: RoutePoint[];
  target: CalibrationTarget;
  showCropMarkers?: boolean;
  showRouteMarkers?: boolean;
  onSelect: (target: CalibrationTarget) => void;
  onMoveSlot: (plotId: number, slotId: number, x: number, y: number) => void;
  onMoveRoutePoint: (pointId: number, x: number, y: number) => void;
};

function isCropSelected(
  plotId: number,
  slotId: number,
  target: CalibrationTarget,
): boolean {
  if (isRouteTarget(target)) return false;
  switch (target.kind) {
    case "all":
      return false;
    case "row":
      return plotId === target.plotId;
    case "column":
      return slotId === target.slotId;
    case "slot":
      return plotId === target.plotId && slotId === target.slotId;
    default:
      return false;
  }
}

function isRouteSelected(pointId: number, target: CalibrationTarget): boolean {
  switch (target.kind) {
    case "route":
      return true;
    case "routePoint":
      return pointId === target.pointId;
    default:
      return false;
  }
}

// Crop markers 2×2 px (red); route markers larger (cyan).
export function DebugOverlay({
  transform,
  slots,
  routePoints,
  target,
  showCropMarkers = false,
  showRouteMarkers = false,
  onSelect,
  onMoveSlot,
  onMoveRoutePoint,
}: DebugOverlayProps) {
  const cropDragRef = useRef<{
    plotId: number;
    slotId: number;
    pointerId: number;
  } | null>(null);

  const routeDragRef = useRef<{
    pointId: number;
    pointerId: number;
  } | null>(null);

  const handleCropPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    plotId: number,
    slotId: number,
  ) => {
    event.preventDefault();
    cropDragRef.current = { plotId, slotId, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect({ kind: "slot", plotId, slotId });
  };

  const handleCropPointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    plotId: number,
    slotId: number,
  ) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const design = screenToDesign(event.clientX, event.clientY, transform);
    onMoveSlot(plotId, slotId, design.x, design.y);
  };

  const handleRoutePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    pointId: number,
  ) => {
    event.preventDefault();
    routeDragRef.current = { pointId, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect({ kind: "routePoint", pointId });
  };

  const handleRoutePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    pointId: number,
  ) => {
    const drag = routeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const design = screenToDesign(event.clientX, event.clientY, transform);
    onMoveRoutePoint(pointId, design.x, design.y);
  };

  const releasePointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    cropDragRef.current = null;
    routeDragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (!showCropMarkers && !showRouteMarkers) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[100]">
      {showRouteMarkers
        ? routePoints.map((point) => {
        const screen = designToScreen(point.x, point.y, transform);
        const selected = isRouteSelected(point.id, target);

        return (
          <button
            key={`route-${point.id}`}
            type="button"
            aria-label={`Route point ${point.id + 1}`}
            className="pointer-events-auto absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center"
            style={{ left: screen.x, top: screen.y }}
            onPointerDown={(event) => handleRoutePointerDown(event, point.id)}
            onPointerMove={(event) => handleRoutePointerMove(event, point.id)}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
          >
            <span
              className={`rounded-full ring-2 ring-white/90 ${
                selected ? "bg-yellow-400" : "bg-cyan-400"
              }`}
              style={{ width: 10, height: 10 }}
            />
          </button>
        );
      })
        : null}

      {showCropMarkers
        ? slots.flatMap((plot) =>
        plot.slots.map((slot, slotIndex) => {
          const screen = designToScreen(slot.x, slot.y, transform);
          const selected = isCropSelected(plot.plotId, slotIndex, target);

          return (
            <button
              key={`${plot.plotId}-${slotIndex}`}
              type="button"
              aria-label={`Slot ${plot.plotId + 1}-${slotIndex + 1}`}
              className="pointer-events-auto absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center"
              style={{ left: screen.x, top: screen.y }}
              onPointerDown={(event) =>
                handleCropPointerDown(event, plot.plotId, slotIndex)
              }
              onPointerMove={(event) =>
                handleCropPointerMove(event, plot.plotId, slotIndex)
              }
              onPointerUp={releasePointer}
              onPointerCancel={releasePointer}
            >
              <span
                className={`rounded-full ring-2 ring-white/90 ${
                  selected ? "bg-yellow-400" : "bg-red-500"
                }`}
                style={{ width: 8, height: 8 }}
              />
            </button>
          );
        }),
          )
        : null}
    </div>
  );
}
