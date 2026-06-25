"use client";

import { useEffect, useRef, useState } from "react";
import {
  FARMER_TIP_DISPLAY_MS,
  FARMER_TIP_INTERVAL_MS,
  pickFarmerTip,
} from "@/lib/farmerTips";

export type FarmerTipBreakState = {
  active: boolean;
  tip: string | null;
};

/** Triggers a periodic tip break for Old Mac (pause + speech bubble). */
export function useFarmerTipBreaks(disabled = false): FarmerTipBreakState {
  const [state, setState] = useState<FarmerTipBreakState>({
    active: false,
    tip: null,
  });
  const lastTipRef = useRef<string | undefined>(undefined);
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = state.active;
  }, [state.active]);

  useEffect(() => {
    if (disabled) {
      setState({ active: false, tip: null });
      return;
    }

    const intervalId = window.setInterval(() => {
      if (activeRef.current) return;

      const tip = pickFarmerTip(lastTipRef.current);
      lastTipRef.current = tip;
      setState({ active: true, tip });
    }, FARMER_TIP_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [disabled]);

  useEffect(() => {
    if (!state.active) return;

    const timeoutId = window.setTimeout(() => {
      setState({ active: false, tip: null });
    }, FARMER_TIP_DISPLAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [state.active, state.tip]);

  return state;
}
