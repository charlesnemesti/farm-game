"use client";

import type { ReactNode } from "react";
import {
  isGameMenuTarget,
  isInventoryTarget,
  isRouteTarget,
  type CalibrationTarget,
} from "@/hooks/useSlotCalibration";
import {
  INVENTORY_COLS,
  INVENTORY_ROWS,
} from "@/lib/inventoryBoard";
import {
  PLOT_COUNT,
  SLOTS_PER_PLOT,
} from "@/lib/plotBoard";
import { ROUTE_POINT_COUNT } from "@/lib/routeConfig";

type SlotCalibratorPanelProps = {
  target: CalibrationTarget;
  step: number;
  copied: boolean;
  showCropMarkers: boolean;
  showRouteMarkers: boolean;
  showInventoryMarkers: boolean;
  onToggleCropMarkers: () => void;
  onToggleRouteMarkers: () => void;
  onToggleInventoryMarkers: () => void;
  onTargetChange: (target: CalibrationTarget) => void;
  onStepChange: (step: number) => void;
  onNudge: (dx: number, dy: number) => void;
  onColumnSpacing: (delta: number) => void;
  onRowSpacing: (delta: number) => void;
  onReset: () => void;
  onCopy: () => void;
  onClose: () => void;
};

function targetLabel(target: CalibrationTarget): string {
  switch (target.kind) {
    case "all":
      return "All crop points";
    case "row":
      return `Row ${target.plotId + 1}`;
    case "column":
      return `Column ${target.slotId + 1}`;
    case "slot":
      return `Crop ${target.plotId + 1}-${target.slotId + 1}`;
    case "route":
      return "Ruta (all waypoints)";
    case "routePoint":
      return `Ruta point ${target.pointId + 1}`;
    case "gameMenu":
      return "Game menu panel";
    case "inventoryAll":
      return "All inventory slots";
    case "invRow":
      return `Inventory row ${target.row + 1}`;
    case "invCol":
      return `Inventory col ${target.col + 1}`;
    case "invSlot":
      return `Inventory ${target.row + 1}-${target.col + 1}`;
  }
}

function selectValue(target: CalibrationTarget): string {
  switch (target.kind) {
    case "all":
      return "all";
    case "row":
      return `row-${target.plotId}`;
    case "column":
      return `col-${target.slotId}`;
    case "slot":
      return `slot-${target.plotId}-${target.slotId}`;
    case "route":
      return "route-all";
    case "routePoint":
      return `route-point-${target.pointId}`;
    case "gameMenu":
      return "game-menu";
    case "inventoryAll":
      return "inventory-all";
    case "invRow":
      return `inv-row-${target.row}`;
    case "invCol":
      return `inv-col-${target.col}`;
    case "invSlot":
      return `inv-slot-${target.row}-${target.col}`;
  }
}

