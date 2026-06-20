"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/context/GameProvider";
import { SEED_PACK_ITEM } from "@/lib/shopConfig";
import {
  RARITY_GLOW_CLASS,
  RARITY_LABELS,
  RARITY_TEXT_CLASS,
  rollPackSeeds,
  type RolledSeed,
} from "@/lib/seedConfig";
import { getSeedImage } from "@/lib/itemConfig";

type SeedPackOpeningModalProps = {
  packSlotIndex: number;
  onClose: () => void;
};

type Phase = "pack" | "reveal" | "ready";

const REVEAL_STAGGER_MS = 550;
const PACK_ANIMATION_MS = 900;

function RevealedSeed({
  seed,
  visible,
  large = false,
}: {
  seed: RolledSeed;
  visible: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 ${
        visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
      } ${large ? "gap-2" : "gap-1"}`}
    >
      <div
        className={`rounded-xl bg-black/40 p-2 ${RARITY_GLOW_CLASS[seed.rarity]} ${
          large ? "p-3" : "p-1.5"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getSeedImage(seed.rarity)}
          alt={RARITY_LABELS[seed.rarity]}
          draggable={false}
          className={`object-contain pixel-art ${large ? "h-16 w-16" : "h-12 w-12"}`}
        />
      </div>
      <p
        className={`text-center font-bold ${RARITY_TEXT_CLASS[seed.rarity]} ${
          large ? "text-sm" : "text-xs"
        }`}
      >
        {RARITY_LABELS[seed.rarity]}
      </p>
    </div>
  );
}

export function SeedPackOpeningModal({
  packSlotIndex,
  onClose,
}: SeedPackOpeningModalProps) {
  const { commitOpenedSeeds } = useGame();
  const rolledSeeds = useMemo(() => rollPackSeeds(), []);
  const [phase, setPhase] = useState<Phase>("pack");
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const packTimer = window.setTimeout(() => {
      setPhase("reveal");
    }, PACK_ANIMATION_MS);

    return () => window.clearTimeout(packTimer);
  }, []);

  useEffect(() => {
    if (phase !== "reveal") return;

    if (revealedCount >= rolledSeeds.length) {
      const readyTimer = window.setTimeout(() => setPhase("ready"), 450);
      return () => window.clearTimeout(readyTimer);
    }

    const revealTimer = window.setTimeout(() => {
      setRevealedCount((count) => count + 1);
    }, REVEAL_STAGGER_MS);

    return () => window.clearTimeout(revealTimer);
  }, [phase, revealedCount, rolledSeeds.length]);

  const handleSendToInventory = () => {
    commitOpenedSeeds(packSlotIndex, rolledSeeds);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Open seed pack"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/90 p-6 text-white shadow-2xl">
        <h2 className="text-center text-lg font-bold text-farm-sun">
          {phase === "ready" ? "Pack opened!" : "Opening pack…"}
        </h2>
        <p className="mt-1 text-center text-xs text-white/60">
          {phase === "ready"
            ? "Your seeds are ready to collect."
            : "Revealing 3 seeds from your pack."}
        </p>

        <div className="mt-6 flex min-h-[180px] flex-col items-center justify-center">
          {phase === "pack" ? (
            <div className="seed-pack-shake">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SEED_PACK_ITEM.imageSrc}
                alt={SEED_PACK_ITEM.name}
                draggable={false}
                className="h-36 w-28 object-contain drop-shadow-lg"
              />
            </div>
          ) : (
            <div className="flex items-start justify-center gap-4 sm:gap-6">
              {rolledSeeds.map((seed, index) => (
                <RevealedSeed
                  key={`${seed.rarity}-${index}`}
                  seed={seed}
                  visible={index < revealedCount}
                  large={phase === "ready"}
                />
              ))}
            </div>
          )}
        </div>

        {phase === "ready" ? (
          <button
            type="button"
            onClick={handleSendToInventory}
            className="mt-6 w-full rounded-xl bg-farm-sun py-3 text-sm font-bold text-farm-wood transition hover:bg-farm-sun-dark"
          >
            Send to inventory
          </button>
        ) : (
          <div className="mt-6 h-11" aria-hidden />
        )}

        {phase !== "ready" ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full text-xs text-white/45 transition hover:text-white/70"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
