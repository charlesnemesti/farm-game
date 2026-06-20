// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export type PlayMode = "demo" | "wallet";

export const PLAY_MODE_STORAGE_KEY = "solfarm-play-mode-v1";

export function loadPlayMode(): PlayMode | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem(PLAY_MODE_STORAGE_KEY);
  if (saved === "demo" || saved === "wallet") return saved;
  return null;
}

export function savePlayMode(mode: PlayMode) {
  localStorage.setItem(PLAY_MODE_STORAGE_KEY, mode);
}

export function clearPlayMode() {
  localStorage.removeItem(PLAY_MODE_STORAGE_KEY);
}
