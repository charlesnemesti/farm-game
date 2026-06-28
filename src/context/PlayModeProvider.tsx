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
  clearPlayMode,
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
  /** Return to login and disconnect wallet. */
  signOut: () => void;
  /** Return to login to pick Demo or Wallet again. */
  switchPlayMode: () => void;
};

const PlayModeContext = createContext<PlayModeContextValue | null>(null);

export function PlayModeProvider({ children }: { children: ReactNode }) {
  const { connected, disconnect } = useWallet();
  const [playMode, setPlayMode] = useState<PlayMode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    clearPlayMode();
    setHydrated(true);
  }, []);

  const selectPlayMode = useCallback((mode: PlayMode) => {
    setPlayMode(mode);
  }, []);

  const signOut = useCallback(() => {
    clearPlayMode();
    setPlayMode(null);
    if (connected) {
      void disconnect();
    }
  }, [connected, disconnect]);

  const switchPlayMode = useCallback(() => {
    clearPlayMode();
    setPlayMode(null);
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
      signOut,
      switchPlayMode,
    }),
    [
      connected,
      gateActive,
      canPlay,
      hydrated,
      playMode,
      selectPlayMode,
      signOut,
      switchPlayMode,
    ],
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
