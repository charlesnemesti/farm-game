// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const HUD_PANEL = {
  src: "/assets/ui/header-panel.png",
  width: 834,
  height: 132,
  /** Rendered panel height on screen; width follows aspect ratio unless overridden. */
  displayHeight: 58,
  /** Compact strip used under the wallet panel (≈⅓ of displayHeight). */
  musicControlHeight: 19,
  /** Parchment insets inside the wooden frame (fractions of panel box). */
  paddingTop: 0.27,
  paddingBottom: 0.27,
  paddingLeft: 0.09,
  paddingRight: 0.09,
} as const;

export function getHudPanelWidth(displayHeight = HUD_PANEL.displayHeight): number {
  return displayHeight * (HUD_PANEL.width / HUD_PANEL.height);
}
