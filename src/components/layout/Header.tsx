"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CornCounter } from "@/components/layout/CornCounter";
import { MusicControl } from "@/components/layout/MusicControl";

// Reminder: requirements may arrive in Spanish, but implementation language is always English.

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

function CalibrateToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  const toggleCalibrator = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (debug) {
      params.delete("debug");
    } else {
      params.set("debug", "1");
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  return (
    <button
      type="button"
      onClick={toggleCalibrator}
      className={`h-9 rounded-lg border px-3 text-xs font-semibold transition sm:text-sm ${
        debug
          ? "border-lime-400/50 bg-lime-500/20 text-lime-100 hover:bg-lime-500/30"
          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {debug ? "Exit calibrator" : "Calibrate spots"}
    </button>
  );
}

export function Header() {
  return (
    <header className="absolute top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-farm-grass text-base shadow-sm">
            🌾
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-white">
              SolFarm
            </h1>
            <p className="hidden text-xs text-white/70 sm:block">
              Grow, harvest, and earn
            </p>
          </div>
          <WalletMultiButton className="!h-9 !rounded-lg !bg-farm-sun !text-sm !font-semibold !text-farm-wood hover:!bg-farm-sun-dark" />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <MusicControl />
          <Suspense fallback={null}>
            <CalibrateToggle />
          </Suspense>
          <CornCounter />
        </div>
      </div>
    </header>
  );
}
