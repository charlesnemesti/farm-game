import { NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import {
  cornToRawAmount,
  getCornMintPublicKey,
  MIN_WITHDRAW_CORN,
  WITHDRAW_COOLDOWN_MS,
  getSolanaRpcEndpoint,
} from "@/lib/treasuryConfig";
import { loadTreasuryKeypair } from "@/lib/treasuryServer";
import {
  getCornAssociatedTokenAddress,
  resolveMintTokenProgram,
} from "@/lib/splToken";

export const runtime = "nodejs";

const withdrawalTimestamps = new Map<string, number>();

type WithdrawRequest = {
  wallet?: string;
  corn?: number;
};

function parseWalletAddress(value: string | undefined): PublicKey | null {
  if (!value) return null;

  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: WithdrawRequest;

  try {
    body = (await request.json()) as WithdrawRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const destination = parseWalletAddress(body.wallet);
  if (!destination) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  const withdrawCorn = body.corn;
  if (
    typeof withdrawCorn !== "number" ||
    !Number.isFinite(withdrawCorn) ||
    withdrawCorn < MIN_WITHDRAW_CORN
  ) {
    return NextResponse.json(
      { error: `Minimum withdrawal is ${MIN_WITHDRAW_CORN} $CORN.` },
      { status: 400 },
    );
  }

  const mintPubkey = getCornMintPublicKey();
  if (!mintPubkey) {
    return NextResponse.json({ error: "$CORN mint is not configured." }, { status: 503 });
  }

  const treasuryKeypair = loadTreasuryKeypair();
  if (!treasuryKeypair) {
    return NextResponse.json(
      { error: "Treasury signer is not configured on the server." },
      { status: 503 },
    );
  }

  const walletKey = destination.toBase58();
  const lastWithdrawAt = withdrawalTimestamps.get(walletKey) ?? 0;
  const now = Date.now();

  if (lastWithdrawAt > 0 && now - lastWithdrawAt < WITHDRAW_COOLDOWN_MS) {
    return NextResponse.json(
      {
        error: "Withdrawal cooldown is still active.",
        remainingMs: WITHDRAW_COOLDOWN_MS - (now - lastWithdrawAt),
      },
      { status: 429 },
    );
  }

  const connection = new Connection(getSolanaRpcEndpoint(), "confirmed");
  const treasuryPubkey = treasuryKeypair.publicKey;
  const { programId } = await resolveMintTokenProgram(connection, mintPubkey);
  const treasuryAta = getCornAssociatedTokenAddress(
    mintPubkey,
    treasuryPubkey,
    programId,
  );
  const destinationAta = getCornAssociatedTokenAddress(
    mintPubkey,
    destination,
    programId,
  );
  const amountRaw = cornToRawAmount(withdrawCorn);

  const solBalance = await connection.getBalance(treasuryPubkey);
  if (solBalance < 10_000) {
    return NextResponse.json(
      { error: "Treasury does not have enough SOL for transaction fees." },
      { status: 503 },
    );
  }

  try {
    const treasuryToken = await getAccount(connection, treasuryAta, undefined, programId);
    if (BigInt(treasuryToken.amount) < amountRaw) {
      return NextResponse.json(
        { error: "Treasury does not have enough $CORN for this withdrawal." },
        { status: 503 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Treasury $CORN token account is not set up yet." },
      { status: 503 },
    );
  }

  try {
    const transaction = new Transaction();

    const destinationAtaInfo = await connection.getAccountInfo(destinationAta);
    if (!destinationAtaInfo) {
      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(
          treasuryPubkey,
          destinationAta,
          destination,
          mintPubkey,
          programId,
        ),
      );
    }

    transaction.add(
      createTransferInstruction(
        treasuryAta,
        destinationAta,
        treasuryPubkey,
        amountRaw,
        [],
        programId,
      ),
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasuryKeypair],
      { commitment: "confirmed" },
    );

    withdrawalTimestamps.set(walletKey, now);

    return NextResponse.json({ signature, corn: withdrawCorn });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Withdrawal transaction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
