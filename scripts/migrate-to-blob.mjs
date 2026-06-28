import fs from "node:fs";
import path from "node:path";
import { get, head, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), ".data");
const BLOB_PREFIX = "cornfarm-data";
const FILES = ["wallet-game-states.json", "leaderboard.json"];

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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

function blobPath(filename) {
  return `${BLOB_PREFIX}/${filename}`;
}

async function blobExists(filename) {
  try {
    await head(blobPath(filename), { token: process.env.BLOB_READ_WRITE_TOKEN });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  loadEnvLocal();

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.error("BLOB_READ_WRITE_TOKEN is missing.");
    console.error("");
    console.error("1. Vercel Dashboard → corn-farm → Storage → Create Blob Store");
    console.error("2. Connect store to this project (auto-adds env var)");
    console.error("3. Pull env: vercel env pull .env.local");
    console.error("4. Re-run: npm run migrate-to-blob");
    process.exit(1);
  }

  let migrated = 0;
  for (const file of FILES) {
    const localPath = path.join(DATA_DIR, file);
    if (!fs.existsSync(localPath)) {
      console.log(`Skip ${file} — no local file`);
      continue;
    }

    if (await blobExists(file)) {
      console.log(`Skip ${file} — already in Blob`);
      continue;
    }

    const raw = fs.readFileSync(localPath, "utf8");
    await put(blobPath(file), raw, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`Migrated ${file} → Vercel Blob`);
    migrated += 1;
  }

  console.log("");
  console.log(migrated > 0 ? `Done. Migrated ${migrated} file(s).` : "Nothing to migrate.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
