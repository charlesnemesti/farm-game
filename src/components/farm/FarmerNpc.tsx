"use client";

import { designToScreen, type CoverTransform } from "@/hooks/useCoverTransform";
import { useFarmerTipBreaks } from "@/hooks/useFarmerTipBreaks";
import { useNpcWalker } from "@/hooks/useNpcWalker";
import { FARMER_NPC, FARMER_SPRITE, NPC_DISPLAY_SCALE } from "@/lib/npcSprites";
import type { RoutePoint } from "@/lib/routeConfig";
import { NpcSpeechBubble } from "./NpcSpeechBubble";
import { NpcSprite } from "./NpcSprite";

type FarmerNpcProps = {
  route: RoutePoint[];
  transform: CoverTransform;
  paused?: boolean;
  onClick: () => void;
};

const CAMERA_FACING_DIRECTION = "down" as const;

// Farmer NPC that patrols route waypoints; click opens dialogue.
export function FarmerNpc({
  route,
  transform,
  paused = false,
  onClick,
}: FarmerNpcProps) {
  const tipBreak = useFarmerTipBreaks(paused);
  const walker = useNpcWalker(route, paused || tipBreak.active);
  const screen = designToScreen(walker.x, walker.y, transform);
  const spriteScale = transform.scale * NPC_DISPLAY_SCALE;
  const width = FARMER_SPRITE.frameWidth * spriteScale;
  const height = FARMER_SPRITE.frameHeight * spriteScale;
  const direction = tipBreak.active ? CAMERA_FACING_DIRECTION : walker.direction;
  const frame = tipBreak.active || !walker.isMoving ? 1 : walker.frame;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute z-[15] cursor-pointer"
      style={{
        left: screen.x - width / 2,
        top: screen.y - height,
        width,
        height,
      }}
      aria-label="Talk to farmer"
    >
      {tipBreak.active && tipBreak.tip ? (
        <NpcSpeechBubble text={tipBreak.tip} speaker={FARMER_NPC.name} />
      ) : null}

      <NpcSprite direction={direction} frame={frame} scale={spriteScale} />
    </button>
  );
}
