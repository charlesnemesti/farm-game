"use client";

import { useState } from "react";
import { useGame } from "@/context/GameProvider";
import { designToScreen, type CoverTransform } from "@/hooks/useCoverTransform";
import type { PlotSlotConfig } from "@/lib/plotBoard";
import { PLOT_SLOTS } from "@/lib/plotBoard";
import { CropSlot } from "./CropSlot";
import { CropUprootDialog } from "./CropUprootDialog";

type PlotBoardProps = {
  transform: CoverTransform;
  slots?: PlotSlotConfig[];
};

type UprootTarget = {
  plotId: number;
  slotId: number;
  rarity: "common" | "rare" | "epic";
};

// Interactive crop layer over the furrows.
export function PlotBoard({
  transform,
  slots = PLOT_SLOTS,
}: PlotBoardProps) {
  const {
    now,
    plantingSeedSlot,
    plantSelectedSeed,
    isSlotPlantable,
    isPlotRowUnlocked,
    getCropAt,
    uprootCrop,
  } = useGame();
  const [uprootTarget, setUprootTarget] = useState<UprootTarget | null>(null);

  const plantingMode = plantingSeedSlot !== null;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute inset-0">
          {slots.flatMap((plot) => {
            if (!isPlotRowUnlocked(plot.plotId)) return [];

            return plot.slots.map((slot, slotIndex) => {
              const screen = designToScreen(slot.x, slot.y, transform);
              const planted = getCropAt(plot.plotId, slotIndex);
              const plantable =
                plantingMode && !planted && isSlotPlantable(plot.plotId, slotIndex);

              return (
                <CropSlot
                  key={`${plot.plotId}-${slotIndex}`}
                  plotIndex={plot.plotId}
                  slotIndex={slotIndex}
                  x={screen.x}
                  y={screen.y}
                  scale={transform.scale}
                  now={now}
                  planted={planted}
                  plantable={plantable}
                  onPlant={() => plantSelectedSeed(plot.plotId, slotIndex)}
                  onUproot={
                    !plantingMode && planted
                      ? () =>
                          setUprootTarget({
                            plotId: plot.plotId,
                            slotId: slotIndex,
                            rarity: planted.rarity,
                          })
                      : undefined
                  }
                />
              );
            });
          })}
        </div>
      </div>

      <CropUprootDialog
        open={uprootTarget !== null}
        rarity={uprootTarget?.rarity ?? "common"}
        onConfirm={() => {
          if (!uprootTarget) return;
          uprootCrop(uprootTarget.plotId, uprootTarget.slotId);
          setUprootTarget(null);
        }}
        onCancel={() => setUprootTarget(null)}
      />
    </>
  );
}
