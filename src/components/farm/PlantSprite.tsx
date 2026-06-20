import type { CSSProperties } from "react";
import {
  CORN_SPRITE,
  growthFrameForProgress,
  type CropKind,
  type PlantRarityTint,
} from "@/lib/plantSprites";

type PlantSpriteProps = {
  crop: CropKind;
  scale: number;
  /** Harvest cycle progress from 0 (just planted) to 1 (ready). */
  progress: number;
  rarityTint?: PlantRarityTint;
};

function spriteSheetFor(crop: CropKind) {
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
}: PlantSpriteProps) {
  const sheet = spriteSheetFor(crop);
  const width = sheet.frameWidth * scale;
  const height = sheet.frameHeight * scale;
  const sheetWidth = sheet.frameWidth * sheet.frameCount * scale;
  const frameIndex = growthFrameForProgress(progress, sheet.growthPhases);
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
