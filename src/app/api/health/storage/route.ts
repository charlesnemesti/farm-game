import { NextResponse } from "next/server";
import { getStoreBackend } from "@/lib/serverStore";
import { WALLET_GAME_STORE_FILE } from "@/lib/walletPersistence";
import { LEADERBOARD_STORE_FILE } from "@/lib/leaderboard";

export const runtime = "nodejs";

/** Ops health — confirms persistent store backend (Blob survives Vercel redeploys). */
export async function GET() {
  return NextResponse.json({
    backend: getStoreBackend(),
    persistentOnVercel: getStoreBackend() === "blob",
    stores: [WALLET_GAME_STORE_FILE, LEADERBOARD_STORE_FILE],
    hint:
      getStoreBackend() === "blob"
        ? "Saves persist across redeploys via Vercel Blob."
        : "Using local .data/ — connect Vercel Blob in production.",
  });
}
