"use client";

import { useCallback, useEffect, useState } from "react";
import { useTutorial } from "@/context/TutorialProvider";
import type { TutorialTargetId } from "@/lib/tutorialConfig";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function findTargetRect(target: TutorialTargetId): SpotlightRect | null {
  const element = document.querySelector(`[data-tutorial="${target}"]`);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const padding = 10;

  return {
    top: Math.max(0, rect.top - padding),
    left: Math.max(0, rect.left - padding),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function SpotlightShade({ rect }: { rect: SpotlightRect }) {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;

  return (
    <>
      <div
        className="pointer-events-auto fixed right-0 left-0 bg-black/62"
        style={{ top: 0, height: rect.top }}
      />
      <div
        className="pointer-events-auto fixed right-0 left-0 bg-black/62"
        style={{ top: bottom, bottom: 0 }}
      />
      <div
        className="pointer-events-auto fixed bg-black/62"
        style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }}
      />
      <div
        className="pointer-events-auto fixed bg-black/62"
        style={{ top: rect.top, left: right, right: 0, height: rect.height }}
      />
      <div
        className="tutorial-spotlight pointer-events-none fixed rounded-xl border-2 border-farm-sun"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />
    </>
  );
}

function TutorialModal({
  label,
  title,
  body,
  buttonLabel,
  onAction,
  onSkip,
}: {
  label: string;
  title: string;
  body: string;
  buttonLabel: string;
  onAction: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative z-[601] w-full max-w-md rounded-2xl border border-farm-sun/30 bg-black/95 p-6 text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-farm-sun/80">
          {label}
        </p>
        <h2 className="mt-2 text-xl font-bold text-farm-sun">{title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/75">
          {body}
        </p>
        <button
          type="button"
          onClick={onAction}
          className="relative z-[602] mt-6 w-full cursor-pointer rounded-xl bg-farm-sun py-3 text-sm font-bold text-farm-wood transition hover:bg-farm-sun-dark"
        >
          {buttonLabel}
        </button>
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className="mt-3 w-full cursor-pointer rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Skip tutorial
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function TutorialOverlay() {
  const {
    active,
    completed,
    reviewMode,
    step,
    stepConfig,
    advanceStep,
    finishTutorial,
    skipTutorial,
  } = useTutorial();
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);

  const useModal =
    reviewMode ||
    stepConfig.kind === "intro" ||
    stepConfig.kind === "info" ||
    stepConfig.kind === "complete";

  const updateSpotlight = useCallback(() => {
    if (!active || useModal || !stepConfig.target) {
      setSpotlight(null);
      return;
    }

    setSpotlight(findTargetRect(stepConfig.target));
  }, [active, stepConfig.target, useModal]);

  useEffect(() => {
    updateSpotlight();

    if (!active || useModal) return;

    const intervalId = window.setInterval(updateSpotlight, 200);
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [active, updateSpotlight, useModal]);

  if (completed) return null;

  if (step === "welcome" && active) {
    return (
      <TutorialModal
        label={`Tutorial · ${stepConfig.stepLabel}`}
        title={stepConfig.title}
        body={stepConfig.body}
        buttonLabel={reviewMode ? "Start review" : "Let's go"}
        onAction={advanceStep}
        onSkip={skipTutorial}
      />
    );
  }

  if (step === "done") {
    return (
      <TutorialModal
        label="Tutorial complete"
        title={stepConfig.title}
        body={stepConfig.body}
        buttonLabel="Start farming"
        onAction={finishTutorial}
      />
    );
  }

  if (!active) return null;

  if (useModal) {
    return (
      <TutorialModal
        label={`Tutorial · ${stepConfig.stepLabel}`}
        title={stepConfig.title}
        body={stepConfig.body}
        buttonLabel="Next"
        onAction={advanceStep}
        onSkip={skipTutorial}
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[600]">
      {spotlight ? (
        <SpotlightShade rect={spotlight} />
      ) : (
        <div className="pointer-events-auto fixed inset-0 bg-black/55" aria-hidden />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[601] flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-md rounded-xl border border-white/15 bg-black/92 p-4 text-white shadow-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-farm-sun/80">
            Tutorial · {stepConfig.stepLabel}
          </p>
          <h3 className="mt-1 text-sm font-bold text-farm-sun">{stepConfig.title}</h3>
          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-white/75">
            {stepConfig.body}
          </p>
          <button
            type="button"
            onClick={advanceStep}
            className="mt-3 w-full rounded-lg bg-farm-sun py-2 text-xs font-bold text-farm-wood transition hover:bg-farm-sun-dark"
          >
            Next
          </button>
          <button
            type="button"
            onClick={skipTutorial}
            className="mt-2 w-full rounded-lg border border-white/15 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
