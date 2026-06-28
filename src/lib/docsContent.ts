// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Central copy and figures for the public Docs page.

import { GAME_NAME } from "./brandConfig";
import { OFFLINE_HARVEST_CAP_MS } from "./harvestProgress";
import { INVENTORY_SLOT_COUNT } from "./inventoryBoard";
import { STARTING_CORN, WALLET_STARTING_CORN } from "./gameState";
import { PLOT_COUNT, SLOTS_PER_PLOT } from "./plotBoard";
import { PLOT_ROW_UNLOCKS } from "./plotUnlock";
import { DEMO_MAX_PLOT_ID } from "./playMode";
import {
  RARITY_DROP_WEIGHTS,
  SEEDS_PER_PACK,
  SEED_STATS,
  formatHarvestCycle,
} from "./seedConfig";
import { SEED_PACK_ITEM } from "./shopConfig";
import {
  WITHDRAW_MIN_LEVEL,
  WITHDRAW_COOLDOWN_MS,
  TOKENOMICS,
  formatCooldown,
} from "./treasuryConfig";
import { WEEKLY_PRIZE_TIERS } from "./leaderboard";
import { XP_PER_CYCLE, XP_PER_LEVEL_STEP, xpToReachLevel } from "./levelConfig";
import {
  WEATHER_CYCLE_MS,
  WEATHER_ROLL_WEIGHTS,
  WEATHER_SPIN_DURATION_MS,
  WEATHER_SPIN_SCALE,
} from "./weatherConfig";
import { WEATHER_EFFECTS } from "./weatherEffects";
import { WIND_TEMPEST_MIN_PROGRESS } from "./plantSprites";

export type DocsSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: { title: string; body: string }[];
};

export type DocsNavGroup = {
  label: string;
  items: { id: string; label: string }[];
};

export const DOCS_NAV_GROUPS: DocsNavGroup[] = [
  {
    label: "Introduction",
    items: [
      { id: "overview", label: "Overview" },
      { id: "getting-started", label: "Getting started" },
    ],
  },
  {
    label: "Gameplay",
    items: [
      { id: "gameplay-loop", label: "Core loop" },
      { id: "farm-plots", label: "Farm & plots" },
      { id: "seeds-crops", label: "Seeds & crops" },
      { id: "inventory-shop", label: "Inventory & shop" },
      { id: "weather", label: "Weather system" },
      { id: "progression", label: "XP & levels" },
      { id: "offline", label: "Offline growth" },
    ],
  },
  {
    label: "Economy",
    items: [
      { id: "tokenomics", label: "$CORN & tokenomics" },
      { id: "economy-reference", label: "Economy reference" },
      { id: "treasury", label: "Treasury" },
      { id: "leaderboard", label: "Weekly leaderboard" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "ui-controls", label: "UI & controls" },
      { id: "on-chain", label: "On-chain addresses" },
      { id: "risks", label: "Risks & FAQ" },
    ],
  },
];

export const DOCS_NAV = DOCS_NAV_GROUPS.flatMap((group) => group.items);

const offlineCapHours = OFFLINE_HARVEST_CAP_MS / (60 * 60 * 1000);
const weatherCycleMinutes = WEATHER_CYCLE_MS / (60 * 1000);
const windTempestProgressPct = Math.round(WIND_TEMPEST_MIN_PROGRESS * 100);
const windUprootIntervalSec =
  (WEATHER_EFFECTS.wind.uprootCheckIntervalMs ?? 45_000) / 1000;
const windUprootChancePct = Math.round(
  (WEATHER_EFFECTS.wind.uprootChance ?? 0.015) * 1000,
) / 10;

