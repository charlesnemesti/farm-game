"use client";

import { useEffect, useState } from "react";
import type { NpcDirection } from "@/lib/npcSprites";

const DIRECTIONS: NpcDirection[] = ["down", "left", "right", "up"];

function pickNextDirection(current: NpcDirection): NpcDirection {
  const options = DIRECTIONS.filter((dir) => dir !== current);
  return options[Math.floor(Math.random() * options.length)] ?? current;
}

function randomDelayMs(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}

/** Cycles facing direction every 2–4 seconds while the NPC stays in place. */
export function useIdleDirectionCycle(active = true) {
  const [direction, setDirection] = useState<NpcDirection>("down");

  useEffect(() => {
    if (!active) return;

    let timeoutId = 0;

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        setDirection((prev) => pickNextDirection(prev));
        scheduleNext();
      }, randomDelayMs(2000, 4000));
    };

    scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, [active]);

  return direction;
}
