// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const FARM_MENU = {
  src: "/assets/ui/MENU.png",
  width: 1133,
  height: 1600,
  /** On-screen width — height follows aspect ratio (base 290px + 60%). */
  displayWidth: 464,
} as const;

export type ScreenPosition = {
  x: number;
  y: number;
};

/** Default screen position for the draggable game menu panel. */
export const GAME_MENU_POSITION: ScreenPosition = {
  x: 24,
  y: 88,
};

export function getGameMenuDisplaySize() {
  const scale = FARM_MENU.displayWidth / FARM_MENU.width;
  return {
    width: FARM_MENU.displayWidth,
    height: FARM_MENU.height * scale,
  };
}
