import { NextResponse } from "next/server";
import {
  getBlobAuthMode,
  getStoreBackend,
  isEphemeralProductionStore,
} from "@/lib/serverStore";
import { WALLET_GAME_STORE_FILE } from "@/lib/walletPersistence";
import { LEADERBOARD_STORE_FILE } from "@/lib/leaderboard";

export const runtime = "nodejs";

/** Ops health — confirms persistent store backend (Blob survives Vercel redeploys). */
export async function GET() {
  const backend = getStoreBackend();
  const ephemeral = isEphemeralProductionStore();

  return NextResponse.json({
    backend,
    blobAuth: getBlobAuthMode(),
    persistentOnVercel: backend === "blob",
    ephemeralProduction: ephemeral,
    stores: [WALLET_GAME_STORE_FILE, LEADERBOARD_STORE_FILE],
    hint: ephemeral
      ? "CRITICAL: Wallet saves are NOT persisting. Vercel Dashboard → Storage → connect corn-farm-blob to corn-farm → Redeploy."
      : backend === "blob"
        ? "Saves persist across redeploys via Vercel Blob."
        : "Using local .data/ — fine for local dev only.",
  });
}
