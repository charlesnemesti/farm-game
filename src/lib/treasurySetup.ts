// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { Connection } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import {
  CORN_DECIMALS,
  LAMPORTS_PER_SOL,
  getClusterLabel,
  getCornMintPublicKey,
  getSolanaCluster,
  getSolanaRpcEndpoint,
  getTreasuryPublicKey,
  rawAmountToCorn,
} from "./treasuryConfig";
import { loadTreasuryKeypair } from "./treasuryServer";
import {
  fetchMintOnChainInfo,
  getCornAssociatedTokenAddress,
  resolveMintTokenProgram,
} from "./splToken";

export type TreasuryConfigIssue =
  | "mint-missing"
  | "mint-invalid"
  | "treasury-pubkey-missing"
  | "treasury-pubkey-invalid"
  | "treasury-signer-missing"
  | "treasury-signer-mismatch"
  | "decimals-mismatch"
  | "treasury-low-sol"
  | "treasury-ata-missing"
  | "treasury-token-empty";

export type TreasuryPublicConfig = {
  cluster: ReturnType<typeof getSolanaCluster>;
  clusterLabel: string;
  rpcConfigured: boolean;
  mint: string | null;
  treasuryPubkey: string | null;
  decimals: number;
  tokenProgram: "spl" | "token-2022" | "auto";
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
};

export type TreasuryLiveStatus = TreasuryPublicConfig & {
  mintOnChain: {
    decimals: number;
    tokenProgram: "spl" | "token-2022";
    supply: string;
  } | null;
  treasury: {
    solBalance: number;
    cornBalance: number;
    ataExists: boolean;
    ataAddress: string | null;
  } | null;
  issues: TreasuryConfigIssue[];
  readyForDeposits: boolean;
  readyForWithdrawals: boolean;
};

function getTokenProgramEnv(): "spl" | "token-2022" | "auto" {
  const value = process.env.NEXT_PUBLIC_CORN_TOKEN_PROGRAM?.trim().toLowerCase();
  if (value === "token-2022" || value === "token2022" || value === "2022") {
    return "token-2022";
  }
  if (value === "spl" || value === "token" || value === "legacy") {
    return "spl";
  }
  return "auto";
}

export function getTreasuryPublicConfig(): TreasuryPublicConfig {
  const mint = getCornMintPublicKey();
  const treasury = getTreasuryPublicKey();
  const signer = loadTreasuryKeypair();

  return {
    cluster: getSolanaCluster(),
    clusterLabel: getClusterLabel(),
    rpcConfigured: Boolean(process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()),
    mint: mint?.toBase58() ?? null,
    treasuryPubkey: treasury?.toBase58() ?? null,
    decimals: CORN_DECIMALS,
    tokenProgram: getTokenProgramEnv(),
    depositsEnabled: Boolean(mint && treasury),
    withdrawalsEnabled: Boolean(mint && treasury && signer),
  };
}

