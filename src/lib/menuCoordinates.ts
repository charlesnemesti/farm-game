// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import { designToScreen, type CoverTransform } from "@/hooks/useCoverTransform";
import {
  FARM_MENU,
  GAME_MENU_DESIGN_ANCHOR,
  getGameMenuDisplaySize,
  MENU_ARTWORK_INSET,
  MENU_ARTWORK_INSET_CLAMP_FACTOR,
  MENU_REFERENCE_VIEWPORT,
  MENU_VIEWPORT_MARGIN_RATIO,
  MENU_VIEWPORT_TOP_RATIO,
  type ScreenPosition,
} from "./uiConfig";

export type GameMenuLayout = {
  position: ScreenPosition;
  size: { width: number; height: number };
  scale: number;
};

export function getGameMenuLayout(
  transform: CoverTransform,
  designAnchor: ScreenPosition = GAME_MENU_DESIGN_ANCHOR,
): GameMenuLayout {
  const { width, height } = getGameMenuDisplaySize(
    transform.viewportWidth,
    transform.viewportHeight,
  );
  const scale = width / FARM_MENU.width;
  const margin = Math.max(
    4,
    transform.viewportWidth * MENU_VIEWPORT_MARGIN_RATIO,
  );

  const defaultScreen = designToScreen(
    GAME_MENU_DESIGN_ANCHOR.x,
    GAME_MENU_DESIGN_ANCHOR.y,
    transform,
  );
  const calibratedScreen = designToScreen(
    designAnchor.x,
    designAnchor.y,
    transform,
  );
  const viewportScale = transform.viewportHeight / MENU_REFERENCE_VIEWPORT.height;
  const calibrationDeltaY =
    (calibratedScreen.y - defaultScreen.y) * viewportScale;

  let x = transform.viewportWidth - width - margin;
  let y = transform.viewportHeight * MENU_VIEWPORT_TOP_RATIO + calibrationDeltaY;

  const bounds = getMenuPositionBounds(
    width,
    height,
    transform.viewportWidth,
    transform.viewportHeight,
  );
  x = Math.min(Math.max(bounds.minX, x), bounds.maxX);
  y = Math.min(Math.max(bounds.minY, y), bounds.maxY);

  return {
    position: { x, y },
    size: { width, height },
    scale,
  };
}

/** @deprecated Use getGameMenuLayout instead. */
export function getGameMenuScreenPosition(
  designAnchor: ScreenPosition,
  transform: CoverTransform,
): ScreenPosition {
  return getGameMenuLayout(transform, designAnchor).position;
}

export function getMenuScale(menuWidth: number): number {
  return menuWidth / FARM_MENU.width;
}

export function getMenuEdgeMargin(viewportWidth: number): number {
  return Math.max(4, viewportWidth * MENU_VIEWPORT_MARGIN_RATIO);
}

export function getMenuClampScreenInsets(scale: number) {
  const factor = MENU_ARTWORK_INSET_CLAMP_FACTOR;
  return {
    left: MENU_ARTWORK_INSET.left * factor * scale,
    top: MENU_ARTWORK_INSET.top * factor * scale,
    right: MENU_ARTWORK_INSET.right * factor * scale,
    bottom: MENU_ARTWORK_INSET.bottom * factor * scale,
  };
}

export function getMenuPositionBounds(
  menuWidth: number,
  menuHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const margin = getMenuEdgeMargin(viewportWidth);
  const scale = menuWidth / FARM_MENU.width;
  const inset = getMenuClampScreenInsets(scale);

  return {
    minX: margin - inset.left,
    minY: margin - inset.top,
    maxX: viewportWidth - menuWidth - margin + inset.right,
    maxY: viewportHeight - menuHeight - margin + inset.bottom,
  };
}

/** Applies a saved viewport-relative position onto a responsive base layout. */
export function resolveMenuLayout(
  baseLayout: GameMenuLayout,
  viewportWidth: number,
  viewportHeight: number,
  positionRatio: { xRatio: number; yRatio: number } | null,
): GameMenuLayout {
  if (!positionRatio) return baseLayout;

  const position = ratioToMenuPosition(
    positionRatio,
    baseLayout.size.width,
    baseLayout.size.height,
    viewportWidth,
    viewportHeight,
  );

  return {
    ...baseLayout,
    position,
  };
}

export function ratioToMenuPosition(
  ratio: { xRatio: number; yRatio: number },
  menuWidth: number,
  menuHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): ScreenPosition {
  const bounds = getMenuPositionBounds(
    menuWidth,
    menuHeight,
    viewportWidth,
    viewportHeight,
  );
  const rangeX = Math.max(0, bounds.maxX - bounds.minX);
  const rangeY = Math.max(0, bounds.maxY - bounds.minY);

  return {
    x: bounds.minX + ratio.xRatio * rangeX,
    y: bounds.minY + ratio.yRatio * rangeY,
  };
}

export function menuPositionToRatio(
  position: ScreenPosition,
  menuWidth: number,
  menuHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): { xRatio: number; yRatio: number } {
  const bounds = getMenuPositionBounds(
    menuWidth,
    menuHeight,
    viewportWidth,
    viewportHeight,
  );
  const rangeX = Math.max(1, bounds.maxX - bounds.minX);
  const rangeY = Math.max(1, bounds.maxY - bounds.minY);

  return {
    xRatio: Math.min(1, Math.max(0, (position.x - bounds.minX) / rangeX)),
    yRatio: Math.min(1, Math.max(0, (position.y - bounds.minY) / rangeY)),
  };
}

export function clampMenuPosition(
  position: ScreenPosition,
  menuWidth: number,
  menuHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): ScreenPosition {
  const bounds = getMenuPositionBounds(
    menuWidth,
    menuHeight,
    viewportWidth,
    viewportHeight,
  );

  return {
    x: Math.min(Math.max(bounds.minX, position.x), bounds.maxX),
    y: Math.min(Math.max(bounds.minY, position.y), bounds.maxY),
  };
}

/** Layout with menu origin at (0, 0) for children inside a positioned shell. */
export function toLocalMenuLayout(layout: GameMenuLayout): GameMenuLayout {
  return {
    ...layout,
    position: { x: 0, y: 0 },
  };
}

/** Maps MENU.png pixel coordinates to screen pixels. */
export function menuToScreen(
  x: number,
  y: number,
  menuPosition: ScreenPosition,
  scale: number,
): { x: number; y: number } {
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
  scale: number,
): { x: number; y: number } {
  return {
    x: (x - menuPosition.x) / scale,
    y: (y - menuPosition.y) / scale,
  };
}
