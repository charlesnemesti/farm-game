"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PLOT_COUNT,
  PLOT_SLOTS,
  SLOTS_PER_PLOT,
  type PlotSlotConfig,
} from "@/lib/plotBoard";
import { ROUTE_POINTS, type RoutePoint } from "@/lib/routeConfig";
import {
  INVENTORY_COLS,
  INVENTORY_ROWS,
  INVENTORY_SLOTS,
  type InventorySlot,
} from "@/lib/inventoryBoard";
import { GAME_MENU_POSITION, type ScreenPosition } from "@/lib/uiConfig";

const SLOT_STORAGE_KEY = "solfarm-slot-calibration-v2";
const ROUTE_STORAGE_KEY = "solfarm-route-calibration";

export type CalibrationTarget =
  | { kind: "all" }
  | { kind: "row"; plotId: number }
  | { kind: "column"; slotId: number }
  | { kind: "slot"; plotId: number; slotId: number }
  | { kind: "route" }
  | { kind: "routePoint"; pointId: number }
  | { kind: "gameMenu" }
  | { kind: "inventoryAll" }
  | { kind: "invRow"; row: number }
  | { kind: "invCol"; col: number }
  | { kind: "invSlot"; row: number; col: number };

export function isRouteTarget(target: CalibrationTarget): boolean {
  return target.kind === "route" || target.kind === "routePoint";
}

export function isGameMenuTarget(target: CalibrationTarget): boolean {
  return target.kind === "gameMenu";
}

export function isInventoryTarget(target: CalibrationTarget): boolean {
  return (
    target.kind === "inventoryAll" ||
    target.kind === "invRow" ||
    target.kind === "invCol" ||
    target.kind === "invSlot"
  );
}

export function isCropTarget(target: CalibrationTarget): boolean {
  return (
    target.kind === "all" ||
    target.kind === "row" ||
    target.kind === "column" ||
    target.kind === "slot"
  );
}

function cloneSlots(slots: PlotSlotConfig[]): PlotSlotConfig[] {
  return slots.map((plot) => ({
    plotId: plot.plotId,
    slots: plot.slots.map((slot) => ({ ...slot })),
  }));
}

function cloneRoute(points: RoutePoint[]): RoutePoint[] {
  return points.map((point) => ({ ...point }));
}

function cloneInventory(slots: InventorySlot[]): InventorySlot[] {
  return slots.map((slot) => ({ ...slot }));
}

function loadSavedRoute(): RoutePoint[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ROUTE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!isValidRoutePoints(data)) {
      localStorage.removeItem(ROUTE_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(ROUTE_STORAGE_KEY);
    return null;
  }
}

function isValidRoutePoints(data: unknown): data is RoutePoint[] {
  if (!Array.isArray(data) || data.length < 2) return false;
  return data.every(
    (point) =>
      point &&
      typeof point === "object" &&
      typeof point.id === "number" &&
      typeof point.x === "number" &&
      typeof point.y === "number" &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y),
  );
}

