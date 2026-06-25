// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { GAME_NAME } from "./brandConfig";

export const FARMER_SPRITE = {
  src: "/assets/npcs/farmer-walk.png",
  frameWidth: 32,
  frameHeight: 32,
  framesPerDirection: 3,
  frameDurationMs: 120,
  directions: ["down", "left", "right", "up"] as const,
} as const;

export type NpcDirection = (typeof FARMER_SPRITE.directions)[number];

export type NpcWalkAnimation = {
  framesPerDirection: number;
  frameDurationMs: number;
};

export type NpcSpriteSheet = {
  src?: string;
  directionSrc?: Record<NpcDirection, string>;
  frameWidth: number;
  frameHeight: number;
  framesPerDirection: number;
  frameDurationMs?: number;
  directions?: readonly NpcDirection[];
};

/** Per-direction horizontal strips (4 walk frames each). */
export const PIG_SPRITE: NpcSpriteSheet = {
  directionSrc: {
    down: "/assets/npcs/pig-walk-down.png",
    up: "/assets/npcs/pig-walk-up.png",
    left: "/assets/npcs/pig-walk-left.png",
    right: "/assets/npcs/pig-walk-right.png",
  },
  frameWidth: 32,
  frameHeight: 32,
  framesPerDirection: 4,
  frameDurationMs: 120,
};

export const PIG_WALK_ANIMATION: NpcWalkAnimation = {
  framesPerDirection: PIG_SPRITE.framesPerDirection,
  frameDurationMs: PIG_SPRITE.frameDurationMs ?? 120,
};

export const PIG_NPC = {
  id: "pig",
  name: "Pig",
} as const;

/** Extra scale applied to all NPC sprites on screen (+50%). */
export const NPC_DISPLAY_SCALE = 1.5;

export const FARMER_NPC = {
  id: "farmer",
  name: "Old Mac",
  greeting:
    `Welcome to ${GAME_NAME}! Plant your crops, harvest $CORN on time, and rare purple yields fetch a higher price on the market.`,
} as const;

/** Single-frame-per-direction idle sheet (32×32 × 4 rows). */
export const VILLAGER_SPRITE = {
  src: "/assets/npcs/female-01-idle.png",
  frameWidth: 32,
  frameHeight: 32,
  framesPerDirection: 1,
  directions: ["down", "left", "right", "up"] as const,
} as const;

/** Seed shop sign anchor — bottom-center on the path signpost below the farm gate. */
export const SEED_SHOP_SIGN = {
  src: "/assets/ui/seed-shop-sign.png",
  width: 127,
  height: 256,
  displayWidth: 51,
  anchor: { x: 458, y: 438 },
} as const;

/** Villager feet position relative to the sign bottom-center anchor. */
export const VILLAGER_NPC = {
  id: "villager",
  name: "Villager",
  offsetFromSign: { x: 0, y: 8 },
} as const;

export function getVillagerDesignAnchor() {
  return {
    x: SEED_SHOP_SIGN.anchor.x + VILLAGER_NPC.offsetFromSign.x,
    y: SEED_SHOP_SIGN.anchor.y + VILLAGER_NPC.offsetFromSign.y,
  };
}
