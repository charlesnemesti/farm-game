// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { FARM_MENU, type ScreenPosition } from "./uiConfig";

export function getMenuScale(): number {
  return FARM_MENU.displayWidth / FARM_MENU.width;
}

/** Maps MENU.png pixel coordinates to screen pixels. */
export function menuToScreen(
  x: number,
  y: number,
  menuPosition: ScreenPosition,
): { x: number; y: number } {
  const scale = getMenuScale();
  return {
    x: menuPosition.x + x * scale,
    y: menuPosition.y + y * scale,
  };
}

/** Maps screen pixels back to MENU.png coordinates. */
export function screenToMenu(
  x: number,
  y: number,
  menuPosition: ScreenPosition,
): { x: number; y: number } {
  const scale = getMenuScale();
  return {
    x: (x - menuPosition.x) / scale,
    y: (y - menuPosition.y) / scale,
  };
}
