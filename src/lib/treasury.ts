// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import {
  Connection,
  PublicKey,
  Transaction,
  type TransactionSignature,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import {
  cornToRawAmount,
  getCornMintPublicKey,
  MIN_DEPOSIT_CORN,
  MIN_WITHDRAW_CORN,
  rawAmountToCorn,
  WITHDRAW_COOLDOWN_MS,
  WITHDRAW_MIN_LEVEL,
  getTreasuryPublicKey,
} from "./treasuryConfig";
import {
  getCornAssociatedTokenAddress,
  getResolvedMintTokenProgramId,
} from "./splToken";

export type TreasuryBlockReason =
  | "wallet-not-connected"
  | "treasury-not-configured"
  | "mint-not-configured"
  | "invalid-deposit-amount"
  | "invalid-withdraw-amount"
  | "level-too-low"
  | "insufficient-corn"
  | "cooldown-active"
  | "demo-mode";

export async function buildCornDepositTransaction(
  connection: Connection,
  fromPubkey: PublicKey,
  treasuryPubkey: PublicKey,
  depositCorn: number,
): Promise<Transaction> {
  const mintPubkey = getCornMintPublicKey();
  if (!mintPubkey) {
    throw new Error("$CORN mint is not configured.");
  }

  if (!Number.isFinite(depositCorn) || depositCorn < MIN_DEPOSIT_CORN) {
    throw new Error(`Minimum deposit is ${MIN_DEPOSIT_CORN} $CORN.`);
  }

  const programId = getResolvedMintTokenProgramId();
  const senderAta = getCornAssociatedTokenAddress(mintPubkey, fromPubkey, programId);
  const treasuryAta = getCornAssociatedTokenAddress(
    mintPubkey,
    treasuryPubkey,
    programId,
  );
  const amountRaw = cornToRawAmount(depositCorn);

  const transaction = new Transaction();

  transaction.add(
    createAssociatedTokenAccountIdempotentInstruction(
      fromPubkey,
      treasuryAta,
      treasuryPubkey,
      mintPubkey,
      programId,
    ),
  );

  transaction.add(
    createTransferInstruction(
      senderAta,
      treasuryAta,
      fromPubkey,
      amountRaw,
      [],
      programId,
    ),
  );

  return transaction;
}

export type ParsedCornDeposit = {
  amount: number;
  amountRaw: bigint;
};

type TokenBalanceEntry = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: { amount: string };
};

function parseDepositFromMeta(
  pre: TokenBalanceEntry[],
  post: TokenBalanceEntry[],
  accountKeys: string[],
  mint: string,
  sender: string,
  treasury: string,
  treasuryAta: string,
): ParsedCornDeposit | null {
  const sumMintBalance = (
    balances: TokenBalanceEntry[],
    filter: (entry: TokenBalanceEntry) => boolean,
  ) =>
    balances
      .filter((entry) => entry.mint === mint && filter(entry))
      .reduce((sum, entry) => sum + BigInt(entry.uiTokenAmount.amount), BigInt(0));

  const treasuryDeltaByOwner =
    sumMintBalance(post, (entry) => entry.owner === treasury) -
    sumMintBalance(pre, (entry) => entry.owner === treasury);

  const treasuryDeltaByAta =
    sumMintBalance(
      post,
      (entry) => accountKeys[entry.accountIndex] === treasuryAta,
    ) -
    sumMintBalance(
      pre,
      (entry) => accountKeys[entry.accountIndex] === treasuryAta,
    );

  const treasuryDelta =
    treasuryDeltaByAta > BigInt(0) ? treasuryDeltaByAta : treasuryDeltaByOwner;

  const senderDelta =
    sumMintBalance(post, (entry) => entry.owner === sender) -
    sumMintBalance(pre, (entry) => entry.owner === sender);

  if (treasuryDelta <= BigInt(0) || senderDelta >= BigInt(0)) return null;
  if (treasuryDelta !== -senderDelta) return null;

  const amount = rawAmountToCorn(treasuryDelta);
  if (amount < MIN_DEPOSIT_CORN) return null;

  return { amount, amountRaw: treasuryDelta };
}

