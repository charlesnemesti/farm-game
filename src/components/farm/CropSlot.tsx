"use client";

import { useEffect, useRef, useState } from "react";
import { getCycleProgress, type PlantedCrop } from "@/lib/cropState";
import { PLANT_SPRITE_SIZE } from "@/lib/plotBoard";
import { rarityTintForSeed, shouldUseWindTempestSprite } from "@/lib/plantSprites";
import type { CropKind } from "@/lib/plantSprites";
import { SEED_STATS } from "@/lib/seedConfig";
import { useTutorial } from "@/context/TutorialProvider";
import { useWeather } from "@/context/WeatherProvider";
import {
  getEffectiveCycleMs,
  getWeatherCornMultiplier,
} from "@/lib/weatherEffects";
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
  acceptsSeedDrop?: boolean;
  tutorialHighlight?: boolean;
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
  acceptsSeedDrop = false,
  tutorialHighlight = false,
  onPlant,
  onUproot,
}: CropSlotProps) {
  const crop: CropKind = "corn";
  const plantWidth = PLANT_SPRITE_SIZE.width * scale;
  const plantHeight = PLANT_SPRITE_SIZE.height * scale;
  const markerSize = Math.max(22, 18 * scale);
  const [harvestPopup, setHarvestPopup] = useState<LocalHarvestPopup | null>(null);
  const prevCycleStartedAtRef = useRef<number | null>(null);
  const { notifyEvent, isStep } = useTutorial();
  const { weather } = useWeather();

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
      const cycleMs = getEffectiveCycleMs(planted.rarity, weather);
      const cycleAdvance = planted.cycleStartedAt - previousCycleStartedAt;
      const isLiveHarvest =
        cycleAdvance > 0 && cycleAdvance <= cycleMs + 2000;

      if (isLiveHarvest) {
        setHarvestPopup({
          id: `${plotIndex}-${slotIndex}-${planted.cycleStartedAt}`,
          cornAmount: Math.round(
            SEED_STATS[planted.rarity].cornPerCycle *
              getWeatherCornMultiplier(weather),
          ),
        });
        if (isStep("wait-harvest")) {
          notifyEvent("harvest-received");
        }
      }
    }

    prevCycleStartedAtRef.current = planted.cycleStartedAt;
  }, [isStep, notifyEvent, now, planted, plotIndex, slotIndex, weather]);

  if (planted) {
    const { progress } = getCycleProgress(planted, now, weather);
    const windTempest = shouldUseWindTempestSprite(weather, progress);

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
        data-tutorial={tutorialHighlight ? "furrow" : undefined}
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
          now={now}
          windTempest={windTempest}
          rarityTint={rarityTintForSeed(planted.rarity)}
        />
      </button>
    );
  }

  const showPlantable = plantable || acceptsSeedDrop;
  const dropWidth = acceptsSeedDrop ? plantWidth : markerSize;
  const dropHeight = acceptsSeedDrop ? plantHeight : markerSize;
  const dropLeft = acceptsSeedDrop ? x - plantWidth / 2 : x - markerSize / 2;
  const dropTop = acceptsSeedDrop ? y - plantHeight : y - markerSize / 2;

  return (
    <button
      type="button"
      onClick={() => {
        if (plantable) onPlant?.();
      }}
      data-drop-target={showPlantable ? "crop" : undefined}
      className={`absolute ${
        showPlantable
          ? `crop-slot--plantable cursor-pointer ${acceptsSeedDrop ? "z-[12]" : ""}`
          : "cursor-default opacity-0"
      }`}
      style={{
        left: dropLeft,
        top: dropTop,
        width: dropWidth,
        height: dropHeight,
      }}
      data-plot={plotIndex}
      data-slot={slotIndex}
      data-asset-slot="crop"
      data-state={showPlantable ? "plantable" : "empty"}
      data-tutorial={tutorialHighlight ? "furrow" : undefined}
      aria-label={`Plot ${plotIndex + 1}, slot ${slotIndex + 1}`}
    />
  );
}
