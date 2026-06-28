// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { CURRENCY_TICKER, GAME_NAME } from "./brandConfig";

/** Public social endpoints — update before launch. */
export const SOCIAL_LINKS = {
  x: "https://x.com/SolanaCornFarm",
  discord: "https://discord.gg/cornfarm",
} as const;

export const LOGIN_VIDEO_SRC = "/login.mp4";

export const LOGIN_TAGLINE = `Grow. Harvest. Earn ${CURRENCY_TICKER} on Solana.`;

export const LOGIN_FEATURES = [
  { label: "On-chain treasury", icon: "◈" },
  { label: "Weekly leaderboard", icon: "▲" },
  { label: "Dynamic weather", icon: "☁" },
  { label: "Solana mainnet", icon: "◎" },
] as const;

export const LOGIN_COPY = {
  heroSubtitle: "The Web3 farm sim built for collectors, grinders, and degens.",
  panelTitle: "Select your path",
  panelSubtitle:
    "Jump in instantly with Demo, or connect a wallet for the full on-chain experience.",
  walletTitle: "Wallet mode",
  walletSubtitle:
    "Server-side save, leaderboard rank, and treasury withdrawals on Solana mainnet.",
  demoTitle: "Demo mode",
  demoDescription: "Row 1 · Local save · No withdrawals",
  walletCardTitle: "Wallet mode",
  walletCardDescription: "Full farm · Server save · Treasury",
  connectCta: "Connect wallet",
  connectingCta: "Connecting…",
  demoCta: "Play demo",
  switchToDemo: "Try demo instead",
  backToSelect: "Back to mode select",
  communityLabel: "Join the community",
  docsLabel: "Docs",
  tokenomicsLabel: "Tokenomics",
  copyright: `© ${new Date().getFullYear()} ${GAME_NAME}. All rights reserved.`,
} as const;

/** Decorative floating particles (percent positions). */
export const LOGIN_PARTICLES = [
  { x: 8, y: 18, size: 3, delay: 0 },
  { x: 92, y: 12, size: 2, delay: 1.2 },
  { x: 15, y: 72, size: 2, delay: 0.6 },
  { x: 78, y: 68, size: 4, delay: 2.1 },
  { x: 44, y: 8, size: 2, delay: 0.3 },
  { x: 62, y: 88, size: 3, delay: 1.8 },
  { x: 28, y: 42, size: 2, delay: 2.6 },
  { x: 85, y: 38, size: 2, delay: 0.9 },
  { x: 52, y: 55, size: 2, delay: 3.2 },
  { x: 6, y: 48, size: 3, delay: 1.5 },
] as const;
