"use client";

import { useEffect, useRef, useState } from "react";
import { getCycleProgress, type PlantedCrop } from "@/lib/cropState";
import { PLANT_SPRITE_SIZE } from "@/lib/plotBoard";
import { rarityTintForSeed } from "@/lib/plantSprites";
import type { CropKind } from "@/lib/plantSprites";
import { SEED_STATS } from "@/lib/seedConfig";
import { CropTimer } from "./CropTimer";
import { HarvestFloatPopup } from "./HarvestFloatPopup";
import { PlantSprite } from "./PlantSprite";

type CropSlotProps = {
  plotIndex: number;
  slotIndex: number;
  /** Screen position of the calibrated anchor (matches debug grid dots). */
  x: number;
  y: number;
  scale: number;
  now: number;
  planted?: PlantedCrop;
  plantable?: boolean;
  onPlant?: () => void;
  onUproot?: () => void;
};

type LocalHarvestPopup = {
  id: string;
  cornAmount: number;
};

// Planting slot — anchor matches debug overlay grid points (center at x,y).
export function CropSlot({
  plotIndex,
  slotIndex,
  x,
  y,
  scale,
  now,
  planted,
  plantable = false,
  onPlant,
  onUproot,
}: CropSlotProps) {
  const crop: CropKind = "corn";
  const plantWidth = PLANT_SPRITE_SIZE.width * scale;
  const plantHeight = PLANT_SPRITE_SIZE.height * scale;
  const markerSize = Math.max(22, 18 * scale);
  const [harvestPopup, setHarvestPopup] = useState<LocalHarvestPopup | null>(null);
  const prevCycleStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!planted) {
      prevCycleStartedAtRef.current = null;
      return;
    }

    const previousCycleStartedAt = prevCycleStartedAtRef.current;
    const cycleReset =
      previousCycleStartedAt !== null &&
      previousCycleStartedAt !== planted.cycleStartedAt;

    if (cycleReset) {
      const cycleMs = SEED_STATS[planted.rarity].harvestCycleSeconds * 1000;
      const cycleAdvance = planted.cycleStartedAt - previousCycleStartedAt;
      const isLiveHarvest =
        cycleAdvance > 0 && cycleAdvance <= cycleMs + 2000;

      if (isLiveHarvest) {
        setHarvestPopup({
          id: `${plotIndex}-${slotIndex}-${planted.cycleStartedAt}`,
          cornAmount: SEED_STATS[planted.rarity].cornPerCycle,
        });
      }
    }

    prevCycleStartedAtRef.current = planted.cycleStartedAt;
  }, [now, planted, plotIndex, slotIndex]);

  if (planted) {
    const { progress } = getCycleProgress(planted, now);

    return (
      <button
        type="button"
        onClick={() => onUproot?.()}
        className={`group absolute overflow-visible ${onUproot ? "cursor-pointer hover:brightness-110" : "cursor-default"}`}
        style={{
          left: x - plantWidth / 2,
          top: y - plantHeight,
          width: plantWidth,
          height: plantHeight,
        }}
        data-plot={plotIndex}
        data-slot={slotIndex}
        data-asset-slot="crop"
        data-state="planted"
        aria-label={`Plot ${plotIndex + 1}, slot ${slotIndex + 1}`}
      >
        {harvestPopup ? (
          <HarvestFloatPopup
            x={plantWidth / 2}
            y={0}
            scale={scale}
            cornAmount={harvestPopup.cornAmount}
            onDone={() => setHarvestPopup(null)}
          />
        ) : null}
        <CropTimer crop={planted} now={now} scale={scale} />
        <PlantSprite
          crop={crop}
          scale={scale}
          progress={progress}
          rarityTint={rarityTintForSeed(planted.rarity)}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (plantable) onPlant?.();
      }}
      className={`absolute ${
        plantable ? "crop-slot--plantable cursor-pointer" : "cursor-default opacity-0"
      }`}
      style={{
        left: x - markerSize / 2,
        top: y - markerSize / 2,
        width: markerSize,
        height: markerSize,
      }}
      data-plot={plotIndex}
      data-slot={slotIndex}
      data-asset-slot="crop"
      data-state={plantable ? "plantable" : "empty"}
      aria-label={`Plot ${plotIndex + 1}, slot ${slotIndex + 1}`}
    />
  );
}
