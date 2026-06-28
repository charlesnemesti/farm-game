import { NextResponse } from "next/server";
import { getTreasuryPublicConfig } from "@/lib/treasurySetup";

export const runtime = "nodejs";

/** Public treasury config for the client (no secrets). */
export async function GET() {
  return NextResponse.json(getTreasuryPublicConfig());
}