export const DOCS_SECTIONS: DocsSection[] = [
  {
    id: "overview",
    title: "Overview",
    paragraphs: [
      `${GAME_NAME} is a Web3 farm game on Solana. Plant corn seeds, harvest $CORN, unlock more land, and compete on the weekly production leaderboard.`,
      "The in-game currency is $CORN — a fair-launch memecoin on pump.fun. Wallet mode links your on-chain balance to a custodied in-game balance backed by the treasury.",
    ],
  },
  {
    id: "getting-started",
    title: "Getting started",
    subsections: [
      {
        title: "Demo mode",
        body: `Free to try with ${STARTING_CORN.toLocaleString("en-US")} starting $CORN. Progress saves in your browser. Only row 1 (plot ${DEMO_MAX_PLOT_ID + 1}) is available — extra rows and treasury withdrawals require wallet mode.`,
      },
      {
        title: "Wallet mode",
        body: `Connect a Solana wallet (e.g. Phantom). You start with ${WALLET_STARTING_CORN} in-game $CORN until you deposit SPL $CORN from your wallet. Progress syncs to your wallet address. Required for treasury deposit/withdraw and the weekly leaderboard.`,
      },
      {
        title: "First steps",
        body: "Complete the tutorial if prompted. Buy a Seeds Pack from the villager shop, open it in your inventory, plant seeds on empty furrows, and wait for harvest cycles to complete automatically.",
      },
    ],
  },
  {
    id: "gameplay-loop",
    title: "Core gameplay loop",
    bullets: [
      "Earn or deposit $CORN",
      "Buy Seeds Packs from the seed shop NPC",
      "Open packs in your inventory to reveal 3 random seeds",
      "Select a seed and plant it on an empty plot slot",
      "Crops grow automatically and pay $CORN + XP each cycle",
      "Reinvest in more packs, unlock rows, and expand production",
    ],
  },
  {
    id: "farm-plots",
    title: "Farm & plots",
    paragraphs: [
      `The farm has ${PLOT_COUNT} rows × ${SLOTS_PER_PLOT} slots = ${PLOT_COUNT * SLOTS_PER_PLOT} planting spaces. Row 1 is free; additional rows unlock in order.`,
    ],
    subsections: PLOT_ROW_UNLOCKS.map((row) => ({
      title: `Row ${row.plotId + 1}`,
      body: `Requires player level ${row.minLevel} and ${row.cornCost.toLocaleString("en-US")} $CORN.`,
    })),
    bullets: [
      "Click a planted crop to uproot it (manual uproot does not return the seed).",
      "Demo mode cannot unlock rows beyond the starter row.",
    ],
  },
  {
    id: "seeds-crops",
    title: "Seeds & crops",
    paragraphs: [
      `Each Seeds Pack costs ${SEED_PACK_ITEM.priceCorn.toLocaleString("en-US")} $CORN and contains ${SEEDS_PER_PACK} seeds with random rarity.`,
      `Drop rates: Common ${RARITY_DROP_WEIGHTS.common}%, Rare ${RARITY_DROP_WEIGHTS.rare}%, Epic ${RARITY_DROP_WEIGHTS.epic}%.`,
    ],
    subsections: (["common", "rare", "epic"] as const).map((rarity) => ({
      title: rarity.charAt(0).toUpperCase() + rarity.slice(1),
      body: `${SEED_STATS[rarity].description} Cycle: ${formatHarvestCycle(SEED_STATS[rarity].harvestCycleSeconds)}. Reward: ${SEED_STATS[rarity].cornPerCycle} $CORN per cycle.`,
    })),
    bullets: [
      "Harvests complete automatically — no click required.",
      "Production per hour is shown in the game menu Stats section.",
      "Rare seeds glow blue; Epic seeds glow purple on the farm.",
    ],
  },
  {
    id: "inventory-shop",
    title: "Inventory & shop",
    paragraphs: [
      `Your backpack has ${INVENTORY_SLOT_COUNT} slots. Drag items to reorganize. Seed packs must be opened before planting.`,
      "The seed shop is marked on the farm — talk to the villager NPC to buy Seeds Packs.",
    ],
  },
  {
    id: "weather",
    title: "Weather system",
    paragraphs: [
      `Every ${weatherCycleMinutes} minutes the weather wheel spins (${Math.round(WEATHER_SPIN_SCALE * 100)}% size, ${WEATHER_SPIN_DURATION_MS / 1000}s animation) and randomly picks the next climate. A countdown below the wheel shows time until the next spin.`,
      `Roll odds: Sunny ${WEATHER_ROLL_WEIGHTS.sunny}%, Rain ${WEATHER_ROLL_WEIGHTS.rain}%, Snow ${WEATHER_ROLL_WEIGHTS.snow}%, Wind ${WEATHER_ROLL_WEIGHTS.wind}%.`,
      "Weather gameplay effects apply only while you are actively playing with the game tab open and visible. Your current weather is saved in the browser and survives page refreshes.",
      "Tap the ? button beside the wheel for a quick summary. Full rules are in Docs (header link).",
    ],
    subsections: [
      {
        title: "Sunny",
        body: "Normal growth speed and $CORN rewards.",
      },
      {
        title: "Rain",
        body: `+${Math.round((WEATHER_EFFECTS.rain.growthMultiplier - 1) * 100)}% growth speed and +${Math.round((WEATHER_EFFECTS.rain.cornMultiplier - 1) * 100)}% $CORN per harvest cycle.`,
      },
      {
        title: "Snow",
        body: `−${Math.round((1 - WEATHER_EFFECTS.snow.growthMultiplier) * 100)}% growth speed.`,
      },
      {
        title: "Wind",
        body: `Mature crops (${windTempestProgressPct}%+ cycle progress) switch to a wind-sway sprite. Every ${windUprootIntervalSec}s there is a ${windUprootChancePct}% chance to uproot one crop (max ${WEATHER_EFFECTS.wind.maxUprootsPerWindow} per weather window). The seed returns to your inventory if there is space. Rare and Epic plants keep their blue/purple tint while swaying. Wind uproot is disabled in demo mode.`,
      },
    ],
  },
  {
    id: "progression",
    title: "XP & levels",
    paragraphs: [
      "You earn XP every time a crop completes a harvest cycle. Higher rarity seeds grant more XP per cycle.",
      `Plot rows unlock every 5 levels (${TOKENOMICS.levelProgression.rowUnlockLevels.join(", ")}). Level ${WITHDRAW_MIN_LEVEL} unlocks both SPL withdrawals and row 3 — ${TOKENOMICS.levelProgression.summary}`,
    ],
    bullets: [
      `Common harvest: ${XP_PER_CYCLE.common} XP per cycle`,
      `Rare harvest: ${XP_PER_CYCLE.rare} XP per cycle`,
      `Epic harvest: ${XP_PER_CYCLE.epic} XP per cycle`,
      `XP per level step: ${XP_PER_LEVEL_STEP} (total to reach level 10: ${xpToReachLevel(10).toLocaleString("en-US")} XP)`,
      "Check the menu Stats panel for your current level and progress.",
    ],
  },
  {
    id: "offline",
    title: "Offline growth",
    paragraphs: [
      `Crops keep growing while the tab is closed, up to ${offlineCapHours} hours of accrued harvests. When you return, completed cycles are applied automatically at the standard growth rate.`,
      "Weather modifiers (rain, snow, wind) do not apply while you are away — only sunny baseline growth is used for offline progress.",
    ],
  },
  {
    id: "tokenomics",
    title: "$CORN & tokenomics",
    paragraphs: [
      TOKENOMICS.launchSummary,
      `Total supply: ${TOKENOMICS.totalSupply.toLocaleString("en-US")} ${TOKENOMICS.symbol} on ${TOKENOMICS.launchPlatform}.`,
      TOKENOMICS.graduation,
      `Price anchor at graduation: ~$${TOKENOMICS.priceAnchor.targetMarketCapUsd.toLocaleString("en-US")} market cap → ~$${TOKENOMICS.priceAnchor.tokenPriceAtGraduation} per token → Seeds Pack (${TOKENOMICS.priceAnchor.seedsPackCorn.toLocaleString("en-US")} $CORN) ≈ $${TOKENOMICS.priceAnchor.seedsPackUsdAtGraduation} USD.`,
      "Economy rebalanced June 2026: all in-game $CORN prices and harvest rewards increased ~50% (rounded up to clean numbers). See Economy reference for the full table.",
    ],
    bullets: TOKENOMICS.sinks.map((item) => item),
  },
  {
    id: "economy-reference",
    title: "Economy reference",
    paragraphs: [
      "Current in-game $CORN values (June 2026 balance). Demo mode starts with enough $CORN for two seed packs; wallet mode starts at 0 until you deposit SPL $CORN.",
    ],
    subsections: [
      {
        title: "Starting balances",
        body: `Demo: ${STARTING_CORN.toLocaleString("en-US")} $CORN. Wallet: ${WALLET_STARTING_CORN.toLocaleString("en-US")} $CORN until treasury deposit.`,
      },
      {
        title: "Shop",
        body: `Seeds Pack — ${SEED_PACK_ITEM.priceCorn.toLocaleString("en-US")} $CORN (${SEEDS_PER_PACK} random seeds per pack).`,
      },
      ...PLOT_ROW_UNLOCKS.map((row) => ({
        title: `Row ${row.plotId + 1} unlock`,
        body: `${row.cornCost.toLocaleString("en-US")} $CORN at player level ${row.minLevel}.`,
      })),
      ...(["common", "rare", "epic"] as const).map((rarity) => ({
        title: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} harvest`,
        body: `${SEED_STATS[rarity].cornPerCycle.toLocaleString("en-US")} $CORN per cycle (${formatHarvestCycle(SEED_STATS[rarity].harvestCycleSeconds)}).`,
      })),
      ...WEEKLY_PRIZE_TIERS.map((tier) => ({
        title: tier.prizeLabel,
        body: `${tier.prizeCorn.toLocaleString("en-US")} $CORN weekly prize (treasury payout).`,
      })),
    ],
  },
  {
    id: "treasury",
    title: "Treasury",
    paragraphs: [
      TOKENOMICS.treasury.backsWithdrawals,
      TOKENOMICS.treasury.flowSummary,
      TOKENOMICS.treasury.manualSeed,
      TOKENOMICS.treasury.organicGrowth,
      `Withdrawals unlock at level ${WITHDRAW_MIN_LEVEL}. ${TOKENOMICS.treasury.withdrawGateReason}`,
      `Withdrawal cooldown: ${formatCooldown(WITHDRAW_COOLDOWN_MS)} between on-chain withdrawals.`,
    ],
    bullets: TOKENOMICS.playerFlow.map((step) => `${step.label}: ${step.detail}`),
  },
  {
    id: "leaderboard",
    title: "Weekly leaderboard",
    paragraphs: [
      "Wallet mode players are ranked by $CORN/h production. Rankings reset every Monday 00:00 UTC.",
      "Open the game menu → Weekly rank to view standings and prizes.",
    ],
    subsections: WEEKLY_PRIZE_TIERS.map((tier) => ({
      title: tier.prizeLabel,
      body: `${tier.prizeCorn.toLocaleString("en-US")} $CORN prize (paid from treasury at season end).`,
    })),
  },
  {
    id: "ui-controls",
    title: "UI & controls",
    bullets: [
      "Header: wallet connect, treasury deposit/withdraw, music, Docs link",
      "Top right: $CORN balance, weather wheel, countdown timer, and ? help",
      "Backpack button: open inventory to manage seeds and open packs",
      "Game menu: stats, production rate (with weather modifier), XP, and leaderboard",
      "Plot slots: click empty furrow with a seed selected to plant; click crop to uproot",
      "Drag & drop: move inventory items between slots",
      "Old Mac (farmer NPC): occasional farming tips while he walks the field",
    ],
  },
  {
    id: "risks",
    title: "Risks & FAQ",
    bullets: [
      ...TOKENOMICS.risks,
      "Demo progress is browser-local — clearing site data may reset it.",
      "Wallet progress is tied to your connected address.",
      "Memecoins are volatile — never risk more than you can afford to lose.",
      "Verify treasury and mint addresses on Solscan before large deposits or withdrawals.",
    ],
    subsections: [
      {
        title: "Is demo $CORN real?",
        body: "No. Demo $CORN is practice currency only and cannot be withdrawn.",
      },
      {
        title: "Why is my withdrawal locked?",
        body: `You need player level ${WITHDRAW_MIN_LEVEL} and sufficient in-game balance. The treasury must hold enough SPL $CORN to fulfill the request.`,
      },
      {
        title: "Does weather affect offline farms?",
        body: "No. Weather only applies while you are actively playing with the tab visible.",
      },
      {
        title: "Does weather reset when I refresh?",
        body: "No. Your current weather and countdown are saved locally and restored on load.",
      },
    ],
  },
];
