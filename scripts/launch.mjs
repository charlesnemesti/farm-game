/**
 * One-step launch — wire the official pump.fun $CORN mint CA.
 * Treasury wallet + TREASURY_SECRET_KEY stay unchanged from test phase.
 *
 * Usage: npm run launch -- <OFFICIAL_PUMP_FUN_MINT_CA>
 */
import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { getRpcEndpoint, loadEnvLocal, upsertEnvValue } from "./env-local.mjs";
import { LAUNCH_TREASURY_PUBKEY } from "./launch-constants.mjs";

async function resolveMintProgram(connection, mint) {
  const account = await connection.getAccountInfo(mint);
  if (account?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return { programId: TOKEN_2022_PROGRAM_ID, kind: "token-2022" };
  }
  return { programId: TOKEN_PROGRAM_ID, kind: "spl" };
}

function parseMintArg() {
  const mintAddress = process.argv[2]?.trim();
  if (!mintAddress) {
    console.error("Usage: npm run launch -- <OFFICIAL_PUMP_FUN_MINT_CA>");
    console.error("");
    console.error("Example:");
    console.error("  npm run launch -- 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
    process.exit(1);
  }

  if (mintAddress.startsWith("http://") || mintAddress.startsWith("https://")) {
    console.error("Invalid mint: pass the Solana mint address (base58), not a URL.");
    process.exit(1);
  }

  try {
    return new PublicKey(mintAddress);
  } catch {
    console.error("Invalid mint address:", mintAddress);
    process.exit(1);
  }
}

async function verifyTreasury(connection, mint, programId, decimals) {
  const treasury = new PublicKey(LAUNCH_TREASURY_PUBKEY);
  const solLamports = await connection.getBalance(treasury);
  const sol = solLamports / 1_000_000_000;
  const treasuryAta = getAssociatedTokenAddressSync(
    mint,
    treasury,
    false,
    programId,
  );

  console.log("Treasury readiness");
  console.log(`  Wallet: ${treasury.toBase58()}`);
  console.log(`  SOL: ${sol.toFixed(4)}${solLamports < 10_000 ? " (needs more for fees)" : ""}`);

  try {
    const tokenAccount = await getAccount(connection, treasuryAta, undefined, programId);
    const corn = Number(tokenAccount.amount) / 10 ** decimals;
    console.log(`  $CORN ATA: ${treasuryAta.toBase58()}`);
    console.log(`  $CORN balance: ${corn.toLocaleString("en-US")}`);
    if (corn <= 0) {
      console.log("  ⚠ Seed treasury with $CORN before testing withdrawals");
    }
  } catch {
    console.log(`  $CORN ATA: not created yet (${treasuryAta.toBase58()})`);
    console.log("  ⚠ Send $CORN to treasury wallet — ATA is created on first transfer");
  }

  console.log("");
}

async function main() {
  loadEnvLocal();

  const mint = parseMintArg();
  const rpc = getRpcEndpoint();
  const connection = new Connection(rpc, "confirmed");

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  CORN FARM — LAUNCH WIRING");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("  RPC:      ", rpc);
  console.log("  Mint:     ", mint.toBase58());
  console.log("  Treasury: ", LAUNCH_TREASURY_PUBKEY, "(unchanged)");
  console.log("");

  const { programId, kind } = await resolveMintProgram(connection, mint);
  const mintInfo = await getMint(connection, mint, undefined, programId);

  upsertEnvValue("NEXT_PUBLIC_CORN_MINT", mint.toBase58());
  upsertEnvValue("NEXT_PUBLIC_CORN_DECIMALS", String(mintInfo.decimals));
  upsertEnvValue("NEXT_PUBLIC_CORN_TOKEN_PROGRAM", kind);
  upsertEnvValue("NEXT_PUBLIC_SOLANA_CLUSTER", "mainnet-beta");
  upsertEnvValue("NEXT_PUBLIC_TREASURY_PUBKEY", LAUNCH_TREASURY_PUBKEY);

  console.log("On-chain mint verified");
  console.log(`  Token program: ${kind}`);
  console.log(`  Decimals: ${mintInfo.decimals}`);
  console.log(`  Supply (raw): ${mintInfo.supply.toString()}`);
  console.log(`  Solscan: https://solscan.io/token/${mint.toBase58()}`);
  console.log("");

  await verifyTreasury(connection, mint, programId, mintInfo.decimals);

  console.log("Updated .env.local ✓");
  console.log("");
  console.log("── Vercel → Production env (paste these, then redeploy) ──");
  console.log("");
  console.log(`NEXT_PUBLIC_CORN_MINT=${mint.toBase58()}`);
  console.log(`NEXT_PUBLIC_CORN_DECIMALS=${mintInfo.decimals}`);
  console.log(`NEXT_PUBLIC_CORN_TOKEN_PROGRAM=${kind}`);
  console.log(`NEXT_PUBLIC_TREASURY_PUBKEY=${LAUNCH_TREASURY_PUBKEY}`);
  console.log("NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta");
  console.log("");
  console.log("Keep unchanged on Vercel:");
  console.log("  TREASURY_SECRET_KEY");
  console.log("  BLOB_STORE_ID");
  console.log("  NEXT_PUBLIC_SOLANA_RPC_URL (if set)");
  console.log("");
  console.log("Remove / fix if present:");
  console.log("  Any invalid NEXT_PUBLIC_CORN_MINT URL");
  console.log("  NEXT_PUBLIC_WALLET_MODE_ENABLED=false (blocks wallet mode)");
  console.log("");
  console.log("── After redeploy (~2 min) ──");
  console.log("");
  console.log("  ✓ Wallet mode opens automatically (mint is wired)");
  console.log("  ✓ Deposits + server save + leaderboard go live");
  console.log("  → Fund treasury: SOL (fees) + $CORN (withdrawals / prizes)");
  console.log("  → npm run verify-treasury");
  console.log("  → https://www.cornfarm.online/api/treasury/status");
  console.log("");
  console.log("When you have the CA, send it and run: npm run launch -- <CA>");
  console.log("");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
