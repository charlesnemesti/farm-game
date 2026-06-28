// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";

export type CornTokenProgramKind = "spl" | "token-2022";

const TOKEN_PROGRAM_IDS: Record<CornTokenProgramKind, PublicKey> = {
  spl: TOKEN_PROGRAM_ID,
  "token-2022": TOKEN_2022_PROGRAM_ID,
};

export function parseTokenProgramKind(
  value: string | undefined | null,
): CornTokenProgramKind | "auto" | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "spl" || normalized === "token" || normalized === "legacy") {
    return "spl";
  }
  if (
    normalized === "token-2022" ||
    normalized === "token2022" ||
    normalized === "2022"
  ) {
    return "token-2022";
  }
  if (normalized === "auto") return "auto";
  return null;
}

export function tokenProgramKindToId(kind: CornTokenProgramKind): PublicKey {
  return TOKEN_PROGRAM_IDS[kind];
}

export function getConfiguredTokenProgramKind(): CornTokenProgramKind | "auto" {
  return parseTokenProgramKind(process.env.NEXT_PUBLIC_CORN_TOKEN_PROGRAM) ?? "auto";
}

/** Client-safe default before on-chain auto-detect (pump.fun uses legacy SPL). */
export function getDefaultTokenProgramId(): PublicKey {
  const kind = getConfiguredTokenProgramKind();
  if (kind === "auto") return TOKEN_PROGRAM_ID;
  return tokenProgramKindToId(kind);
}

export function getResolvedMintTokenProgramId(): PublicKey {
  const kind = getConfiguredTokenProgramKind();
  if (kind !== "auto") return tokenProgramKindToId(kind);
  return TOKEN_PROGRAM_ID;
}

export async function resolveMintTokenProgram(
  connection: Connection,
  mint: PublicKey,
): Promise<{ programId: PublicKey; kind: CornTokenProgramKind }> {
  const configured = getConfiguredTokenProgramKind();
  if (configured !== "auto") {
    return { programId: tokenProgramKindToId(configured), kind: configured };
  }

  const account = await connection.getAccountInfo(mint);
  if (account?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return { programId: TOKEN_2022_PROGRAM_ID, kind: "token-2022" };
  }

  return { programId: TOKEN_PROGRAM_ID, kind: "spl" };
}

export function getCornAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey = getDefaultTokenProgramId(),
): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, false, tokenProgramId);
}

export type MintOnChainInfo = {
  mint: string;
  decimals: number;
  tokenProgram: CornTokenProgramKind;
  supply: string;
};

export async function fetchMintOnChainInfo(
  connection: Connection,
  mint: PublicKey,
): Promise<MintOnChainInfo> {
  const { programId, kind } = await resolveMintTokenProgram(connection, mint);
  const mintInfo = await getMint(connection, mint, undefined, programId);

  return {
    mint: mint.toBase58(),
    decimals: mintInfo.decimals,
    tokenProgram: kind,
    supply: mintInfo.supply.toString(),
  };
}