/** Read deposit amount from an on-chain treasury transfer (signature only). */
export async function parseCornDepositFromTransaction(
  connection: Connection,
  signature: TransactionSignature,
  expectedSender: PublicKey,
  treasuryPubkey: PublicKey,
  maxRetries = 12,
): Promise<ParsedCornDeposit | null> {
  const mintPubkey = getCornMintPublicKey();
  if (!mintPubkey) return null;

  const mint = mintPubkey.toBase58();
  const sender = expectedSender.toBase58();
  const treasury = treasuryPubkey.toBase58();
  const programId = getResolvedMintTokenProgramId();
  const treasuryAta = getCornAssociatedTokenAddress(
    mintPubkey,
    treasuryPubkey,
    programId,
  ).toBase58();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (response?.meta && !response.meta.err) {
      const accountKeys = response.transaction.message
        .getAccountKeys()
        .staticAccountKeys.map((key) => key.toBase58());

      const parsed = parseDepositFromMeta(
        response.meta.preTokenBalances ?? [],
        response.meta.postTokenBalances ?? [],
        accountKeys,
        mint,
        sender,
        treasury,
        treasuryAta,
      );

      if (parsed) return parsed;
    }

    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return null;
}

export async function verifyCornDepositTransaction(
  connection: Connection,
  signature: TransactionSignature,
  expectedSender: PublicKey,
  treasuryPubkey: PublicKey,
  expectedCorn: number,
  maxRetries = 10,
): Promise<boolean> {
  const parsed = await parseCornDepositFromTransaction(
    connection,
    signature,
    expectedSender,
    treasuryPubkey,
    maxRetries,
  );

  if (!parsed) return false;
  return parsed.amountRaw >= cornToRawAmount(expectedCorn);
}

export function getWithdrawBlockReason(
  playerLevel: number,
  corn: number,
  lastWithdrawAt: number,
  now: number,
  withdrawCorn: number,
): TreasuryBlockReason | null {
  if (playerLevel < WITHDRAW_MIN_LEVEL) return "level-too-low";
  if (!Number.isFinite(withdrawCorn) || withdrawCorn < MIN_WITHDRAW_CORN) {
    return "invalid-withdraw-amount";
  }
  if (corn < withdrawCorn) return "insufficient-corn";

  if (lastWithdrawAt > 0 && now - lastWithdrawAt < WITHDRAW_COOLDOWN_MS) {
    return "cooldown-active";
  }

  return null;
}

export function getWithdrawCooldownRemaining(
  lastWithdrawAt: number,
  now: number,
): number {
  if (lastWithdrawAt <= 0) return 0;
  return Math.max(0, WITHDRAW_COOLDOWN_MS - (now - lastWithdrawAt));
}

export function getTreasuryBlockMessage(reason: TreasuryBlockReason): string {
  switch (reason) {
    case "wallet-not-connected":
      return "Connect your wallet to use the treasury.";
    case "treasury-not-configured":
      return "Treasury is not configured yet. Set NEXT_PUBLIC_TREASURY_PUBKEY.";
    case "mint-not-configured":
      return "$CORN mint is not configured. Set NEXT_PUBLIC_CORN_MINT.";
    case "invalid-deposit-amount":
      return `Enter at least ${MIN_DEPOSIT_CORN} $CORN to deposit.`;
    case "invalid-withdraw-amount":
      return `Enter at least ${MIN_WITHDRAW_CORN} $CORN to withdraw.`;
    case "demo-mode":
      return "Switch to wallet mode to deposit or withdraw.";
    case "level-too-low":
      return `Reach level ${WITHDRAW_MIN_LEVEL} to unlock withdrawals. The treasury needs time for team seeding and player deposits before SPL can leave the pool.`;
    case "insufficient-corn":
      return "Not enough in-game $CORN for this withdrawal.";
    case "cooldown-active":
      return "Withdrawal cooldown is still active.";
    default:
      return "This action is not available right now.";
  }
}

export function assertTreasuryReady(): PublicKey {
  const treasuryPubkey = getTreasuryPublicKey();
  if (!treasuryPubkey) {
    throw new Error("Treasury public key is not configured.");
  }
  return treasuryPubkey;
}
