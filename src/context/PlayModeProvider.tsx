"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  loadPlayMode,
  savePlayMode,
  type PlayMode,
} from "@/lib/playMode";

type PlayModeContextValue = {
  playMode: PlayMode | null;
  hydrated: boolean;
  walletConnected: boolean;
  /** Block gameplay until a mode is chosen (and wallet connected in wallet mode). */
  gateActive: boolean;
  canPlay: boolean;
  selectPlayMode: (mode: PlayMode) => void;
};

const PlayModeContext = createContext<PlayModeContextValue | null>(null);

export function PlayModeProvider({ children }: { children: ReactNode }) {
  const { connected } = useWallet();
  const [playMode, setPlayMode] = useState<PlayMode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlayMode(loadPlayMode());
    setHydrated(true);
  }, []);

  const selectPlayMode = useCallback((mode: PlayMode) => {
    savePlayMode(mode);
    setPlayMode(mode);
  }, []);

  const gateActive =
    hydrated && (playMode === null || (playMode === "wallet" && !connected));

  const canPlay =
    hydrated &&
    playMode !== null &&
    (playMode === "demo" || (playMode === "wallet" && connected));

  const value = useMemo(
    () => ({
      playMode,
      hydrated,
      walletConnected: connected,
      gateActive,
      canPlay,
      selectPlayMode,
    }),
    [connected, gateActive, canPlay, hydrated, playMode, selectPlayMode],
  );

  return (
    <PlayModeContext.Provider value={value}>{children}</PlayModeContext.Provider>
  );
}

export function usePlayMode() {
  const context = useContext(PlayModeContext);
  if (!context) {
    throw new Error("usePlayMode must be used within PlayModeProvider");
  }
  return context;
}
