"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePlayMode } from "@/context/PlayModeProvider";
import {
  BACKGROUND_MUSIC_SRC,
  clampMusicVolume,
  DEFAULT_MUSIC_VOLUME,
  loadMusicSettings,
  saveMusicSettings,
} from "@/lib/audioConfig";

type BackgroundMusicContextValue = {
  hydrated: boolean;
  muted: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(
  null,
);

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const { canPlay } = usePlayMode();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.05);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const settings = loadMusicSettings();
    setVolumeState(settings.volume);
    setMuted(settings.muted);
    setHydrated(true);
  }, []);

  const applyAudioLevels = useCallback(
    (nextVolume: number, nextMuted: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = clampMusicVolume(nextVolume);
      audio.muted = nextMuted;
    },
    [],
  );

  const persistSettings = useCallback((nextVolume: number, nextMuted: boolean) => {
    saveMusicSettings({ volume: clampMusicVolume(nextVolume), muted: nextMuted });
  }, []);

  const setVolume = useCallback(
    (nextVolume: number) => {
      const clamped = clampMusicVolume(nextVolume);
      const nextMuted = clamped === 0;

      setVolumeState(clamped);
      setMuted(nextMuted);
      applyAudioLevels(clamped, nextMuted);
      persistSettings(clamped, nextMuted);
    },
    [applyAudioLevels, persistSettings],
  );

  const toggleMute = useCallback(() => {
    setMuted((currentMuted) => {
      const nextMuted = !currentMuted;
      let nextVolume = volume;

      if (!nextMuted && nextVolume === 0) {
        nextVolume = DEFAULT_MUSIC_VOLUME;
        setVolumeState(nextVolume);
      }

      applyAudioLevels(nextVolume, nextMuted);
      persistSettings(nextVolume, nextMuted);
      return nextMuted;
    });
  }, [applyAudioLevels, persistSettings, volume]);

  const tryStartPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasStartedRef.current) return;

    applyAudioLevels(volume, muted);

    try {
      await audio.play();
      hasStartedRef.current = true;
    } catch {
      // Browser autoplay policy — will retry on next user gesture.
    }
  }, [applyAudioLevels, muted, volume]);

  useEffect(() => {
    if (!hydrated || !canPlay) return;
    void tryStartPlayback();
  }, [canPlay, hydrated, tryStartPlayback]);

  useEffect(() => {
    if (!hydrated || !canPlay) return;

    const handleFirstInteraction = () => {
      void tryStartPlayback();
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    return () => window.removeEventListener("pointerdown", handleFirstInteraction);
  }, [canPlay, hydrated, tryStartPlayback]);

  useEffect(() => {
    applyAudioLevels(volume, muted);
  }, [applyAudioLevels, muted, volume]);

  const value = useMemo(
    () => ({
      hydrated,
      muted,
      volume,
      setVolume,
      toggleMute,
    }),
    [hydrated, muted, setVolume, toggleMute, volume],
  );

  return (
    <BackgroundMusicContext.Provider value={value}>
      <audio ref={audioRef} src={BACKGROUND_MUSIC_SRC} loop preload="auto" />
      {children}
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error("useBackgroundMusic must be used within BackgroundMusicProvider");
  }
  return context;
}
