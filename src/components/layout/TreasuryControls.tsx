"use client";

import { useState } from "react";
import { usePlayMode } from "@/context/PlayModeProvider";
import { TreasuryPanel } from "@/components/game/TreasuryPanel";

// Header entry point for the on-chain treasury.
export function TreasuryControls() {
  const { playMode, walletConnected } = usePlayMode();
  const [open, setOpen] = useState(false);

  const walletMode = playMode === "wallet";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hud-action-button"
        title={
          walletMode
            ? walletConnected
              ? "Deposit SOL or withdraw $CORN"
              : "Connect wallet to use treasury"
            : "Switch to wallet mode to use treasury"
        }
      >
        <span className="hud-action-button__icon" aria-hidden>
          $
        </span>
        Treasury
      </button>

      <TreasuryPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
