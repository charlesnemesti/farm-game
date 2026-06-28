"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/context/GameProvider";
import { usePlayMode } from "@/context/PlayModeProvider";
import {
  MIN_DEPOSIT_CORN,
  MIN_WITHDRAW_CORN,
  WITHDRAW_MIN_LEVEL,
  formatCooldown,
  formatCornAmount,
  getClusterLabel,
  getCornMintPublicKey,
  getTreasuryPublicKey,
} from "@/lib/treasuryConfig";
import {
  buildCornDepositTransaction,
  getTreasuryBlockMessage,
  getWithdrawBlockReason,
  getWithdrawCooldownRemaining,
  verifyCornDepositTransaction,
  type TreasuryBlockReason,
} from "@/lib/treasury";
import { waitForSignatureConfirmation } from "@/lib/transactionConfirm";
import {
  isDepositProcessed,
  loadWalletTreasuryState,
  markDepositProcessed,
  setLastWithdrawAt,
} from "@/lib/treasuryState";

export type TreasuryStatus = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

export function useTreasury() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const { playMode } = usePlayMode();
  const {
    corn,
    playerLevel,
    now,
    hydrated,
    creditTreasuryCorn,
    debitTreasuryCorn,
    flushWalletSave,
  } = useGame();

  const [depositAmount, setDepositAmount] = useState(String(MIN_DEPOSIT_CORN * 100));
  const [withdrawAmount, setWithdrawAmount] = useState(String(MIN_WITHDRAW_CORN * 100));
  const [status, setStatus] = useState<TreasuryStatus>({
    type: "idle",
    message: "",
  });
  const [walletTreasuryState, setWalletTreasuryState] = useState(() =>
    publicKey ? loadWalletTreasuryState(publicKey.toBase58()) : null,
  );
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState<boolean | null>(null);

  const walletAddress = publicKey?.toBase58() ?? null;
  const treasuryPubkey = getTreasuryPublicKey();
  const mintPubkey = getCornMintPublicKey();
  const walletMode = playMode === "wallet";

  const parsedDepositAmount = Number.parseFloat(depositAmount.replace(/,/g, ""));
  const depositAmountValid =
    Number.isFinite(parsedDepositAmount) && parsedDepositAmount >= MIN_DEPOSIT_CORN;

  const parsedWithdrawAmount = Number.parseFloat(withdrawAmount.replace(/,/g, ""));
  const withdrawAmountValid =
    Number.isFinite(parsedWithdrawAmount) && parsedWithdrawAmount >= MIN_WITHDRAW_CORN;

  useEffect(() => {
    if (!walletAddress) {
      setWalletTreasuryState(null);
      return;
    }

    setWalletTreasuryState(loadWalletTreasuryState(walletAddress));
  }, [walletAddress, status.type]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/treasury/config")
      .then((response) => response.json())
      .then((payload: { withdrawalsEnabled?: boolean }) => {
        if (!cancelled) {
          setWithdrawalsEnabled(payload.withdrawalsEnabled === true);
        }
      })
      .catch(() => {
        if (!cancelled) setWithdrawalsEnabled(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const lastWithdrawAt = walletTreasuryState?.lastWithdrawAt ?? 0;
  const withdrawCooldownRemaining = getWithdrawCooldownRemaining(lastWithdrawAt, now);

  const depositBlockReason = useMemo((): TreasuryBlockReason | null => {
    if (!walletMode) return "demo-mode";
    if (!connected || !publicKey) return "wallet-not-connected";
    if (!treasuryPubkey) return "treasury-not-configured";
    if (!mintPubkey) return "mint-not-configured";
    if (!depositAmountValid) return "invalid-deposit-amount";
    return null;
  }, [
    connected,
    depositAmountValid,
    mintPubkey,
    publicKey,
    treasuryPubkey,
    walletMode,
  ]);

  const withdrawBlockReason = useMemo(() => {
    if (!walletMode) return "demo-mode" as TreasuryBlockReason;
    if (!connected || !publicKey) return "wallet-not-connected" as TreasuryBlockReason;
    if (!treasuryPubkey) return "treasury-not-configured" as TreasuryBlockReason;
    if (!mintPubkey) return "mint-not-configured" as TreasuryBlockReason;
    if (withdrawalsEnabled === false) return "withdrawals-disabled" as TreasuryBlockReason;

    return getWithdrawBlockReason(
      playerLevel,
      corn,
      lastWithdrawAt,
      now,
      parsedWithdrawAmount,
    );
  }, [
    connected,
    corn,
    lastWithdrawAt,
    mintPubkey,
    now,
    parsedWithdrawAmount,
    playerLevel,
    publicKey,
    treasuryPubkey,
    walletMode,
    withdrawalsEnabled,
  ]);

  const canDeposit =
    hydrated && depositBlockReason === null && status.type !== "loading";

  const canWithdraw =
    hydrated && withdrawBlockReason === null && status.type !== "loading";

  const deposit = useCallback(async () => {
    if (!publicKey || !treasuryPubkey || !mintPubkey) {
      setStatus({
        type: "error",
        message: getTreasuryBlockMessage("wallet-not-connected"),
      });
      return;
    }

    if (depositBlockReason) {
      setStatus({
        type: "error",
        message: getTreasuryBlockMessage(depositBlockReason),
      });
      return;
    }

    const amount = parsedDepositAmount;

    setStatus({
      type: "loading",
      message: `Sending ${formatCornAmount(amount)} to treasury…`,
    });

    try {
      const transaction = await buildCornDepositTransaction(
        connection,
        publicKey,
        treasuryPubkey,
        amount,
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setStatus({ type: "loading", message: "Confirming deposit on-chain…" });

      try {
        await waitForSignatureConfirmation(connection, signature);
      } catch {
        // Wallet may have confirmed via its own RPC even if our proxy is slow.
        setStatus({
          type: "loading",
          message: "Verifying deposit on-chain…",
        });
      }

      if (isDepositProcessed(publicKey.toBase58(), signature)) {
        setStatus({
          type: "success",
          message: "Deposit already credited for this transaction.",
        });
        return;
      }

      let creditedAmount = amount;
      let verified = false;

      try {
        const verifyResponse = await fetch("/api/treasury/deposit/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signature,
            wallet: publicKey.toBase58(),
          }),
        });

        const verifyPayload = (await verifyResponse.json()) as {
          verified?: boolean;
          amount?: number;
        };

        verified = verifyResponse.ok && verifyPayload.verified === true;
        if (verified && typeof verifyPayload.amount === "number") {
          creditedAmount = verifyPayload.amount;
        }
      } catch {
        verified = false;
      }

      if (!verified) {
        verified = await verifyCornDepositTransaction(
          connection,
          signature,
          publicKey,
          treasuryPubkey,
          amount,
        );
      }

      if (!verified) {
        setStatus({
          type: "error",
          message:
            "Deposit reached the treasury but could not be verified yet. Wait a few seconds and try again — your SPL test token counts as in-game $CORN.",
        });
        return;
      }

      markDepositProcessed(publicKey.toBase58(), signature);
      creditTreasuryCorn(creditedAmount);

      const saved = await flushWalletSave();
      if (!saved.ok) {
        setStatus({
          type: "error",
          message: `${saved.error ?? "Could not save progress."} Your tokens reached the treasury — paste this tx signature under Recover deposit: ${signature}`,
        });
        return;
      }

      setWalletTreasuryState(loadWalletTreasuryState(publicKey.toBase58()));
      setStatus({
        type: "success",
        message: `Deposited ${formatCornAmount(creditedAmount)}. In-game balance updated.`,
      });
    } catch (error) {
      let message =
        error instanceof Error ? error.message : "Deposit failed. Try again.";
      if (message.includes("403") || message.includes("Access forbidden")) {
        message =
          "Solana RPC blocked the request. Refresh the page and try again — requests now route through the server proxy.";
      }
      setStatus({ type: "error", message });
    }
  }, [
    connection,
    creditTreasuryCorn,
    flushWalletSave,
    depositBlockReason,
    mintPubkey,
    parsedDepositAmount,
    publicKey,
    sendTransaction,
    treasuryPubkey,
  ]);

  const withdraw = useCallback(async () => {
    if (!publicKey || !treasuryPubkey || !mintPubkey) {
      setStatus({
        type: "error",
        message: getTreasuryBlockMessage("wallet-not-connected"),
      });
      return;
    }

    if (withdrawBlockReason) {
      setStatus({
        type: "error",
        message: getTreasuryBlockMessage(withdrawBlockReason),
      });
      return;
    }

    const amount = parsedWithdrawAmount;

    if (!debitTreasuryCorn(amount)) {
      setStatus({
        type: "error",
        message: getTreasuryBlockMessage("insufficient-corn"),
      });
      return;
    }

    setStatus({
      type: "loading",
      message: `Withdrawing ${formatCornAmount(amount)}…`,
    });

    try {
      const response = await fetch("/api/treasury/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey.toBase58(), corn: amount }),
      });

      const payload = (await response.json()) as {
        error?: string;
        signature?: string;
        remainingMs?: number;
        corn?: number;
      };

      if (!response.ok) {
        creditTreasuryCorn(amount);

        if (response.status === 429 && payload.remainingMs) {
          setStatus({
            type: "error",
            message: `Withdrawal cooldown active. Try again in ${formatCooldown(payload.remainingMs)}.`,
          });
          return;
        }

        setStatus({
          type: "error",
          message:
            payload.error?.includes("signer") || payload.error?.includes("configured")
              ? getTreasuryBlockMessage("withdrawals-disabled")
              : (payload.error ?? "Withdrawal failed. Your $CORN was restored."),
        });
        return;
      }

      setLastWithdrawAt(publicKey.toBase58(), Date.now());
      setWalletTreasuryState(loadWalletTreasuryState(publicKey.toBase58()));

      setStatus({
        type: "success",
        message: `Withdrew ${formatCornAmount(amount)} SPL to your wallet.`,
      });
    } catch (error) {
      creditTreasuryCorn(amount);
      const message =
        error instanceof Error ? error.message : "Withdrawal failed. Your $CORN was restored.";
      setStatus({ type: "error", message });
    }
  }, [
    creditTreasuryCorn,
    debitTreasuryCorn,
    mintPubkey,
    parsedWithdrawAmount,
    publicKey,
    treasuryPubkey,
    withdrawBlockReason,
  ]);

  const clearStatus = useCallback(() => {
    setStatus({ type: "idle", message: "" });
  }, []);

  const claimDeposit = useCallback(
    async (signature: string) => {
      if (!publicKey || !treasuryPubkey) return;

      const trimmed = signature.trim();
      if (!trimmed) return;

      if (isDepositProcessed(publicKey.toBase58(), trimmed)) {
        setStatus({
          type: "success",
          message: "This deposit was already credited.",
        });
        return;
      }

      setStatus({ type: "loading", message: "Recovering deposit from chain…" });

      try {
        const verifyResponse = await fetch("/api/treasury/deposit/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signature: trimmed,
            wallet: publicKey.toBase58(),
          }),
        });

        const verifyPayload = (await verifyResponse.json()) as {
          verified?: boolean;
          amount?: number;
          error?: string;
        };

        if (!verifyResponse.ok || !verifyPayload.verified || !verifyPayload.amount) {
          setStatus({
            type: "error",
            message:
              verifyPayload.error ??
              "Could not verify that deposit. Check the signature matches your wallet.",
          });
          return;
        }

        markDepositProcessed(publicKey.toBase58(), trimmed);
        creditTreasuryCorn(verifyPayload.amount);
        setWalletTreasuryState(loadWalletTreasuryState(publicKey.toBase58()));
        setStatus({
          type: "success",
          message: `Recovered ${formatCornAmount(verifyPayload.amount)} in-game.`,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Recovery failed.";
        setStatus({ type: "error", message });
      }
    },
    [creditTreasuryCorn, publicKey, treasuryPubkey],
  );

  const withdrawHint = useMemo(() => {
    if (!walletMode) return "Available in wallet mode only.";
    if (!connected) return "Connect your wallet first.";
    if (!treasuryPubkey) return "Treasury wallet is not configured.";
    if (!mintPubkey) return "$CORN mint is not configured.";
    if (withdrawalsEnabled === false) {
      return getTreasuryBlockMessage("withdrawals-disabled");
    }
    if (playerLevel < WITHDRAW_MIN_LEVEL) {
      return `Unlocks at level ${WITHDRAW_MIN_LEVEL} — protects treasury while it is seeded at launch and refilled by deposits. You are level ${playerLevel}.`;
    }
    if (corn < parsedWithdrawAmount) {
      return `Need ${parsedWithdrawAmount.toLocaleString("en-US")} in-game $CORN.`;
    }
    if (withdrawCooldownRemaining > 0) {
      return `Cooldown: ${formatCooldown(withdrawCooldownRemaining)} remaining.`;
    }
    return "Sends SPL $CORN from treasury to your wallet (1:1 in-game debit).";
  }, [
    connected,
    corn,
    mintPubkey,
    parsedWithdrawAmount,
    playerLevel,
    treasuryPubkey,
    walletMode,
    withdrawCooldownRemaining,
    withdrawalsEnabled,
  ]);

  const depositHint = useMemo(() => {
    if (!walletMode) return "Available in wallet mode only.";
    if (!connected) return "Connect your wallet first.";
    if (!treasuryPubkey) return "Treasury wallet is not configured.";
    if (!mintPubkey) return "$CORN mint is not configured.";
    return `Send SPL tokens (${getClusterLabel()}) to the treasury — credited 1:1 as in-game $CORN (min ${MIN_DEPOSIT_CORN}). Test mints work the same as the real $CORN token.`;
  }, [connected, mintPubkey, treasuryPubkey, walletMode]);

  return {
    canDeposit,
    canWithdraw,
    deposit,
    withdraw,
    claimDeposit,
    status,
    clearStatus,
    depositAmount,
    setDepositAmount,
    withdrawAmount,
    setWithdrawAmount,
    depositAmountValid,
    withdrawAmountValid,
    depositBlockReason,
    withdrawBlockReason,
    withdrawCooldownRemaining,
    withdrawHint,
    depositHint,
    depositRateLabel: "1:1 SPL $CORN → in-game balance",
    withdrawRateLabel: "1:1 in-game $CORN → SPL wallet",
    withdrawMinLevel: WITHDRAW_MIN_LEVEL,
    playerLevel,
    withdrawalsEnabled,
    isLoading: status.type === "loading",
    minDepositCorn: MIN_DEPOSIT_CORN,
    minWithdrawCorn: MIN_WITHDRAW_CORN,
  };
}
