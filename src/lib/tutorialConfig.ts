// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { OFFLINE_HARVEST_CAP_MS } from "./harvestProgress";
import { DEMO_MAX_PLOT_ID } from "./playMode";
import { WIND_TEMPEST_MIN_PROGRESS } from "./plantSprites";
import { SEED_PACK_ITEM } from "./shopConfig";
import { WITHDRAW_MIN_LEVEL } from "./treasuryConfig";
import { WEATHER_CYCLE_MS, WEATHER_ROLL_WEIGHTS } from "./weatherConfig";
import { WEATHER_EFFECTS } from "./weatherEffects";

export const TUTORIAL_STORAGE_KEY = "solfarm-tutorial-v1";

/** Time until the tutorial crop is ready to harvest after planting. */
export const TUTORIAL_HARVEST_WAIT_MS = 12_000;

export type TutorialStepId =
  | "welcome"
  | "open-shop"
  | "buy-pack"
  | "open-pack"
  | "confirm-open"
  | "collect-seeds"
  | "select-seed"
  | "plant-seed"
  | "wait-harvest"
  | "info-weather"
  | "info-offline"
  | "info-wallet"
  | "info-leaderboard"
  | "done";

export type TutorialTargetId =
  | "villager"
  | "shop-buy"
  | "inventory-pack"
  | "confirm-open-pack"
  | "send-to-inventory"
  | "inventory-seed"
  | "furrow";

export type TutorialEvent =
  | "shop-opened"
  | "pack-purchased"
  | "pack-clicked"
  | "pack-confirmed"
  | "seeds-collected"
  | "seed-selected"
  | "seed-planted"
  | "harvest-received";

export type TutorialStepKind = "intro" | "interactive" | "info" | "complete";

export type TutorialStepConfig = {
  id: TutorialStepId;
  kind: TutorialStepKind;
  title: string;
  body: string;
  target?: TutorialTargetId;
};

export const TUTORIAL_STEP_ORDER: TutorialStepId[] = [
  "welcome",
  "open-shop",
  "buy-pack",
  "open-pack",
  "confirm-open",
  "collect-seeds",
  "select-seed",
  "plant-seed",
  "wait-harvest",
  "info-weather",
  "info-offline",
  "info-wallet",
  "info-leaderboard",
  "done",
];

const weatherCycleMinutes = WEATHER_CYCLE_MS / (60 * 1000);
const offlineCapHours = OFFLINE_HARVEST_CAP_MS / (60 * 60 * 1000);
const windTempestPct = Math.round(WIND_TEMPEST_MIN_PROGRESS * 100);
const rainBonusPct = Math.round((WEATHER_EFFECTS.rain.growthMultiplier - 1) * 100);
const snowPenaltyPct = Math.round((1 - WEATHER_EFFECTS.snow.growthMultiplier) * 100);

