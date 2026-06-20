"use client";

import type { ReactNode } from "react";
import { designToScreen, type CoverTransform } from "@/hooks/useCoverTransform";
import { useIdleDirectionCycle } from "@/hooks/useIdleDirectionCycle";
import { getVillagerDesignAnchor, NPC_DISPLAY_SCALE, VILLAGER_NPC, VILLAGER_SPRITE } from "@/lib/npcSprites";
import { NpcPopup } from "./NpcPopup";
import { NpcSprite } from "./NpcSprite";

type VillagerNpcProps = {
  transform: CoverTransform;
  dialogOpen: boolean;
  onOpenDialog: () => void;
  onCloseDialog: () => void;
  shopContent?: ReactNode;
};

// Stationary villager on the right path; rotates facing every 2–4 s.
export function VillagerNpc({
  transform,
  dialogOpen,
  onOpenDialog,
  onCloseDialog,
  shopContent,
}: VillagerNpcProps) {
  const direction = useIdleDirectionCycle(!dialogOpen);
  const anchor = getVillagerDesignAnchor();
  const screen = designToScreen(anchor.x, anchor.y, transform);
  const spriteScale = transform.scale * NPC_DISPLAY_SCALE;
  const width = VILLAGER_SPRITE.frameWidth * spriteScale;
  const height = VILLAGER_SPRITE.frameHeight * spriteScale;

  return (
    <div
      className="absolute z-[15]"
      style={{
        left: screen.x - width / 2,
        top: screen.y - height,
        width,
        height,
      }}
    >
      <button
        type="button"
        onClick={onOpenDialog}
        className="absolute inset-0 cursor-pointer"
        aria-label={`Talk to ${VILLAGER_NPC.name}`}
      >
        <NpcSprite
          sheet={VILLAGER_SPRITE}
          direction={direction}
          frame={0}
          scale={spriteScale}
        />
      </button>

      {dialogOpen ? (
        <div
          className="absolute z-[200]"
          style={{
            right: width + 8,
            top: height / 2,
            transform: "translateY(-50%)",
          }}
        >
          <NpcPopup
            open
            title="Seed Shop"
            onClose={onCloseDialog}
            className="w-64"
          >
            {shopContent}
          </NpcPopup>
        </div>
      ) : null}
    </div>
  );
}
