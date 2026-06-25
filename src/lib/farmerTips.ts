// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { WIND_TEMPEST_MIN_PROGRESS } from "./plantSprites";
import { WEATHER_CYCLE_MS, WEATHER_ROLL_WEIGHTS } from "./weatherConfig";
import { WEATHER_EFFECTS } from "./weatherEffects";

export const FARMER_TIP_INTERVAL_MS = 10_000;
export const FARMER_TIP_DISPLAY_MS = 4_500;

const weatherCycleMinutes = WEATHER_CYCLE_MS / (60 * 1000);
const windTempestProgressPct = Math.round(WIND_TEMPEST_MIN_PROGRESS * 100);
const rainBonusPct = Math.round((WEATHER_EFFECTS.rain.growthMultiplier - 1) * 100);
const snowPenaltyPct = Math.round(
  (1 - WEATHER_EFFECTS.snow.growthMultiplier) * 100,
);

export const FARMER_TIPS = [
  "Drag seeds from your inventory onto glowing furrows to plant them.",
  "Open seed packs only when you have at least two empty inventory slots.",
  "Rare and Epic seeds take longer to grow, but they earn more $CORN.",
  "Rare seeds glow blue and Epic seeds glow purple on the farm.",
  "Unlock new rows as you level up to expand your farm.",
  "Visit the seed shop on the left to buy more seed packs.",
  "Crops keep growing while you're away — harvest when you return!",
  "Click the backpack at the bottom to open or close your inventory.",
  "Higher-level rows cost $CORN to unlock, but they hold more crops.",
  "Plant every furrow on row 1 before unlocking the next row.",
  "Watch your Production stat to see how much $CORN you earn per hour.",
  `Every ${weatherCycleMinutes} minutes the weather wheel spins and picks a new climate.`,
  `Rain gives +${rainBonusPct}% growth and $CORN — plant before a rainy spell if you can!`,
  `Snow slows growth by ${snowPenaltyPct}% — hang tight until the wheel turns.`,
  `When it's windy, crops past ${windTempestProgressPct}% growth sway hard — keep an eye on them!`,
  "Strong wind can uproot a mature crop, but the seed goes back to your pack.",
  "Weather only matters while you're playing — offline farms use normal growth.",
  "Tap ? beside the weather wheel for a quick climate cheat sheet.",
  "Press Docs in the header for the full game guide.",
  "Connect a wallet to save progress online and join the weekly leaderboard.",
  `Sunny days are most common (${WEATHER_ROLL_WEIGHTS.sunny}% chance on each spin).`,
] as const;

export function pickFarmerTip(previous?: string): string {
  const pool =
    previous && FARMER_TIPS.length > 1
      ? FARMER_TIPS.filter((tip) => tip !== previous)
      : FARMER_TIPS;

  return pool[Math.floor(Math.random() * pool.length)] ?? FARMER_TIPS[0];
}
