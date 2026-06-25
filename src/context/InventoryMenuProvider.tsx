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
import { useTutorial } from "@/context/TutorialProvider";
import {
  loadInventoryMenuState,
  saveInventoryMenuState,
  type MenuPositionRatio,
} from "@/lib/inventoryMenuState";

type InventoryMenuContextValue = {
  hydrated: boolean;
  isOpen: boolean;
  positionRatio: MenuPositionRatio | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setPositionRatio: (ratio: MenuPositionRatio | null) => void;
};

const InventoryMenuContext = createContext<InventoryMenuContextValue | null>(null);

const INVENTORY_TUTORIAL_TARGETS = new Set(["inventory-pack", "inventory-seed"]);

type MenuState = {
  open: boolean;
  positionRatio: MenuPositionRatio | null;
};

export function InventoryMenuProvider({ children }: { children: ReactNode }) {
  const { active, stepConfig } = useTutorial();
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<MenuState>({
    open: true,
    positionRatio: null,
  });

  useEffect(() => {
    const saved = loadInventoryMenuState();
    setState({
      open: saved.open,
      positionRatio: saved.positionRatio,
    });
    setHydrated(true);
  }, []);

  const open = useCallback(() => {
    setState((prev) => {
      if (prev.open) return prev;
      const next = { ...prev, open: true };
      saveInventoryMenuState({
        open: next.open,
        positionRatio: next.positionRatio,
      });
      return next;
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => {
      if (!prev.open) return prev;
      const next = { ...prev, open: false };
      saveInventoryMenuState({
        open: next.open,
        positionRatio: next.positionRatio,
      });
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, open: !prev.open };
      saveInventoryMenuState({
        open: next.open,
        positionRatio: next.positionRatio,
      });
      return next;
    });
  }, []);

  const setPositionRatio = useCallback(
    (ratio: MenuPositionRatio | null) => {
      setState((prev) => {
        const next = { ...prev, positionRatio: ratio };
        saveInventoryMenuState({
          open: next.open,
          positionRatio: next.positionRatio,
        });
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (!active || !hydrated) return;
    const target = stepConfig.target;
    if (target && INVENTORY_TUTORIAL_TARGETS.has(target)) {
      open();
    }
  }, [active, hydrated, open, stepConfig.target]);

  const value = useMemo(
    () => ({
      hydrated,
      isOpen: state.open,
      positionRatio: state.positionRatio,
      open,
      close,
      toggle,
      setPositionRatio,
    }),
    [close, hydrated, open, setPositionRatio, state.open, state.positionRatio, toggle],
  );

  return (
    <InventoryMenuContext.Provider value={value}>
      {children}
    </InventoryMenuContext.Provider>
  );
}

export function useInventoryMenu() {
  const context = useContext(InventoryMenuContext);
  if (!context) {
    throw new Error("useInventoryMenu must be used within InventoryMenuProvider");
  }
  return context;
}
