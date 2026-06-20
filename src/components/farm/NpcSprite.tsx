import type { CSSProperties } from "react";
import {
  FARMER_SPRITE,
  type NpcDirection,
} from "@/lib/npcSprites";

type SpriteSheet = {
  src: string;
  frameWidth: number;
  frameHeight: number;
  framesPerDirection: number;
  directions: readonly NpcDirection[];
};

type NpcSpriteProps = {
  direction: NpcDirection;
  frame: number;
  scale: number;
  sheet?: SpriteSheet;
};

const DIRECTION_ROW: Record<NpcDirection, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

// Renders one NPC frame from a directional spritesheet.
export function NpcSprite({
  direction,
  frame,
  scale,
  sheet = FARMER_SPRITE,
}: NpcSpriteProps) {
  const width = sheet.frameWidth * scale;
  const height = sheet.frameHeight * scale;
  const sheetWidth = sheet.frameWidth * sheet.framesPerDirection * scale;
  const sheetHeight = sheet.frameHeight * sheet.directions.length * scale;
  const row = DIRECTION_ROW[direction];
  const clampedFrame = Math.max(
    0,
    Math.min(frame, sheet.framesPerDirection - 1),
  );

  const style: CSSProperties = {
    width,
    height,
    backgroundImage: `url(${sheet.src})`,
    backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
    backgroundPosition: `-${clampedFrame * sheet.frameWidth * scale}px -${row * sheet.frameHeight * scale}px`,
  };

  return (
    <span
      className="pixel-art pointer-events-none absolute bottom-0 left-1/2 block -translate-x-1/2 bg-no-repeat"
      style={style}
      aria-hidden
    />
  );
}
