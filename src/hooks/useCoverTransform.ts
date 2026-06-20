"use client";

import { useEffect, useState } from "react";
import { DESIGN_SIZE } from "@/lib/plotBoard";

export type CoverTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  viewportWidth: number;
  viewportHeight: number;
  ready: boolean;
};

function computeCoverTransform(
  viewportWidth: number,
  viewportHeight: number,
): Omit<CoverTransform, "ready"> {
  const w = Math.max(viewportWidth, 1);
  const h = Math.max(viewportHeight, 1);

  const scale = Math.max(
    w / DESIGN_SIZE.width,
    h / DESIGN_SIZE.height,
  );

  const drawnWidth = DESIGN_SIZE.width * scale;
  const drawnHeight = DESIGN_SIZE.height * scale;

  return {
    scale,
    offsetX: (w - drawnWidth) / 2,
    offsetY: (h - drawnHeight) / 2,
    viewportWidth: w,
    viewportHeight: h,
  };
}

/** Maps design-space coordinates (farm-scene.png pixels) to screen pixels. */
export function useCoverTransform(): CoverTransform {
  const [transform, setTransform] = useState<CoverTransform>(() => ({
    ...computeCoverTransform(DESIGN_SIZE.width, DESIGN_SIZE.height),
    ready: false,
  }));

  useEffect(() => {
    const update = () => {
      setTransform({
        ...computeCoverTransform(window.innerWidth, window.innerHeight),
        ready: true,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return transform;
}

export function designToScreen(
  x: number,
  y: number,
  transform: CoverTransform,
): { x: number; y: number } {
  return {
    x: transform.offsetX + x * transform.scale,
    y: transform.offsetY + y * transform.scale,
  };
}

/** Maps screen pixels back to farm-scene.png design coordinates. */
export function screenToDesign(
  x: number,
  y: number,
  transform: CoverTransform,
): { x: number; y: number } {
  return {
    x: (x - transform.offsetX) / transform.scale,
    y: (y - transform.offsetY) / transform.scale,
  };
}
