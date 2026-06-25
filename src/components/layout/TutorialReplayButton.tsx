"use client";

import { usePathname } from "next/navigation";
import { HudPanel } from "@/components/layout/HudPanel";
import { usePlayMode } from "@/context/PlayModeProvider";
import { useTutorial } from "@/context/TutorialProvider";
import { isDocsRoute } from "@/lib/routes";

const TUTORIAL_BUTTON_WIDTH = 148;

// Bottom-right framed control to replay the gameplay tutorial.
export function TutorialReplayButton() {
  const pathname = usePathname();
  const { canPlay } = usePlayMode();
  const { active, restartTutorial } = useTutorial();

  if (!canPlay || isDocsRoute(pathname) || active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-2 bottom-3 z-[45] sm:right-3 sm:bottom-4">
      <HudPanel
        width={TUTORIAL_BUTTON_WIDTH}
        displayHeight={52}
        className="pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => restartTutorial()}
          className="hud-action-button w-full min-w-0 shrink"
          title="Replay the gameplay tutorial"
        >
          <span className="hud-action-button__icon text-[11px]" aria-hidden>
            ?
          </span>
          Tutorial
        </button>
      </HudPanel>
    </div>
  );
}
