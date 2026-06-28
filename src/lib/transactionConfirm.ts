// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import type { Connection, TransactionSignature } from "@solana/web3.js";

const DEFAULT_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 1_500;

/** Poll signature status — avoids confirmTransaction hanging on HTTP RPC proxies. */
export async function waitForSignatureConfirmation(
  connection: Connection,
  signature: TransactionSignature,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const response = await connection.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const status = response.value[0];

    if (status?.err) {
      throw new Error("Transaction failed on-chain.");
    }

    if (
      status?.confirmationStatus === "confirmed" ||
      status?.confirmationStatus === "finalized"
    ) {
      return;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  const tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (tx?.meta && !tx.meta.err) return;

  throw new Error(
    "Transaction confirmation timed out. If tokens left your wallet, refresh and contact support.",
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
