import { NextResponse } from "next/server";
import {
  describeTreasuryIssue,
  getTreasuryLiveStatus,
} from "@/lib/treasurySetup";

export const runtime = "nodejs";

/** On-chain treasury health check — use after wiring pump.fun test token CA. */
export async function GET() {
  try {
    const status = await getTreasuryLiveStatus();
    const issueMessages = status.issues.map((issue) => ({
      code: issue,
      message: describeTreasuryIssue(issue),
    }));

    return NextResponse.json({ ...status, issueMessages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Treasury status check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
