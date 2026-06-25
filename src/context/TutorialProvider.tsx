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
import { useGame } from "@/context/GameProvider";
import { isSeedPack } from "@/lib/itemConfig";
import {
  clearTutorialCompleted,
  getTutorialStepConfig,
  isInteractiveTutorialStep,
  loadTutorialCompleted,
  saveTutorialCompleted,
  TUTORIAL_STEP_ORDER,
  type TutorialEvent,
  type TutorialStepId,
  type TutorialTargetId,
} from "@/lib/tutorialConfig";

type TutorialNotifyMeta = {
  plotId?: number;
  slotId?: number;
};

type TutorialContextValue = {
  active: boolean;
  completed: boolean;
  reviewMode: boolean;
  step: TutorialStepId;
  stepConfig: ReturnType<typeof getTutorialStepConfig>;
  isStep: (stepId: TutorialStepId) => boolean;
  isTargetStep: (target: TutorialTargetId) => boolean;
  notifyEvent: (event: TutorialEvent, meta?: TutorialNotifyMeta) => void;
  advanceStep: () => void;
  finishTutorial: () => void;
  skipTutorial: () => void;
  restartTutorial: (reviewMode?: boolean) => void;
  tutorialCrop: { plotId: number; slotId: number } | null;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

const EVENT_TO_STEP: Partial<Record<TutorialEvent, TutorialStepId>> = {
  "shop-opened": "open-shop",
  "pack-purchased": "buy-pack",
  "pack-clicked": "open-pack",
  "pack-confirmed": "confirm-open",
  "seeds-collected": "collect-seeds",
  "seed-selected": "select-seed",
  "seed-planted": "plant-seed",
  "harvest-received": "wait-harvest",
};

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { canPlay } = usePlayMode();
  const { hydrated, inventory, plantedCrops, accelerateCropCycle } = useGame();
  const [completed, setCompleted] = useState(true);
  const [hydratedTutorial, setHydratedTutorial] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [manualReplay, setManualReplay] = useState(false);
  const [step, setStep] = useState<TutorialStepId>("welcome");
  const [tutorialCrop, setTutorialCrop] = useState<{
    plotId: number;
    slotId: number;
  } | null>(null);
  const tutorialCropRef = useRef<{ plotId: number; slotId: number } | null>(null);

  useEffect(() => {
    setCompleted(loadTutorialCompleted());
    setHydratedTutorial(true);
  }, []);

  const active =
    hydratedTutorial && hydrated && canPlay && !completed && step !== "done";

  const goToNextStep = useCallback((fromStep: TutorialStepId) => {
    const index = TUTORIAL_STEP_ORDER.indexOf(fromStep);
    if (index < 0 || index >= TUTORIAL_STEP_ORDER.length - 1) return;
    setStep(TUTORIAL_STEP_ORDER[index + 1]);
  }, []);

  const skipTutorial = useCallback(() => {
    saveTutorialCompleted();
    setCompleted(true);
    setStep("done");
    setReviewMode(false);
    tutorialCropRef.current = null;
    setTutorialCrop(null);
  }, []);

  const finishTutorial = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  const restartTutorial = useCallback((review = false) => {
    clearTutorialCompleted();
    setCompleted(false);
    setReviewMode(review);
    setManualReplay(!review);
    setStep("welcome");
    tutorialCropRef.current = null;
    setTutorialCrop(null);
  }, []);

  const advanceStep = useCallback(() => {
    goToNextStep(step);
  }, [goToNextStep, step]);

  const notifyEvent = useCallback(
    (event: TutorialEvent, meta?: TutorialNotifyMeta) => {
      if (!active || reviewMode) return;

      const expectedStep = EVENT_TO_STEP[event];
      if (!expectedStep || step !== expectedStep) return;

      if (event === "seed-planted" && meta?.plotId !== undefined && meta?.slotId !== undefined) {
        const crop = { plotId: meta.plotId, slotId: meta.slotId };
        tutorialCropRef.current = crop;
        setTutorialCrop(crop);
        accelerateCropCycle(meta.plotId, meta.slotId);
      }

      if (event === "harvest-received") {
        goToNextStep("wait-harvest");
        return;
      }

      goToNextStep(expectedStep);
    },
    [active, accelerateCropCycle, goToNextStep, reviewMode, step],
  );

  useEffect(() => {
    if (!active || reviewMode || manualReplay) return;

    const hasPack = inventory.some(
      (entry) => entry !== null && isSeedPack(entry.itemId),
    );

    if (step === "buy-pack" && hasPack) {
      goToNextStep("buy-pack");
    }

    if (step === "plant-seed" && plantedCrops.length > 0) {
      const crop = plantedCrops[0];
      const coords = { plotId: crop.plotId, slotId: crop.slotId };
      tutorialCropRef.current = coords;
      setTutorialCrop(coords);
      accelerateCropCycle(crop.plotId, crop.slotId);
      goToNextStep("plant-seed");
    }
  }, [active, accelerateCropCycle, goToNextStep, inventory, manualReplay, plantedCrops, reviewMode, step]);

  const stepConfig = getTutorialStepConfig(step);

  const value = useMemo(
    () => ({
      active,
      completed,
      reviewMode,
      step,
      stepConfig,
      isStep: (stepId: TutorialStepId) => step === stepId,
      isTargetStep: (target: TutorialTargetId) =>
        !reviewMode &&
        isInteractiveTutorialStep(step) &&
        stepConfig.target === target,
      notifyEvent,
      advanceStep,
      finishTutorial,
      skipTutorial,
      restartTutorial,
      tutorialCrop,
    }),
    [
      active,
      advanceStep,
      completed,
      finishTutorial,
      notifyEvent,
      restartTutorial,
      reviewMode,
      skipTutorial,
      step,
      stepConfig,
      tutorialCrop,
    ],
  );

  return (
    <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
}
