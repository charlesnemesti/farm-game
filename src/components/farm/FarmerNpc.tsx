"use client";

import { designToScreen, type CoverTransform } from "@/hooks/useCoverTransform";
import { useNpcWalker } from "@/hooks/useNpcWalker";
import { FARMER_SPRITE, NPC_DISPLAY_SCALE } from "@/lib/npcSprites";
import type { RoutePoint } from "@/lib/routeConfig";
import { NpcSprite } from "./NpcSprite";

type FarmerNpcProps = {
  route: RoutePoint[];
  transform: CoverTransform;
  paused?: boolean;
  onClick: () => void;
};

// Farmer NPC that patrols route waypoints; click opens dialogue.
export function FarmerNpc({
  route,
  transform,
  paused = false,
  onClick,
}: FarmerNpcProps) {
  const walker = useNpcWalker(route, paused);
  const screen = designToScreen(walker.x, walker.y, transform);
  const spriteScale = transform.scale * NPC_DISPLAY_SCALE;
  const width = FARMER_SPRITE.frameWidth * spriteScale;
  const height = FARMER_SPRITE.frameHeight * spriteScale;

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
      <NpcSprite
        direction={walker.direction}
        frame={walker.isMoving ? walker.frame : 1}
        scale={spriteScale}
      />
    </button>
  );
}