function MarkerToggle({
  active,
  label,
  activeClassName,
  onClick,
}: {
  active: boolean;
  label: string;
  activeClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
        active ? activeClassName : "bg-white/10 text-white/70 hover:bg-white/20"
      }`}
    >
      {active ? `${label} on` : `${label} off`}
    </button>
  );
}

function ActionButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-2 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
    >
      {children}
    </button>
  );
}

// Floating panel to nudge crop slots, route waypoints, and the game menu.
export function SlotCalibratorPanel({
  target,
  step,
  copied,
  showCropMarkers,
  showRouteMarkers,
  showInventoryMarkers,
  onToggleCropMarkers,
  onToggleRouteMarkers,
  onToggleInventoryMarkers,
  onTargetChange,
  onStepChange,
  onNudge,
  onColumnSpacing,
  onRowSpacing,
  onReset,
  onCopy,
  onClose,
}: SlotCalibratorPanelProps) {
  const editingRoute = isRouteTarget(target);
  const editingGameMenu = isGameMenuTarget(target);
  const editingInventory = isInventoryTarget(target);

  return (
    <aside className="absolute top-16 right-4 z-[120] w-64 rounded-xl border border-white/15 bg-black/85 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-wide">Slot calibrator</h2>
          <p className="mt-1 text-[11px] text-white/60">
            Markers hidden by default. Target: {targetLabel(target)}
          </p>
        </div>
        <button
          type="button"
          title="Close calibrator"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-sm text-white/80 transition hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
          Step (px)
        </p>
        <div className="flex gap-2">
          {[1, 5, 10].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onStepChange(value)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                step === value
                  ? "bg-farm-sun text-farm-wood"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
          Show markers
        </p>
        <div className="grid grid-cols-1 gap-2">
          <MarkerToggle
            active={showCropMarkers}
            label="Crop points"
            activeClassName="bg-lime-500/30 text-lime-100"
            onClick={onToggleCropMarkers}
          />
          <MarkerToggle
            active={showRouteMarkers}
            label="Route points"
            activeClassName="bg-cyan-500/30 text-cyan-100"
            onClick={onToggleRouteMarkers}
          />
          <MarkerToggle
            active={showInventoryMarkers}
            label="Inventory points"
            activeClassName="bg-violet-500/30 text-violet-100"
            onClick={onToggleInventoryMarkers}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
          Selection
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onTargetChange({ kind: "all" })}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium ${
              target.kind === "all"
                ? "bg-lime-500/30 text-lime-200"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Crops
          </button>
          <button
            type="button"
            onClick={() => onTargetChange({ kind: "inventoryAll" })}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium ${
              editingInventory
                ? "bg-violet-500/30 text-violet-100"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Inventory
          </button>
          <button
            type="button"
            onClick={() => onTargetChange({ kind: "route" })}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium ${
              target.kind === "route"
                ? "bg-cyan-500/30 text-cyan-100"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Ruta
          </button>
          <button
            type="button"
            onClick={() => onTargetChange({ kind: "gameMenu" })}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium ${
              target.kind === "gameMenu"
                ? "bg-amber-500/30 text-amber-100"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Menu
          </button>
          <select
            value={selectValue(target)}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                onTargetChange({ kind: "all" });
                return;
              }
              if (value === "inventory-all") {
                onTargetChange({ kind: "inventoryAll" });
                return;
              }
              if (value === "game-menu") {
                onTargetChange({ kind: "gameMenu" });
                return;
              }
              if (value === "route-all") {
                onTargetChange({ kind: "route" });
                return;
              }
              if (value.startsWith("route-point-")) {
                onTargetChange({
                  kind: "routePoint",
                  pointId: Number(value.slice(12)),
                });
                return;
              }
              if (value.startsWith("inv-row-")) {
                onTargetChange({
                  kind: "invRow",
                  row: Number(value.slice(8)),
                });
                return;
              }
              if (value.startsWith("inv-col-")) {
                onTargetChange({
                  kind: "invCol",
                  col: Number(value.slice(8)),
                });
                return;
              }
              if (value.startsWith("inv-slot-")) {
                const [row, col] = value.slice("inv-slot-".length).split("-");
                onTargetChange({
                  kind: "invSlot",
                  row: Number(row),
                  col: Number(col),
                });
                return;
              }
              if (value.startsWith("row-")) {
                onTargetChange({
                  kind: "row",
                  plotId: Number(value.slice(4)),
                });
                return;
              }
              if (value.startsWith("col-")) {
                onTargetChange({
                  kind: "column",
                  slotId: Number(value.slice(4)),
                });
                return;
              }
              const [, plotId, slotId] = value.split("-");
              onTargetChange({
                kind: "slot",
                plotId: Number(plotId),
                slotId: Number(slotId),
              });
            }}
            className="calibrator-select col-span-2 rounded-lg border border-white/20 bg-neutral-900 px-2 py-1.5 text-xs text-white"
          >
            <option value="all" className="bg-neutral-900 text-white">
              Pick crop row / column / point…
            </option>
            {Array.from({ length: PLOT_COUNT }, (_, plotId) => (
              <option
                key={`row-${plotId}`}
                value={`row-${plotId}`}
                className="bg-neutral-900 text-white"
              >
                Row {plotId + 1} (furrow)
              </option>
            ))}
            {Array.from({ length: SLOTS_PER_PLOT }, (_, slotId) => (
              <option
                key={`col-${slotId}`}
                value={`col-${slotId}`}
                className="bg-neutral-900 text-white"
              >
                Column {slotId + 1}
              </option>
            ))}
            {Array.from({ length: PLOT_COUNT }, (_, plotId) =>
              Array.from({ length: SLOTS_PER_PLOT }, (_, slotId) => (
                <option
                  key={`slot-${plotId}-${slotId}`}
                  value={`slot-${plotId}-${slotId}`}
                  className="bg-neutral-900 text-white"
                >
                  Crop {plotId + 1}-{slotId + 1}
                </option>
              )),
            )}
            <option value="game-menu" className="bg-neutral-900 text-white">
              Game menu panel
            </option>
            <option value="route-all" className="bg-neutral-900 text-white">
              Ruta (all waypoints)
            </option>
            {Array.from({ length: ROUTE_POINT_COUNT }, (_, pointId) => (
              <option
                key={`route-point-${pointId}`}
                value={`route-point-${pointId}`}
                className="bg-neutral-900 text-white"
              >
                Ruta point {pointId + 1}
              </option>
            ))}
            <option value="inventory-all" className="bg-neutral-900 text-white">
              Inventory (all slots)
            </option>
            {Array.from({ length: INVENTORY_ROWS }, (_, row) => (
              <option
                key={`inv-row-${row}`}
                value={`inv-row-${row}`}
                className="bg-neutral-900 text-white"
              >
                Inventory row {row + 1}
              </option>
            ))}
            {Array.from({ length: INVENTORY_COLS }, (_, col) => (
              <option
                key={`inv-col-${col}`}
                value={`inv-col-${col}`}
                className="bg-neutral-900 text-white"
              >
                Inventory col {col + 1}
              </option>
            ))}
            {Array.from({ length: INVENTORY_ROWS }, (_, row) =>
              Array.from({ length: INVENTORY_COLS }, (_, col) => (
                <option
                  key={`inv-slot-${row}-${col}`}
                  value={`inv-slot-${row}-${col}`}
                  className="bg-neutral-900 text-white"
                >
                  Inventory {row + 1}-{col + 1}
                </option>
              )),
            )}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
          Move
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <span />
          <ActionButton title="Move up" onClick={() => onNudge(0, -1)}>
            ↑
          </ActionButton>
          <span />
          <ActionButton title="Move left" onClick={() => onNudge(-1, 0)}>
            ←
          </ActionButton>
          <ActionButton title="Move down" onClick={() => onNudge(0, 1)}>
            ↓
          </ActionButton>
          <ActionButton title="Move right" onClick={() => onNudge(1, 0)}>
            →
          </ActionButton>
        </div>
      </div>

      {!editingGameMenu ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
            Spacing
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-white/80">
                {editingRoute
                  ? "Route wider"
                  : editingInventory
                    ? "Cols wider"
                    : "Columns wider"}
              </span>
              <div className="flex gap-1">
                <ActionButton
                  title={editingRoute ? "Tighten route" : "Tighten columns"}
                  onClick={() => onColumnSpacing(-1)}
                >
                  −
                </ActionButton>
                <ActionButton
                  title={editingRoute ? "Widen route" : "Widen columns"}
                  onClick={() => onColumnSpacing(1)}
                >
                  +
                </ActionButton>
              </div>
            </div>
            {!editingRoute ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white/80">Rows taller</span>
                <div className="flex gap-1">
                  <ActionButton title="Tighten rows" onClick={() => onRowSpacing(-1)}>
                    −
                  </ActionButton>
                  <ActionButton title="Widen rows" onClick={() => onRowSpacing(1)}>
                    +
                  </ActionButton>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-lg border border-white/20 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 rounded-lg bg-farm-sun py-2 text-xs font-semibold text-farm-wood hover:bg-farm-sun-dark"
        >
          {copied
            ? "Copied!"
            : editingGameMenu
              ? "Copy menu"
              : editingInventory
                ? "Copy inventory"
                : editingRoute
                  ? "Copy route"
                  : "Copy crops"}
        </button>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-white/45">
        {editingGameMenu
          ? "Select Menu and use arrows. Paste into src/lib/uiConfig.ts."
          : editingInventory
            ? "Select Inventory and align violet dots. Paste into src/lib/inventoryBoard.ts."
            : editingRoute
              ? "Paste into src/lib/routeConfig.ts when the cyan path aligns."
              : "Paste into src/lib/plotBoard.ts when crop dots align."}{" "}
        Positions are saved in code for all screens.
      </p>
    </aside>
  );
}
