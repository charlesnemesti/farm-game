import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  parseCornDepositFromTransaction,
  verifyCornDepositTransaction,
} from "@/lib/treasury";
import {
  cornToRawAmount,
  getCornMintPublicKey,
  getSolanaRpcEndpoint,
  getTreasuryPublicKey,
  MIN_DEPOSIT_CORN,
} from "@/lib/treasuryConfig";

export const runtime = "nodejs";

type DepositVerifyRequest = {
  signature?: string;
  wallet?: string;
  amount?: number;
};

function parsePublicKey(value: string | undefined): PublicKey | null {
  if (!value) return null;
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

/** Server-side deposit verification — amount is read from chain when omitted. */
export async function POST(request: Request) {
  let body: DepositVerifyRequest;

  try {
    body = (await request.json()) as DepositVerifyRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const signature = body.signature?.trim();
  const wallet = parsePublicKey(body.wallet);
  const amount = body.amount;

  if (!signature) {
    return NextResponse.json({ error: "Transaction signature is required." }, { status: 400 });
  }

  if (!wallet) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  const mintPubkey = getCornMintPublicKey();
  const treasuryPubkey = getTreasuryPublicKey();

  if (!mintPubkey || !treasuryPubkey) {
    return NextResponse.json(
      { error: "Treasury or mint is not configured." },
      { status: 503 },
    );
  }

  const connection = new Connection(getSolanaRpcEndpoint(), "confirmed");

  const parsed = await parseCornDepositFromTransaction(
    connection,
    signature,
    wallet,
    treasuryPubkey,
    12,
  );

  if (!parsed) {
    return NextResponse.json(
      {
        verified: false,
        error:
          "Deposit not found on-chain. SPL symbol does not matter — only the configured mint CA counts as in-game $CORN.",
      },
      { status: 422 },
    );
  }

  if (parsed.amount < MIN_DEPOSIT_CORN) {
    return NextResponse.json(
      { error: `Minimum deposit is ${MIN_DEPOSIT_CORN}.` },
      { status: 400 },
    );
  }

  if (
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    cornToRawAmount(amount) !== parsed.amountRaw
  ) {
    const verified = await verifyCornDepositTransaction(
      connection,
      signature,
      wallet,
      treasuryPubkey,
      amount,
      1,
    );

    if (!verified) {
      return NextResponse.json(
        { error: "Provided amount does not match the on-chain transfer." },
        { status: 422 },
      );
    }
  }

  return NextResponse.json({
    verified: true,
    signature,
    amount: parsed.amount,
    creditedAs: "CORN",
  });
}
