import type { CSSProperties } from "react";
import {
  CORN_SPRITE,
  CORN_TEMPEST_SPRITE,
  growthFrameForProgress,
  tempestFrameAtTime,
  type CropKind,
  type PlantRarityTint,
} from "@/lib/plantSprites";

type PlantSpriteProps = {
  crop: CropKind;
  scale: number;
  /** Harvest cycle progress from 0 (just planted) to 1 (ready). */
  progress: number;
  rarityTint?: PlantRarityTint;
  /** Wall-clock ms for wind tempest frame animation. */
  now?: number;
  /** Use wind-battered mature sprite instead of growth sheet. */
  windTempest?: boolean;
};

function spriteSheetFor(crop: CropKind, windTempest: boolean) {
  if (windTempest) return CORN_TEMPEST_SPRITE;
  switch (crop) {
    case "corn":
      return CORN_SPRITE;
  }
}

function rarityClass(rarityTint?: PlantRarityTint): string {
  switch (rarityTint) {
    case "blue":
      return "plant-sprite--rarity-blue";
    case "purple":
      return "plant-sprite--rarity-purple";
    default:
      return "";
  }
}

// Renders a plant from a horizontal spritesheet, anchored bottom-center by parent.
export function PlantSprite({
  crop,
  scale,
  progress,
  rarityTint,
  now = 0,
  windTempest = false,
}: PlantSpriteProps) {
  const sheet = spriteSheetFor(crop, windTempest);
  const width = sheet.frameWidth * scale;
  const height = sheet.frameHeight * scale;
  const sheetWidth = sheet.frameWidth * sheet.frameCount * scale;
  const frameIndex = windTempest
    ? tempestFrameAtTime(now)
    : growthFrameForProgress(progress, CORN_SPRITE.growthPhases);
  const offsetX = frameIndex * width;

  const style: CSSProperties = {
    width,
    height,
    backgroundImage: `url(${sheet.src})`,
    backgroundSize: `${sheetWidth}px ${height}px`,
    backgroundPosition: `-${offsetX}px 0`,
  };

  return (
    <span
      className={`pixel-art pointer-events-none absolute bottom-0 left-1/2 block -translate-x-1/2 bg-no-repeat ${rarityClass(rarityTint)}`}
      style={style}
      aria-hidden
    />
  );
}