export async function getTreasuryLiveStatus(): Promise<TreasuryLiveStatus> {
  const base = getTreasuryPublicConfig();
  const issues: TreasuryConfigIssue[] = [];
  const mintPubkey = getCornMintPublicKey();
  const treasuryPubkey = getTreasuryPublicKey();
  const signer = loadTreasuryKeypair();

  if (!process.env.NEXT_PUBLIC_CORN_MINT?.trim()) {
    issues.push("mint-missing");
  } else if (!mintPubkey) {
    issues.push("mint-invalid");
  }

  if (!process.env.NEXT_PUBLIC_TREASURY_PUBKEY?.trim()) {
    issues.push("treasury-pubkey-missing");
  } else if (!treasuryPubkey) {
    issues.push("treasury-pubkey-invalid");
  }

  if (!signer) {
    issues.push("treasury-signer-missing");
  } else if (
    treasuryPubkey &&
    !signer.publicKey.equals(treasuryPubkey)
  ) {
    issues.push("treasury-signer-mismatch");
  }

  if (!mintPubkey || !treasuryPubkey) {
    return {
      ...base,
      mintOnChain: null,
      treasury: null,
      issues,
      readyForDeposits: false,
      readyForWithdrawals: false,
    };
  }

  const connection = new Connection(getSolanaRpcEndpoint(), "confirmed");

  let mintOnChain: TreasuryLiveStatus["mintOnChain"] = null;
  try {
    mintOnChain = await fetchMintOnChainInfo(connection, mintPubkey);
    if (mintOnChain.decimals !== CORN_DECIMALS) {
      issues.push("decimals-mismatch");
    }
  } catch {
    issues.push("mint-invalid");
  }

  const { programId } = await resolveMintTokenProgram(connection, mintPubkey);
  const treasuryAta = getCornAssociatedTokenAddress(
    mintPubkey,
    treasuryPubkey,
    programId,
  );

  const solLamports = await connection.getBalance(treasuryPubkey);
  const solBalance = solLamports / LAMPORTS_PER_SOL;

  if (solLamports < 10_000) {
    issues.push("treasury-low-sol");
  }

  let cornBalance = 0;
  let ataExists = false;

  try {
    const tokenAccount = await getAccount(connection, treasuryAta, undefined, programId);
    ataExists = true;
    cornBalance = rawAmountToCorn(tokenAccount.amount);
    if (cornBalance <= 0) {
      issues.push("treasury-token-empty");
    }
  } catch {
    issues.push("treasury-ata-missing");
  }

  const readyForDeposits =
    issues.filter(
      (issue) =>
        issue !== "treasury-signer-missing" &&
        issue !== "treasury-signer-mismatch" &&
        issue !== "treasury-low-sol" &&
        issue !== "treasury-ata-missing" &&
        issue !== "treasury-token-empty" &&
        issue !== "decimals-mismatch",
    ).length === 0;

  const readyForWithdrawals =
    readyForDeposits &&
    Boolean(signer) &&
    !issues.includes("treasury-signer-mismatch") &&
    !issues.includes("treasury-low-sol") &&
    ataExists &&
    cornBalance > 0 &&
    !issues.includes("decimals-mismatch");

  return {
    ...base,
    mintOnChain,
    treasury: {
      solBalance,
      cornBalance,
      ataExists,
      ataAddress: treasuryAta.toBase58(),
    },
    issues,
    readyForDeposits,
    readyForWithdrawals,
  };
}

export function describeTreasuryIssue(issue: TreasuryConfigIssue): string {
  switch (issue) {
    case "mint-missing":
      return "Set NEXT_PUBLIC_CORN_MINT to your pump.fun token CA.";
    case "mint-invalid":
      return "NEXT_PUBLIC_CORN_MINT is not a valid mint on this cluster.";
    case "treasury-pubkey-missing":
      return "Set NEXT_PUBLIC_TREASURY_PUBKEY (run npm run generate-treasury).";
    case "treasury-pubkey-invalid":
      return "NEXT_PUBLIC_TREASURY_PUBKEY is not a valid Solana address.";
    case "treasury-signer-missing":
      return "Set TREASURY_SECRET_KEY on the server for withdrawals.";
    case "treasury-signer-mismatch":
      return "TREASURY_SECRET_KEY does not match NEXT_PUBLIC_TREASURY_PUBKEY.";
    case "decimals-mismatch":
      return "NEXT_PUBLIC_CORN_DECIMALS does not match the on-chain mint decimals.";
    case "treasury-low-sol":
      return "Treasury wallet needs SOL for transaction fees.";
    case "treasury-ata-missing":
      return "Treasury token account will be created on first deposit (or run npm run verify-treasury).";
    case "treasury-token-empty":
      return "Treasury has no SPL tokens yet — seed it before testing withdrawals.";
    default:
      return issue;
  }
}
