// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Slot coordinates are in farm-scene.png design space (1024×571) — same on every screen.

export const FARM_BACKGROUND = "/assets/backgrounds/farm-scene.png";

/** Native pixel size of farm-scene.png — coordinates below use this space. */
export const DESIGN_SIZE = {
  width: 1024,
  height: 571,
};

export const PLANT_SPRITE_SIZE = {
  width: 16,
  height: 32,
};

export const PLOT_COUNT = 6;
export const SLOTS_PER_PLOT = 6;

export type SlotPosition = {
  x: number;
  y: number;
};

export type PlotSlotConfig = {
  plotId: number;
  slots: SlotPosition[];
};

/** Bounding box of calibrated furrow slots (for debug overlay reference). */
export const FURROW_BOARD = {
  x: 368,
  y: 197,
  width: 334,
  height: 187,
};

/** Calibrated crop anchor points aligned to the background furrows. */
export const PLOT_SLOTS: PlotSlotConfig[] = [
  {
    plotId: 0,
    slots: [
      { x: 368, y: 197 },
      { x: 435, y: 197 },
      { x: 502, y: 197 },
      { x: 568, y: 197 },
      { x: 635, y: 197 },
      { x: 702, y: 197 },
    ],
  },
  {
    plotId: 1,
    slots: [
      { x: 368, y: 233 },
      { x: 435, y: 233 },
      { x: 502, y: 233 },
      { x: 568, y: 233 },
      { x: 635, y: 233 },
      { x: 702, y: 233 },
    ],
  },
  {
    plotId: 2,
    slots: [
      { x: 368, y: 269 },
      { x: 435, y: 269 },
      { x: 502, y: 269 },
      { x: 568, y: 269 },
      { x: 635, y: 270 },
      { x: 702, y: 271 },
    ],
  },
  {
    plotId: 3,
    slots: [
      { x: 368, y: 307 },
      { x: 435, y: 309 },
      { x: 502, y: 308 },
      { x: 568, y: 309 },
      { x: 635, y: 308 },
      { x: 702, y: 308 },
    ],
  },
  {
    plotId: 4,
    slots: [
      { x: 368, y: 346 },
      { x: 435, y: 345 },
      { x: 502, y: 346 },
      { x: 568, y: 346 },
      { x: 635, y: 346 },
      { x: 702, y: 342 },
    ],
  },
  {
    plotId: 5,
    slots: [
      { x: 368, y: 383 },
      { x: 435, y: 383 },
      { x: 502, y: 383 },
      { x: 568, y: 384 },
      { x: 635, y: 383 },
      { x: 702, y: 383 },
    ],
  },
];
