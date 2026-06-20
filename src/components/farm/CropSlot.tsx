import { PLANT_SPRITE_SIZE } from "@/lib/plotBoard";
import type { PlantedCrop } from "@/lib/cropState";
import { rarityTintForSeed } from "@/lib/plantSprites";
import type { CropKind } from "@/lib/plantSprites";
import { CropTimer } from "./CropTimer";
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
}: CropSlotProps) {
  const crop: CropKind = "corn";
  const plantWidth = PLANT_SPRITE_SIZE.width * scale;
  const plantHeight = PLANT_SPRITE_SIZE.height * scale;
  const markerSize = Math.max(22, 18 * scale);

  if (planted) {
    return (
      <button
        type="button"
        className="absolute cursor-default"
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
        <CropTimer crop={planted} now={now} scale={scale} />
        <PlantSprite
          crop={crop}
          scale={scale}
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
