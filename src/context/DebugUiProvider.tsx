"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DebugUiContextValue = {
  calibratorOpen: boolean;
  openCalibrator: () => void;
  closeCalibrator: () => void;
};

const DebugUiContext = createContext<DebugUiContextValue | null>(null);

export function DebugUiProvider({ children }: { children: ReactNode }) {
  const [calibratorOpen, setCalibratorOpen] = useState(true);

  const openCalibrator = useCallback(() => setCalibratorOpen(true), []);
  const closeCalibrator = useCallback(() => setCalibratorOpen(false), []);

  const value = useMemo(
    () => ({ calibratorOpen, openCalibrator, closeCalibrator }),
    [calibratorOpen, closeCalibrator, openCalibrator],
  );

  return (
    <DebugUiContext.Provider value={value}>{children}</DebugUiContext.Provider>
  );
}

export function useDebugUi() {
  const context = useContext(DebugUiContext);
  if (!context) {
    throw new Error("useDebugUi must be used within DebugUiProvider");
  }
  return context;
}
