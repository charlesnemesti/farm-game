// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const FARMER_TIP_INTERVAL_MS = 10_000;
export const FARMER_TIP_DISPLAY_MS = 4_500;

export const FARMER_TIPS = [
  "Drag seeds from your inventory onto glowing furrows to plant them.",
  "Open seed packs only when you have at least two empty inventory slots.",
  "Rare and Epic seeds take longer to grow, but they earn more $CORN.",
  "Unlock new rows as you level up to expand your farm.",
  "Visit the seed shop on the left to buy more seed packs.",
  "Crops keep growing while you're away — harvest when you return!",
  "Click the backpack at the bottom to open or close your inventory.",
  "Higher-level rows cost $CORN to unlock, but they hold more crops.",
  "Plant every furrow on row 1 before unlocking the next row.",
  "Watch your Production stat to see how much $CORN you earn per hour.",
] as const;

export function pickFarmerTip(previous?: string): string {
  const pool =
    previous && FARMER_TIPS.length > 1
      ? FARMER_TIPS.filter((tip) => tip !== previous)
      : FARMER_TIPS;

  return pool[Math.floor(Math.random() * pool.length)] ?? FARMER_TIPS[0];
}
