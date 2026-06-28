"use client";

import { useEffect, useState } from "react";
import { usePlayMode } from "@/context/PlayModeProvider";

type StorageHealth = {
  persistentOnVercel?: boolean;
  ephemeralProduction?: boolean;
  hint?: string;
};

export function StorageWarningBanner() {
  const { playMode, canPlay } = usePlayMode();
  const [health, setHealth] = useState<StorageHealth | null>(null);

  useEffect(() => {
    if (playMode !== "wallet" || !canPlay) {
      setHealth(null);
      return;
    }

    let cancelled = false;

    fetch("/api/health/storage", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: StorageHealth) => {
        if (!cancelled) setHealth(payload);
      })
      .catch(() => {
        if (!cancelled) setHealth(null);
      });

    return () => {
      cancelled = true;
    };
  }, [canPlay, playMode]);

  if (!health?.ephemeralProduction) return null;

  return (
    <div
      role="alert"
      className="pointer-events-none fixed inset-x-0 top-14 z-[60] flex justify-center px-4"
    >
      <div className="max-w-2xl rounded-lg border border-amber-400/60 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-100 shadow-lg backdrop-blur">
        Wallet saves are not persisting in production. Connect{" "}
        <strong>corn-farm-blob</strong> to the Vercel project and redeploy before
        playing with real tokens.
      </div>
    </div>
  );
}