const TUTORIAL_STEP_CONTENT: Omit<TutorialStepConfig, "id">[] = [
  {
    kind: "intro",
    title: "Welcome to SolFarm!",
    body: "This guide walks through the full game in order: the core farming loop, weather, wallet features, and more. Interactive steps highlight what to click; later steps explain the rest.",
  },
  {
    kind: "interactive",
    title: "Visit the seed shop",
    body: "Click the villager by the seed shop sign on the left side of the farm.",
    target: "villager",
  },
  {
    kind: "interactive",
    title: "Buy a Seeds Pack",
    body: `Purchase a Seeds Pack (${SEED_PACK_ITEM.priceCorn.toLocaleString("en-US")} $CORN). It goes straight into your inventory.`,
    target: "shop-buy",
  },
  {
    kind: "interactive",
    title: "Open your pack",
    body: "Click the Seeds Pack in your inventory at the bottom of the screen.",
    target: "inventory-pack",
  },
  {
    kind: "interactive",
    title: "Confirm opening",
    body: "Confirm that you want to open the pack.",
    target: "confirm-open-pack",
  },
  {
    kind: "interactive",
    title: "Collect your seeds",
    body: "Send the revealed seeds to your inventory.",
    target: "send-to-inventory",
  },
  {
    kind: "interactive",
    title: "Select a seed",
    body: "Click one of your corn seeds in the inventory to equip it for planting.",
    target: "inventory-seed",
  },
  {
    kind: "interactive",
    title: "Plant the seed",
    body: "Click a glowing furrow on the top row to plant your seed.",
    target: "furrow",
  },
  {
    kind: "interactive",
    title: "Harvest your crop",
    body: "Wait for the crop to finish growing. You earn $CORN and XP automatically when a cycle completes.",
    target: "furrow",
  },
  {
    kind: "info",
    title: "Weather system",
    body: `Every ${weatherCycleMinutes} minutes the weather wheel spins and picks a random climate (Sunny ${WEATHER_ROLL_WEIGHTS.sunny}%, Rain ${WEATHER_ROLL_WEIGHTS.rain}%, Snow ${WEATHER_ROLL_WEIGHTS.snow}%, Wind ${WEATHER_ROLL_WEIGHTS.wind}%). Rain: +${rainBonusPct}% growth and $CORN. Snow: −${snowPenaltyPct}% growth. Wind: mature crops (${windTempestPct}%+ cycle) sway; small uproot chance with seed returned. Effects apply only while the tab is open. Countdown shows time until the next spin.`,
  },
  {
    kind: "info",
    title: "Offline growth",
    body: `Crops keep growing for up to ${offlineCapHours} hours while you are away. Weather modifiers do not apply offline — only standard growth rates.`,
  },
  {
    kind: "info",
    title: "Wallet mode & treasury",
    body: `Demo mode uses browser saves and only row ${DEMO_MAX_PLOT_ID + 1}. Wallet mode syncs to your address, enables the weekly leaderboard, and treasury deposit/withdraw. Withdrawals unlock at level ${WITHDRAW_MIN_LEVEL}. Deposit SPL $CORN to play; withdraw earned $CORN back on-chain when eligible.`,
  },
  {
    kind: "info",
    title: "Weekly leaderboard",
    body: "Wallet players are ranked by $CORN/h production. Rankings reset every Monday 00:00 UTC. Open the game menu → Weekly rank for standings and prizes paid from the treasury.",
  },
  {
    kind: "complete",
    title: "You're ready to farm!",
    body: "You know the loop and the systems around it. Keep planting, watch the weather, unlock rows, and grow your $CORN empire. Press Tutorial anytime at the bottom right to review this guide.",
  },
];

export const TUTORIAL_STEPS: TutorialStepConfig[] = TUTORIAL_STEP_ORDER.map(
  (id, index) => ({
    id,
    ...TUTORIAL_STEP_CONTENT[index],
  }),
);

const PROGRESS_STEP_COUNT = TUTORIAL_STEP_ORDER.filter((id) => id !== "done").length;

export function getTutorialStepLabel(stepId: TutorialStepId): string {
  if (stepId === "done") return "Complete";
  const index = TUTORIAL_STEP_ORDER.indexOf(stepId);
  if (index < 0) return "";
  return `${index + 1} / ${PROGRESS_STEP_COUNT}`;
}

export function getTutorialStepConfig(stepId: TutorialStepId): TutorialStepConfig & {
  stepLabel: string;
} {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === stepId) ?? TUTORIAL_STEPS[0];
  return { ...step, stepLabel: getTutorialStepLabel(stepId) };
}

export function isInteractiveTutorialStep(stepId: TutorialStepId): boolean {
  return getTutorialStepConfig(stepId).kind === "interactive";
}

export function loadTutorialCompleted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "completed";
  } catch {
    return false;
  }
}

export function saveTutorialCompleted() {
  localStorage.setItem(TUTORIAL_STORAGE_KEY, "completed");
}

export function clearTutorialCompleted() {
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
}
