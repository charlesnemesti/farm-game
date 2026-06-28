import fs from "node:fs";
import path from "node:path";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
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

function upsertEnvValue(key, value) {
  const lines = fs.existsSync(ENV_PATH)
    ? fs.readFileSync(ENV_PATH, "utf8").split("\n")
    : [];
  const nextLine = `${key}=${value}`;
  let replaced = false;

  const updated = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      replaced = true;
      return nextLine;
    }
    return line;
  });

  if (!replaced) {
    if (updated.length > 0 && updated[updated.length - 1] !== "") {
      updated.push("");
    }
    updated.push(nextLine);
  }

  fs.writeFileSync(ENV_PATH, `${updated.join("\n").replace(/\n+$/, "\n")}`);
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
  const account = await connection.getAccountInfo(mint);
  if (account?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return { programId: TOKEN_2022_PROGRAM_ID, kind: "token-2022" };
  }
  return { programId: TOKEN_PROGRAM_ID, kind: "spl" };
}

async function main() {
  loadEnvLocal();

  const mintAddress = process.argv[2]?.trim();
  if (!mintAddress) {
    console.error("Usage: npm run configure-token -- <PUMP_FUN_MINT_CA>");
    console.error("");
    console.error("Example:");
    console.error("  npm run configure-token -- 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
    process.exit(1);
  }

  let mint;
  try {
    mint = new PublicKey(mintAddress);
  } catch {
    console.error("Invalid mint address:", mintAddress);
    process.exit(1);
  }

  const rpc = getRpcEndpoint();
  const connection = new Connection(rpc, "confirmed");

  console.log("Connecting to RPC:", rpc);
  console.log("Fetching mint info for:", mint.toBase58());

  const { programId, kind } = await resolveMintProgram(connection, mint);
  const mintInfo = await getMint(connection, mint, undefined, programId);

  upsertEnvValue("NEXT_PUBLIC_CORN_MINT", mint.toBase58());
  upsertEnvValue("NEXT_PUBLIC_CORN_DECIMALS", String(mintInfo.decimals));
  upsertEnvValue("NEXT_PUBLIC_CORN_TOKEN_PROGRAM", kind);
  upsertEnvValue("NEXT_PUBLIC_SOLANA_CLUSTER", "mainnet-beta");

  if (!process.env.NEXT_PUBLIC_TREASURY_PUBKEY?.trim()) {
    console.log("");
    console.log("Treasury not configured yet. Run: npm run generate-treasury");
  }

  console.log("");
  console.log("Updated .env.local:");
  console.log(`  NEXT_PUBLIC_CORN_MINT=${mint.toBase58()}`);
  console.log(`  NEXT_PUBLIC_CORN_DECIMALS=${mintInfo.decimals}`);
  console.log(`  NEXT_PUBLIC_CORN_TOKEN_PROGRAM=${kind}`);
  console.log(`  NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta`);
  console.log("");
  console.log("On-chain mint:");
  console.log(`  Token program: ${kind}`);
  console.log(`  Decimals: ${mintInfo.decimals}`);
  console.log(`  Supply (raw): ${mintInfo.supply.toString()}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Ensure NEXT_PUBLIC_TREASURY_PUBKEY + TREASURY_SECRET_KEY are set");
  console.log("  2. Fund treasury with SOL (fees) + test tokens (withdrawals)");
  console.log("  3. Restart dev server: npm run dev");
  console.log("  4. Verify: npm run verify-treasury");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
