"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useTutorial } from "@/context/TutorialProvider";
import { useInventoryMenu } from "@/context/InventoryMenuProvider";
import { useCoverTransform } from "@/hooks/useCoverTransform";
import { useSlotCalibration } from "@/hooks/useSlotCalibration";
import { getGameMenuLayout, resolveMenuLayout } from "@/lib/menuCoordinates";
import { FARMER_NPC } from "@/lib/npcSprites";
import { FARM_BACKGROUND, PLOT_SLOTS } from "@/lib/plotBoard";
import { ROUTE_POINTS } from "@/lib/routeConfig";
import { BackpackToggle } from "@/components/game/BackpackToggle";
import { DevDebugPanel } from "@/components/game/DevDebugPanel";
import { InventoryDebugOverlay } from "@/components/game/InventoryDebugOverlay";
import { InventoryMenuShell } from "@/components/game/InventoryMenuShell";
import { DebugOverlay } from "./DebugOverlay";
import { FarmerNpc } from "./FarmerNpc";
import { PlotBoard } from "./PlotBoard";
import { PlotRowUnlockLayer } from "./PlotRowUnlockLayer";
import { NpcDialog } from "./NpcDialog";
import { SeedShopPanel } from "./SeedShopPanel";
import { SeedShopSign } from "./SeedShopSign";
import { SlotCalibratorPanel } from "./SlotCalibratorPanel";
import { VillagerNpc } from "./VillagerNpc";

function FarmSceneContent() {
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1";
  const transform = useCoverTransform();
  const calibration = useSlotCalibration();
  const {
    hydrated: menuHydrated,
    isOpen: inventoryMenuOpen,
    positionRatio,
    open: openInventoryMenu,
    close: closeInventoryMenu,
    setPositionRatio,
  } = useInventoryMenu();
  const [calibratorOpen, setCalibratorOpen] = useState(true);
  const [showCropMarkers, setShowCropMarkers] = useState(false);
  const [showRouteMarkers, setShowRouteMarkers] = useState(false);
  const [showInventoryMarkers, setShowInventoryMarkers] = useState(false);
  const [farmerDialogOpen, setFarmerDialogOpen] = useState(false);
  const [villagerDialogOpen, setVillagerDialogOpen] = useState(false);
  const { notifyEvent } = useTutorial();
  const sceneReady = transform.ready && calibration.hydrated && menuHydrated;
  const baseMenuLayout = useMemo(
    () => getGameMenuLayout(transform, calibration.gameMenuDesignAnchor),
    [calibration.gameMenuDesignAnchor, transform],
  );
  const menuLayout = useMemo(
    () =>
      resolveMenuLayout(
        baseMenuLayout,
        transform.viewportWidth,
        transform.viewportHeight,
        positionRatio,
      ),
    [
      baseMenuLayout,
      positionRatio,
      transform.viewportHeight,
      transform.viewportWidth,
    ],
  );

  return (
    <div className="farm-scene relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${FARM_BACKGROUND})` }}
        aria-hidden
      />

      {sceneReady ? (
        <>
          <PlotBoard transform={transform} />

          <PlotRowUnlockLayer transform={transform} />

          <FarmerNpc
            route={ROUTE_POINTS}
            transform={transform}
            paused={farmerDialogOpen}
            onClick={() => setFarmerDialogOpen(true)}
          />

          <SeedShopSign transform={transform} />

          <VillagerNpc
            transform={transform}
            dialogOpen={villagerDialogOpen}
            onOpenDialog={() => {
              setVillagerDialogOpen(true);
              notifyEvent("shop-opened");
            }}
            onCloseDialog={() => setVillagerDialogOpen(false)}
            shopContent={<SeedShopPanel />}
          />

          <NpcDialog
            open={farmerDialogOpen}
            name={FARMER_NPC.name}
            message={FARMER_NPC.greeting}
            onClose={() => setFarmerDialogOpen(false)}
          />

          {inventoryMenuOpen ? (
            <InventoryMenuShell
              layout={menuLayout}
              transform={transform}
              calibratorActive={debug && calibration.target.kind === "gameMenu"}
              onClose={closeInventoryMenu}
              onPositionCommit={setPositionRatio}
            />
          ) : (
            <BackpackToggle onClick={openInventoryMenu} />
          )}

          {debug ? (
            <>
              <DevDebugPanel />

              <DebugOverlay
                transform={transform}
                slots={PLOT_SLOTS}
                routePoints={ROUTE_POINTS}
                target={calibration.target}
                showCropMarkers={showCropMarkers}
                showRouteMarkers={showRouteMarkers}
                onSelect={calibration.setTarget}
                onMoveSlot={calibration.setSlotPosition}
                onMoveRoutePoint={calibration.setRoutePointPosition}
              />

              <InventoryDebugOverlay
                menuLayout={menuLayout}
                slots={calibration.inventorySlots}
                target={calibration.target}
                visible={showInventoryMarkers}
                onSelect={calibration.setTarget}
                onMoveSlot={calibration.setInventorySlotPosition}
              />

              {calibratorOpen ? (
                <SlotCalibratorPanel
                  target={calibration.target}
                  step={calibration.step}
                  copied={calibration.copied}
                  showCropMarkers={showCropMarkers}
                  showRouteMarkers={showRouteMarkers}
                  showInventoryMarkers={showInventoryMarkers}
                  onToggleCropMarkers={() => setShowCropMarkers((prev) => !prev)}
                  onToggleRouteMarkers={() => setShowRouteMarkers((prev) => !prev)}
                  onToggleInventoryMarkers={() =>
                    setShowInventoryMarkers((prev) => !prev)
                  }
                  onTargetChange={calibration.setTarget}
                  onStepChange={calibration.setStep}
                  onNudge={calibration.nudge}
                  onColumnSpacing={calibration.adjustColumnSpacing}
                  onRowSpacing={calibration.adjustRowSpacing}
                  onReset={calibration.reset}
                  onCopy={calibration.copyConfig}
                  onClose={() => setCalibratorOpen(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setCalibratorOpen(true)}
                  className="absolute top-16 right-4 z-[120] rounded-lg border border-white/20 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-black/90"
                >
                  Open calibrator
                </button>
              )}
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

// Fullscreen farm background with invisible plot board over the furrows.
export function FarmScene() {
  return (
    <Suspense fallback={<div className="farm-scene h-full w-full bg-black" />}>
      <FarmSceneContent />
    </Suspense>
  );
}
