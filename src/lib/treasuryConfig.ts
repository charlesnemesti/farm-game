// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { STORAGE_PREFIX } from "./brandConfig";

export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet";

export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Minimum in-game $CORN that can be deposited per transaction. */
export const MIN_DEPOSIT_CORN = 1;

/** Minimum in-game $CORN that can be withdrawn per transaction. */
export const MIN_WITHDRAW_CORN = 1;

/** SPL token decimals for $CORN (override via env). */
export const CORN_DECIMALS = Number(process.env.NEXT_PUBLIC_CORN_DECIMALS ?? 6);

export const WITHDRAW_MIN_LEVEL = 10;
export const WITHDRAW_COOLDOWN_MS = 8 * 60 * 60 * 1000;

export const TREASURY_STORAGE_KEY = `${STORAGE_PREFIX}-treasury-v1`;

/** Tokenomics aligned with a pump.fun fair-launch memecoin + in-game treasury loop. */
export const TOKENOMICS = {
  totalSupply: 1_000_000_000,
  symbol: "$CORN",
  launchPlatform: "pump.fun",
  launchSummary:
    "$CORN launches as a fair pump.fun token — 1 billion supply on the bonding curve, no team pre-mine or hidden mint.",
  graduation:
    "When the curve completes, liquidity migrates to a DEX pool. Trading continues on the open market after graduation.",
  treasury: {
    manualSeed:
      "At launch, the team manually purchases $CORN on pump.fun and transfers it to the treasury wallet to seed initial withdrawals.",
    organicGrowth:
      "Every wallet-mode deposit sends SPL $CORN straight to the same treasury wallet, refilling the pool as players join.",
    backsWithdrawals:
      "The treasury holds real SPL $CORN that backs 1:1 in-game withdrawals to player wallets.",
    withdrawGateReason: `Withdrawals unlock at level ${WITHDRAW_MIN_LEVEL} so the treasury cannot be drained by instant farmers before the team seeds it and organic deposits accumulate.`,
  },
  playerFlow: [
    {
      label: "Buy on pump.fun",
      detail: "Acquire $CORN from the bonding curve (or DEX after graduation).",
    },
    {
      label: "Deposit to play",
      detail: "Send SPL $CORN to the treasury — credited 1:1 as in-game balance.",
    },
    {
      label: "Spend in-game",
      detail: "Seed packs, row unlocks, and future sinks keep $CORN circulating in the economy.",
    },
    {
      label: "Farm & withdraw",
      detail: `Earn $CORN by growing crops. Withdraw SPL to your wallet once you reach level ${WITHDRAW_MIN_LEVEL}.`,
    },
  ],
  sinks: [
    "Seed pack purchases (in-game $CORN)",
    "Plot row unlocks (progressive $CORN costs)",
    "Future premium packs and seasonal events",
  ],
  risks: [
    "Treasury balance depends on team seeding + player deposits — verify the wallet on Solscan before large withdrawals.",
    "In-game $CORN is a custodied balance linked to your wallet; only SPL in the treasury can be withdrawn on-chain.",
  ],
} as const;

export function getSolanaCluster(): SolanaCluster {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER?.trim();
  if (cluster === "devnet" || cluster === "testnet" || cluster === "mainnet-beta") {
    return cluster;
  }
  return "mainnet-beta";
}

export function getSolanaRpcEndpoint(): string {
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL.trim();
  }
  return clusterApiUrl(getSolanaCluster());
}

export function getCornMintAddress(): string | null {
  const mint = process.env.NEXT_PUBLIC_CORN_MINT?.trim();
  return mint || null;
}

export function getCornMintPublicKey(): PublicKey | null {
  const address = getCornMintAddress();
  if (!address) return null;

  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

export function cornToRawAmount(corn: number): bigint {
  const factor = 10 ** CORN_DECIMALS;
  return BigInt(Math.round(corn * factor));
}

export function rawAmountToCorn(raw: bigint): number {
  const factor = 10 ** CORN_DECIMALS;
  return Number(raw) / factor;
}

export function formatCornAmount(corn: number): string {
  return `${corn.toLocaleString("en-US")} $CORN`;
}

export function getTreasuryPublicKey(): PublicKey | null {
  const address = process.env.NEXT_PUBLIC_TREASURY_PUBKEY?.trim();
  if (!address) return null;

  try {
    return new PublicKey(address);
  } catch {
    return null;
  }
}

export function getClusterLabel(): string {
  const cluster = getSolanaCluster();
  if (cluster === "mainnet-beta") return "Solana Mainnet";
  if (cluster === "devnet") return "Solana Devnet";
  return "Solana Testnet";
}

export function formatSolAmount(sol: number): string {
  return `${sol.toLocaleString("en-US", { maximumFractionDigits: 2 })} SOL`;
}

export function formatCooldown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
