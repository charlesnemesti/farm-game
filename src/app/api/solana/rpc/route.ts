import { NextResponse } from "next/server";
import { clusterApiUrl } from "@solana/web3.js";
import { getSolanaCluster } from "@/lib/treasuryConfig";

export const runtime = "nodejs";

function getUpstreamRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL?.trim()) {
    return process.env.SOLANA_RPC_URL.trim();
  }
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL.trim();
  }
  return clusterApiUrl(getSolanaCluster());
}

/** Proxies JSON-RPC so the browser avoids public RPC 403 blocks on mainnet. */
export async function POST(request: Request) {
  let body: string;

  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const upstream = getUpstreamRpcUrl();

  try {
    const response = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });

    const payload = await response.text();

    return new NextResponse(payload, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "RPC proxy request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
