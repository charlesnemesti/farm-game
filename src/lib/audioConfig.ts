// NOTE: All code must stay in English, even when requirements arrive in Spanish.

export const BACKGROUND_MUSIC_SRC = "/assets/audio/background-music.mp3";

/** Default playback volume (5%). */
export const DEFAULT_MUSIC_VOLUME = 0.05;

export const MUSIC_SETTINGS_STORAGE_KEY = "solfarm-music-settings-v1";

export type MusicSettings = {
  volume: number;
  muted: boolean;
};

export function clampMusicVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function loadMusicSettings(): MusicSettings {
  if (typeof window === "undefined") {
    return { volume: DEFAULT_MUSIC_VOLUME, muted: false };
  }

  try {
    const raw = localStorage.getItem(MUSIC_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { volume: DEFAULT_MUSIC_VOLUME, muted: false };
    }

    const data = JSON.parse(raw) as Partial<MusicSettings>;
    return {
      volume: clampMusicVolume(
        typeof data.volume === "number" ? data.volume : DEFAULT_MUSIC_VOLUME,
      ),
      muted: Boolean(data.muted),
    };
  } catch {
    return { volume: DEFAULT_MUSIC_VOLUME, muted: false };
  }
}

export function saveMusicSettings(settings: MusicSettings) {
  localStorage.setItem(MUSIC_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
