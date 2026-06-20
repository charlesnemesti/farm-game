// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { InventoryEntry } from "./gameState";
import type { SeedRarity } from "./seedConfig";
import { SEED_PACK_ITEM } from "./shopConfig";

export const CORN_SEED_ITEM = {
  id: "corn-seed",
  name: "Corn Seed",
  imageSrc: "/assets/items/corn-seed-icon.png",
} as const;

export const CORN_SEED_IMAGES: Record<SeedRarity, string> = {
  common: "/assets/items/corn-seed-icon.png",
  rare: "/assets/items/corn-seed-rare.png",
  epic: "/assets/items/corn-seed-epic.png",
};

export const SEED_PACK_TOOLTIP = {
  title: "Seeds Pack",
  description: "Contains 3 random corn seeds. Click to open.",
} as const;

export const ITEM_IMAGE_BY_ID: Record<string, string> = {
  [SEED_PACK_ITEM.id]: SEED_PACK_ITEM.imageSrc,
  [CORN_SEED_ITEM.id]: CORN_SEED_ITEM.imageSrc,
};

export function getSeedImage(rarity: SeedRarity = "common"): string {
  return CORN_SEED_IMAGES[rarity];
}

export function getItemImage(itemId: string): string | undefined {
  return ITEM_IMAGE_BY_ID[itemId];
}

export function getInventoryItemImage(entry: InventoryEntry): string | undefined {
  if (isSeedPack(entry.itemId)) return SEED_PACK_ITEM.imageSrc;
  if (entry.itemId === CORN_SEED_ITEM.id) {
    return getSeedImage(entry.rarity ?? "common");
  }
  return getItemImage(entry.itemId);
}

export function isSeedPack(itemId: string): boolean {
  return itemId === SEED_PACK_ITEM.id;
}