function matchesCropTarget(
  plotId: number,
  slotId: number,
  target: CalibrationTarget,
): boolean {
  switch (target.kind) {
    case "all":
      return true;
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

function matchesInventoryTarget(
  row: number,
  col: number,
  target: CalibrationTarget,
): boolean {
  switch (target.kind) {
    case "inventoryAll":
      return true;
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

function matchesRouteTarget(pointId: number, target: CalibrationTarget): boolean {
  switch (target.kind) {
    case "route":
      return true;
    case "routePoint":
      return pointId === target.pointId;
    default:
      return false;
  }
}

export function serializePlotSlots(slots: PlotSlotConfig[]): string {
  const lines = slots.map((plot) => {
    const slotLines = plot.slots
      .map((slot) => `      { x: ${Math.round(slot.x)}, y: ${Math.round(slot.y)} },`)
      .join("\n");
    return `  { plotId: ${plot.plotId}, slots: [\n${slotLines}\n  ] },`;
  });

  return `export const PLOT_SLOTS: PlotSlotConfig[] = [\n${lines.join("\n")}\n];`;
}

export function serializeRoutePoints(points: RoutePoint[]): string {
  const lines = points
    .map(
      (point) =>
        `  { id: ${point.id}, x: ${Math.round(point.x)}, y: ${Math.round(point.y)} },`,
    )
    .join("\n");

  return `export const ROUTE_POINTS: RoutePoint[] = [\n${lines}\n];`;
}

export function serializeGameMenuPosition(position: ScreenPosition): string {
  return `export const GAME_MENU_POSITION = { x: ${Math.round(position.x)}, y: ${Math.round(position.y)} };`;
}

export function serializeInventorySlots(slots: InventorySlot[]): string {
  const lines = slots.map(
    (slot) =>
      `  { id: ${slot.id}, row: ${slot.row}, col: ${slot.col}, x: ${Math.round(slot.x)}, y: ${Math.round(slot.y)} },`,
  );

  return `export const INVENTORY_SLOTS: InventorySlot[] = [\n${lines.join("\n")}\n];`;
}

export function useSlotCalibration() {
  const [slots, setSlots] = useState<PlotSlotConfig[]>(() =>
    cloneSlots(PLOT_SLOTS),
  );
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(() =>
    cloneRoute(ROUTE_POINTS),
  );
  const [gameMenuPosition, setGameMenuPosition] = useState<ScreenPosition>(() => ({
    ...GAME_MENU_POSITION,
  }));
  const [inventorySlots, setInventorySlots] = useState<InventorySlot[]>(() =>
    cloneInventory(INVENTORY_SLOTS),
  );
  const [hydrated, setHydrated] = useState(false);
  const [target, setTarget] = useState<CalibrationTarget>({ kind: "all" });
  const [step, setStep] = useState(5);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedRoute = loadSavedRoute();
    if (savedRoute) setRoutePoints(savedRoute);
    setHydrated(true);
  }, []);

  const applyCropDelta = useCallback(
    (dx: number, dy: number) => {
      setSlots((prev) => {
        const next = cloneSlots(prev);
        for (const plot of next) {
          for (let slotId = 0; slotId < plot.slots.length; slotId++) {
            if (matchesCropTarget(plot.plotId, slotId, target)) {
              plot.slots[slotId].x += dx;
              plot.slots[slotId].y += dy;
            }
          }
        }
        localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [target],
  );

  const applyRouteDelta = useCallback(
    (dx: number, dy: number) => {
      setRoutePoints((prev) => {
        const next = cloneRoute(prev);
        for (const point of next) {
          if (matchesRouteTarget(point.id, target)) {
            point.x += dx;
            point.y += dy;
          }
        }
        localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [target],
  );

  const applyInventoryDelta = useCallback(
    (dx: number, dy: number) => {
      setInventorySlots((prev) => {
        const next = cloneInventory(prev);
        for (const slot of next) {
          if (matchesInventoryTarget(slot.row, slot.col, target)) {
            slot.x += dx;
            slot.y += dy;
          }
        }
        return next;
      });
    },
    [target],
  );

  const nudge = useCallback(
    (dx: number, dy: number) => {
      const deltaX = dx * step;
      const deltaY = dy * step;
      if (target.kind === "gameMenu") {
        setGameMenuPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        return;
      }
      if (isInventoryTarget(target)) {
        applyInventoryDelta(deltaX, deltaY);
        return;
      }
      if (isRouteTarget(target)) {
        applyRouteDelta(deltaX, deltaY);
      } else {
        applyCropDelta(deltaX, deltaY);
      }
    },
    [applyCropDelta, applyInventoryDelta, applyRouteDelta, step, target],
  );

  const adjustColumnSpacing = useCallback(
    (delta: number) => {
      if (isGameMenuTarget(target)) return;

      if (isInventoryTarget(target)) {
        setInventorySlots((prev) => {
          const next = cloneInventory(prev);
          const center = (INVENTORY_COLS - 1) / 2;
          for (const slot of next) {
            if (target.kind === "invRow" && slot.row !== target.row) continue;
            if (target.kind === "invCol" && slot.col !== target.col) continue;
            if (target.kind === "invSlot") continue;
            slot.x += (slot.col - center) * delta * step;
          }
          return next;
        });
        return;
      }

      if (isRouteTarget(target)) {
        setRoutePoints((prev) => {
          const next = cloneRoute(prev);
          const center = (next.length - 1) / 2;
          for (const point of next) {
            if (!matchesRouteTarget(point.id, target)) continue;
            point.x += (point.id - center) * delta * step;
          }
          localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        return;
      }

      setSlots((prev) => {
        const next = cloneSlots(prev);
        for (const plot of next) {
          if (target.kind === "row" && plot.plotId !== target.plotId) continue;

          const center = (SLOTS_PER_PLOT - 1) / 2;
          for (let slotId = 0; slotId < plot.slots.length; slotId++) {
            if (target.kind === "column" && slotId !== target.slotId) continue;
            if (target.kind === "slot") continue;
            plot.slots[slotId].x += (slotId - center) * delta * step;
          }
        }
        localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [step, target],
  );

  const adjustRowSpacing = useCallback(
    (delta: number) => {
      if (isRouteTarget(target) || isGameMenuTarget(target)) return;

      if (isInventoryTarget(target)) {
        setInventorySlots((prev) => {
          const next = cloneInventory(prev);
          const center = (INVENTORY_ROWS - 1) / 2;
          for (const slot of next) {
            if (target.kind === "invCol" && slot.col !== target.col) continue;
            if (target.kind === "invRow" && slot.row !== target.row) continue;
            if (
              target.kind === "invSlot" &&
              (slot.row !== target.row || slot.col !== target.col)
            ) {
              continue;
            }
            slot.y += (slot.row - center) * delta * step;
          }
          return next;
        });
        return;
      }

      setSlots((prev) => {
        const next = cloneSlots(prev);
        const center = (PLOT_COUNT - 1) / 2;

        for (const plot of next) {
          if (target.kind === "slot" && plot.plotId !== target.plotId) continue;
          if (target.kind === "row" && plot.plotId !== target.plotId) continue;

          const rowDelta = (plot.plotId - center) * delta * step;
          for (let slotId = 0; slotId < plot.slots.length; slotId++) {
            if (target.kind === "column" && slotId !== target.slotId) continue;
            if (
              target.kind === "slot" &&
              (plot.plotId !== target.plotId || slotId !== target.slotId)
            ) {
              continue;
            }
            plot.slots[slotId].y += rowDelta;
          }
        }
        localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [step, target],
  );

  const setSlotPosition = useCallback(
    (plotId: number, slotId: number, x: number, y: number) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      setSlots((prev) => {
        if (!prev[plotId]?.slots[slotId]) return prev;
        const next = cloneSlots(prev);
        next[plotId].slots[slotId] = { x, y };
        localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const setRoutePointPosition = useCallback(
    (pointId: number, x: number, y: number) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      setRoutePoints((prev) => {
        const next = cloneRoute(prev);
        const point = next.find((entry) => entry.id === pointId);
        if (!point) return prev;
        point.x = x;
        point.y = y;
        localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const setInventorySlotPosition = useCallback(
    (row: number, col: number, x: number, y: number) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      setInventorySlots((prev) => {
        const next = cloneInventory(prev);
        const slot = next.find((entry) => entry.row === row && entry.col === col);
        if (!slot) return prev;
        slot.x = x;
        slot.y = y;
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    if (target.kind === "gameMenu") {
      setGameMenuPosition({ ...GAME_MENU_POSITION });
      return;
    }

    if (isInventoryTarget(target)) {
      setInventorySlots(cloneInventory(INVENTORY_SLOTS));
      setTarget({ kind: "inventoryAll" });
      return;
    }

    if (isRouteTarget(target)) {
      const fresh = cloneRoute(ROUTE_POINTS);
      setRoutePoints(fresh);
      localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(fresh));
      setTarget({ kind: "route" });
      return;
    }

    const fresh = cloneSlots(PLOT_SLOTS);
    setSlots(fresh);
    localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(fresh));
    setTarget({ kind: "all" });
  }, [target]);

  const copyConfig = useCallback(async () => {
    const text =
      target.kind === "gameMenu"
        ? serializeGameMenuPosition(gameMenuPosition)
        : isInventoryTarget(target)
          ? serializeInventorySlots(inventorySlots)
          : isRouteTarget(target)
            ? serializeRoutePoints(routePoints)
            : serializePlotSlots(slots);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [gameMenuPosition, inventorySlots, routePoints, slots, target]);

  return {
    slots,
    routePoints,
    gameMenuPosition,
    inventorySlots,
    setGameMenuPosition,
    setInventorySlotPosition,
    hydrated,
    target,
    setTarget,
    step,
    setStep,
    copied,
    nudge,
    adjustColumnSpacing,
    adjustRowSpacing,
    setSlotPosition,
    setRoutePointPosition,
    reset,
    copyConfig,
  };
}
