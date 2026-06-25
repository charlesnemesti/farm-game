// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const FARM_MENU = {
  src: "/assets/ui/MENU.png",
  width: 1133,
  height: 1600,
  /** Legacy reference width at MENU_REFERENCE_VIEWPORT (used by calibrator). */
  displayWidth: 464,
} as const;

/** Viewport where the menu was originally tuned (landscape 1080p). */
export const MENU_REFERENCE_VIEWPORT = {
  width: 1920,
  height: 1080,
} as const;

/** Menu width as a fraction of viewport width (~464px @ 1920). */
export const MENU_VIEWPORT_WIDTH_RATIO =
  FARM_MENU.displayWidth / MENU_REFERENCE_VIEWPORT.width;

/** Menu top edge as a fraction of viewport height (right-aligned @ 1920×1080). */
export const MENU_VIEWPORT_TOP_RATIO = 416.84 / MENU_REFERENCE_VIEWPORT.height;

/** Screen-edge padding in pixels (scales with viewport width). */
export const MENU_VIEWPORT_MARGIN_RATIO = 8 / MENU_REFERENCE_VIEWPORT.width;

/** Max menu height as a fraction of viewport height before width is reduced. */
export const MENU_MAX_VIEWPORT_HEIGHT_RATIO = 0.62;

/**
 * Transparent padding inside MENU.png around the visible wooden frame.
 * Values are in MENU.png pixels (1133×1600).
 */
export const MENU_ARTWORK_INSET = {
  left: 165,
  top: 65,
  right: 175,
  bottom: 220,
} as const;

/** Drag/clamp bounds use this fraction of MENU_ARTWORK_INSET (0.5 = 50% tighter). */
export const MENU_ARTWORK_INSET_CLAMP_FACTOR = 0.5;

/** Draggable title-bar region at the top of the menu (fraction of menu height). */
export const MENU_DRAG_HANDLE_HEIGHT_RATIO = 0.14;

/** Close button placement as a fraction of menu width/height from top-right. */
export const MENU_CLOSE_BUTTON = {
  topRatio: 0.028,
  rightRatio: 0.04,
  sizeRatio: 0.0975,
  /** Extra screen-pixel nudge after ratio placement. */
  screenOffsetX: -58,
  screenOffsetY: 27,
} as const;

/** Corn Farm title logo centered on the menu's top wooden plaque. */
export const MENU_TITLE = {
  src: "/assets/ui/corn-farm-title.png",
  width: 1000,
  height: 529,
  anchorX: 566,
  anchorY: 100,
  displayWidth: 450,
  /** Fine-tune position in rendered menu pixels. */
  screenOffsetX: -15,
  screenOffsetY: 25,
} as const;

export type ScreenPosition = {
  x: number;
  y: number;
};

/** Top-left anchor in farm-scene.png design space (1024×571). */
export const GAME_MENU_DESIGN_ANCHOR: ScreenPosition = {
  x: 838,
  y: 284,
};

/** @deprecated Alias for GAME_MENU_DESIGN_ANCHOR (design space, not screen pixels). */
export const GAME_MENU_POSITION = GAME_MENU_DESIGN_ANCHOR;

/** First stats line anchor in MENU.png space (centered under the Stats divider). */
export const STATS_TEXT_ANCHOR = {
  x: 566,
  y: 980,
  /** Extra downward offset applied in screen pixels after menu scaling. */
  screenOffsetY: 10,
  /** Vertical gap between stats lines in screen pixels. */
  lineGap: 6,
} as const;

export function getGameMenuDisplaySize(
  viewportWidth: number,
  viewportHeight: number,
) {
  const w = Math.max(viewportWidth, 1);
  const h = Math.max(viewportHeight, 1);
  const aspect = FARM_MENU.height / FARM_MENU.width;

  let width = w * MENU_VIEWPORT_WIDTH_RATIO;
  let height = width * aspect;
  const maxHeight = h * MENU_MAX_VIEWPORT_HEIGHT_RATIO;

  if (height > maxHeight) {
    height = maxHeight;
    width = height / aspect;
  }

  return { width, height };
}
