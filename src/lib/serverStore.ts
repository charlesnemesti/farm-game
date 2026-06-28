// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Persistent JSON store — Vercel Blob in production, local .data/ in dev.

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { get, head, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), ".data");
const BLOB_PREFIX = "cornfarm-data";

function useBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function blobPathname(filename: string): string {
  return `${BLOB_PREFIX}/${filename}`;
}

function localFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readLocalStore<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(localFilePath(filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeLocalStore<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  await writeFile(localFilePath(filename), JSON.stringify(data, null, 2), "utf-8");
}

async function readBlobStore<T>(filename: string, fallback: T): Promise<T> {
  try {
    const result = await get(blobPathname(filename), {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result) return fallback;

    const raw = await new Response(result.stream).text();
    if (!raw.trim()) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeBlobStore<T>(filename: string, data: T): Promise<void> {
  await put(blobPathname(filename), JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

/** Where saves are persisted — useful for health checks / ops. */
export function getStoreBackend(): "blob" | "local" {
  return useBlobStore() ? "blob" : "local";
}

export async function readJsonStore<T>(filename: string, fallback: T): Promise<T> {
  if (useBlobStore()) {
    return readBlobStore(filename, fallback);
  }
  return readLocalStore(filename, fallback);
}

export async function writeJsonStore<T>(filename: string, data: T): Promise<void> {
  if (useBlobStore()) {
    await writeBlobStore(filename, data);
    return;
  }
  await writeLocalStore(filename, data);
}

/** Copy local .data JSON files into Vercel Blob (run once before first prod deploy). */
export async function migrateLocalStoreToBlob(filename: string): Promise<boolean> {
  if (!useBlobStore()) return false;

  try {
    await head(blobPathname(filename), {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return false;
  } catch {
    // Blob missing — proceed with migration.
  }

  let local: unknown;
  try {
    const raw = await readFile(localFilePath(filename), "utf-8");
    local = JSON.parse(raw);
  } catch {
    return false;
  }

  await writeBlobStore(filename, local);
  return true;
}
