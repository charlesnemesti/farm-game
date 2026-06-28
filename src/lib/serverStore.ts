// NOTE: All code must stay in English, even when requirements arrive in Spanish.
// Persistent JSON store — Vercel Blob in production, local .data/ in dev.

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { get, head, put, type PutCommandOptions } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), ".data");
const BLOB_PREFIX = "cornfarm-data";

function hasBlobStoreId(): boolean {
  return Boolean(process.env.BLOB_STORE_ID?.trim());
}

function hasBlobReadWriteToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

/** Blob is available when the store is linked (OIDC) or a legacy token is set. */
function useBlobStore(): boolean {
  return hasBlobStoreId() || hasBlobReadWriteToken();
}

/** Vercel serverless disk is ephemeral — saves are lost without Blob. */
export function isEphemeralProductionStore(): boolean {
  return Boolean(process.env.VERCEL) && !useBlobStore();
}

export class EphemeralStoreError extends Error {
  constructor() {
    super(
      "Persistent storage is not configured. Connect Vercel Blob to this project and redeploy.",
    );
    this.name = "EphemeralStoreError";
  }
}

function blobPathname(filename: string): string {
  return `${BLOB_PREFIX}/${filename}`;
}

function localFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

/** Let @vercel/blob use OIDC (BLOB_STORE_ID) on Vercel; legacy token for local-only setups. */
function blobSdkOptions(): Pick<PutCommandOptions, "token"> | undefined {
  if (hasBlobStoreId()) {
    return undefined;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? { token } : undefined;
}

export function getBlobAuthMode(): "oidc" | "token" | null {
  if (hasBlobStoreId()) return "oidc";
  if (hasBlobReadWriteToken()) return "token";
  return null;
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
      ...blobSdkOptions(),
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
    ...blobSdkOptions(),
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
  if (isEphemeralProductionStore()) {
    throw new EphemeralStoreError();
  }

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
    await head(blobPathname(filename), blobSdkOptions());
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
