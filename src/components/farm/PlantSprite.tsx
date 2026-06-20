import type { CSSProperties } from "react";
import {
  CORN_SPRITE,
  type CropKind,
  type PlantRarityTint,
} from "@/lib/plantSprites";

type PlantSpriteProps = {
  crop: CropKind;
  scale: number;
  animate?: boolean;
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
  animate = true,
  rarityTint,
}: PlantSpriteProps) {
  const sheet = spriteSheetFor(crop);
  const width = sheet.frameWidth * scale;
  const height = sheet.frameHeight * scale;
  const sheetWidth = sheet.frameWidth * sheet.frameCount * scale;
  const duration = (sheet.frameCount * sheet.frameDurationMs) / 1000;

  const style: CSSProperties = {
    width,
    height,
    backgroundImage: `url(${sheet.src})`,
    backgroundSize: `${sheetWidth}px ${height}px`,
    backgroundPosition: "0 0",
    ["--sheet-offset" as string]: `-${sheetWidth}px`,
    ...(animate
      ? {
          animation: `plant-sheet-play ${duration}s steps(${sheet.frameCount}) infinite`,
        }
      : {}),
  };

  return (
    <span
      className={`pixel-art pointer-events-none absolute bottom-0 left-1/2 block -translate-x-1/2 bg-no-repeat ${rarityClass(rarityTint)}`}
      style={style}
      aria-hidden
    />
  );
}
