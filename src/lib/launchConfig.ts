// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { PublicKey } from "@solana/web3.js";

/** Production treasury — same wallet as test; only the mint CA changes at launch. */
export const LAUNCH_TREASURY_PUBKEY =
  "AXp2F7NP3cKU7nP8HXXL1XKuSrj1JeAYj2im4JKvNyvj";

/** True when NEXT_PUBLIC_CORN_MINT is a valid base58 address (not a URL). */
export function isValidCornMintConfigured(): boolean {
  const mint = process.env.NEXT_PUBLIC_CORN_MINT?.trim();
  if (!mint) return false;
  if (mint.startsWith("http://") || mint.startsWith("https://")) return false;

  try {
    new PublicKey(mint);
    return true;
  } catch {
    return false;
  }
}

/**
 * Wallet mode opens automatically once the official mint CA is wired.
 * Set NEXT_PUBLIC_WALLET_MODE_ENABLED=false to force it closed (emergency only).
 */
export function isWalletModeEnabled(): boolean {
  const override = process.env.NEXT_PUBLIC_WALLET_MODE_ENABLED?.trim().toLowerCase();
  if (override === "false") return false;
  return isValidCornMintConfigured();
}

/** User-facing copy while wallet mode / on-chain $CORN are not live yet. */
export const LAUNCH_COPY = {
  walletModeBlockedTitle: "Wallet mode opens ~10 minutes after launch",
  walletModeBlockedBody:
    "We're funding the treasury wallet and wiring the official pump.fun $CORN token into the game. Demo mode is available now — check back shortly after launch.",
  walletBannerTitle: "Wallet mode opens ~10 minutes after launch",
  walletBannerBody:
    "We're funding the treasury and connecting the official pump.fun $CORN token. Wallet mode unlocks automatically once everything is live.",
  treasuryPanelLead:
    "Treasury deposits and withdrawals are paused until the official $CORN token is connected and wallet mode is enabled.",
  loginWalletSubtitle:
    "Wallet mode is closed until we fund the treasury and connect the official $CORN token (~10 minutes after launch).",
  loginWalletCardDescription: "Opens ~10 min after launch",
  walletCardLockedCta: "Coming soon",
} as const;
