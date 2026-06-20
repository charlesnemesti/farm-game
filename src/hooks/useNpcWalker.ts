"use client";

import { useEffect, useRef, useState } from "react";
import { FARMER_SPRITE, type NpcDirection } from "@/lib/npcSprites";
import type { RoutePoint } from "@/lib/routeConfig";

export type NpcWalkerState = {
  x: number;
  y: number;
  direction: NpcDirection;
  frame: number;
  isMoving: boolean;
};

const WALK_SPEED = 55;

function directionBetween(
  from: RoutePoint,
  to: RoutePoint,
): NpcDirection {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

function cloneRoute(points: RoutePoint[]): RoutePoint[] {
  return points.map((point) => ({ ...point }));
}

/** Moves an NPC along route waypoints in a loop. */
export function useNpcWalker(
  route: RoutePoint[],
  paused = false,
): NpcWalkerState {
  const routeRef = useRef(route);
  routeRef.current = route;

  const [state, setState] = useState<NpcWalkerState>(() => {
    const first = route[0] ?? { x: 0, y: 0 };
    return {
      x: first.x,
      y: first.y,
      direction: "down",
      frame: 1,
      isMoving: true,
    };
  });

  const progressRef = useRef({
    segmentIndex: 0,
    t: 0,
    frameAccumulator: 0,
    frame: 0,
  });

  useEffect(() => {
    if (paused || route.length < 2) {
      setState((prev) => ({ ...prev, isMoving: false, frame: 1 }));
      return;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const points = cloneRoute(routeRef.current);
      if (points.length < 2) return;

      const progress = progressRef.current;
      const from = points[progress.segmentIndex];
      const to = points[(progress.segmentIndex + 1) % points.length];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy) || 1;

      progress.t += (WALK_SPEED * dt) / length;

      if (progress.t >= 1) {
        progress.t = 0;
        progress.segmentIndex = (progress.segmentIndex + 1) % points.length;
      }

      const currentFrom = points[progress.segmentIndex];
      const currentTo = points[(progress.segmentIndex + 1) % points.length];
      const x = currentFrom.x + (currentTo.x - currentFrom.x) * progress.t;
      const y = currentFrom.y + (currentTo.y - currentFrom.y) * progress.t;
      const direction = directionBetween(currentFrom, currentTo);

      progress.frameAccumulator += dt * 1000;
      if (progress.frameAccumulator >= FARMER_SPRITE.frameDurationMs) {
        progress.frameAccumulator = 0;
        progress.frame = (progress.frame + 1) % FARMER_SPRITE.framesPerDirection;
      }

      setState({
        x,
        y,
        direction,
        frame: progress.frame,
        isMoving: true,
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, route.length]);

  return state;
}
