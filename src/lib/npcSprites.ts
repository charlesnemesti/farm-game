// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const FARMER_SPRITE = {
  src: "/assets/npcs/farmer-walk.png",
  frameWidth: 32,
  frameHeight: 32,
  framesPerDirection: 3,
  frameDurationMs: 120,
  directions: ["down", "left", "right", "up"] as const,
} as const;

export type NpcDirection = (typeof FARMER_SPRITE.directions)[number];

/** Extra scale applied to all NPC sprites on screen (+50%). */
export const NPC_DISPLAY_SCALE = 1.5;

export const FARMER_NPC = {
  id: "farmer",
  name: "Old Mac",
  greeting:
    "Welcome to SolFarm! Plant your crops, harvest on time, and rare purple yields fetch a higher price on the market.",
} as const;

/** Single-frame-per-direction idle sheet (32×32 × 4 rows). */
export const VILLAGER_SPRITE = {
  src: "/assets/npcs/female-01-idle.png",
  frameWidth: 32,
  frameHeight: 32,
  framesPerDirection: 1,
  directions: ["down", "left", "right", "up"] as const,
} as const;

/** Seed shop sign anchor — bottom-center in design space (farm-scene.png pixels). */
export const SEED_SHOP_SIGN = {
  src: "/assets/ui/seed-shop-sign.png",
  width: 127,
  height: 256,
  displayWidth: 51,
  anchor: { x: 920, y: 267 },
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
