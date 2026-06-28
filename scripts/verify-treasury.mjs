import fs from "node:fs";
import path from "node:path";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";

const ENV_PATH = path.join(process.cwd(), ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(ENV_PATH)) return;

  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function getRpcEndpoint() {
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL.trim();
  }

  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER?.trim() ?? "mainnet-beta";
  if (cluster === "devnet") return "https://api.devnet.solana.com";
  if (cluster === "testnet") return "https://api.testnet.solana.com";
  return "https://api.mainnet-beta.solana.com";
}

async function resolveMintProgram(connection, mint) {
  const configured = process.env.NEXT_PUBLIC_CORN_TOKEN_PROGRAM?.trim().toLowerCase();
  if (configured === "token-2022" || configured === "2022") {
    return TOKEN_2022_PROGRAM_ID;
  }
  if (configured === "spl" || configured === "token" || configured === "legacy") {
    return TOKEN_PROGRAM_ID;
  }

  const account = await connection.getAccountInfo(mint);
  if (account?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID;
  }
  return TOKEN_PROGRAM_ID;
}

async function main() {
  loadEnvLocal();

  const mintAddress = process.env.NEXT_PUBLIC_CORN_MINT?.trim();
  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_PUBKEY?.trim();
  const decimalsEnv = process.env.NEXT_PUBLIC_CORN_DECIMALS?.trim();
  const hasSigner = Boolean(process.env.TREASURY_SECRET_KEY?.trim());

  console.log("=== Corn Farm treasury verification ===\n");

  if (!mintAddress) {
    console.log("✗ NEXT_PUBLIC_CORN_MINT is missing");
    console.log("  Run: npm run configure-token -- <PUMP_FUN_MINT_CA>");
    process.exit(1);
  }

  if (!treasuryAddress) {
    console.log("✗ NEXT_PUBLIC_TREASURY_PUBKEY is missing");
    console.log("  Run: npm run generate-treasury");
    process.exit(1);
  }

  let mint;
  let treasury;
  try {
    mint = new PublicKey(mintAddress);
    treasury = new PublicKey(treasuryAddress);
  } catch {
    console.log("✗ Invalid mint or treasury address in .env.local");
    process.exit(1);
  }

  if (hasSigner) {
    try {
      const secret = process.env.TREASURY_SECRET_KEY.trim();
      let keyBytes;
      if (secret.startsWith("[")) {
        keyBytes = Uint8Array.from(JSON.parse(secret));
      } else {
        keyBytes = Buffer.from(secret, "base64");
      }
      const { Keypair } = await import("@solana/web3.js");
      const keypair = Keypair.fromSecretKey(keyBytes);
      if (!keypair.publicKey.equals(treasury)) {
        console.log("✗ TREASURY_SECRET_KEY does not match NEXT_PUBLIC_TREASURY_PUBKEY");
        process.exit(1);
      }
      console.log("✓ Treasury signer matches public key");
    } catch {
      console.log("✗ TREASURY_SECRET_KEY is invalid");
      process.exit(1);
    }
  } else {
    console.log("⚠ TREASURY_SECRET_KEY not set (withdrawals disabled)");
  }

  const rpc = getRpcEndpoint();
  const connection = new Connection(rpc, "confirmed");
  console.log("✓ RPC:", rpc);

  const programId = await resolveMintProgram(connection, mint);
  const mintInfo = await getMint(connection, mint, undefined, programId);
  const configuredDecimals = decimalsEnv ? Number(decimalsEnv) : 6;

  console.log("✓ Mint:", mint.toBase58());
  console.log(`  Program: ${programId.equals(TOKEN_2022_PROGRAM_ID) ? "token-2022" : "spl"}`);
  console.log(`  Decimals (on-chain): ${mintInfo.decimals}`);

  if (mintInfo.decimals !== configuredDecimals) {
    console.log(
      `✗ NEXT_PUBLIC_CORN_DECIMALS=${configuredDecimals} does not match on-chain (${mintInfo.decimals})`,
    );
    console.log(`  Fix: set NEXT_PUBLIC_CORN_DECIMALS=${mintInfo.decimals}`);
    process.exit(1);
  }

  console.log("✓ Decimals match env");

  const solLamports = await connection.getBalance(treasury);
  const sol = solLamports / 1_000_000_000;
  console.log("✓ Treasury:", treasury.toBase58());
  console.log(`  SOL balance: ${sol.toFixed(4)}`);

  if (solLamports < 10_000) {
    console.log("⚠ Treasury needs SOL for transaction fees");
  }

  const treasuryAta = getAssociatedTokenAddressSync(
    mint,
    treasury,
    false,
    programId,
  );

  try {
    const tokenAccount = await getAccount(connection, treasuryAta, undefined, programId);
    const raw = tokenAccount.amount;
    const corn = Number(raw) / 10 ** mintInfo.decimals;
    console.log("✓ Treasury token account:", treasuryAta.toBase58());
    console.log(`  SPL balance: ${corn.toLocaleString("en-US")} tokens`);
    if (corn <= 0) {
      console.log("⚠ Treasury has no tokens — seed it before testing withdrawals");
    }
  } catch {
    console.log("⚠ Treasury token account not created yet");
    console.log("  It will be created automatically on the first deposit");
    console.log("  ATA:", treasuryAta.toBase58());
  }

  console.log("");
  console.log("Deposits: ready (wallet mode → Treasury panel)");
  console.log("Live API check: GET /api/treasury/status");
  console.log("");
  console.log("All critical checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
