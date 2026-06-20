// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export type ShopItem = {
  id: string;
  name: string;
  imageSrc: string;
  priceCorn: number;
};

export const SEED_PACK_ITEM: ShopItem = {
  id: "seed-pack",
  name: "Seeds Pack",
  imageSrc: "/assets/shop/seed-pack.png",
  priceCorn: 1000,
};

export const SHOP_ITEMS: ShopItem[] = [SEED_PACK_ITEM];
