"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useCoverTransform } from "@/hooks/useCoverTransform";
import { useSlotCalibration } from "@/hooks/useSlotCalibration";
import { FARMER_NPC } from "@/lib/npcSprites";
import { FARM_BACKGROUND, PLOT_SLOTS } from "@/lib/plotBoard";
import { ROUTE_POINTS } from "@/lib/routeConfig";
import { DevDebugPanel } from "@/components/game/DevDebugPanel";
import { GameMenuPanel } from "@/components/game/GameMenuPanel";
import { InventoryDebugOverlay } from "@/components/game/InventoryDebugOverlay";
import { InventoryPanel } from "@/components/game/InventoryPanel";
import { MenuStatsPanel } from "@/components/game/MenuStatsPanel";
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
  const [menuOpen, setMenuOpen] = useState(true);
  const [showCropMarkers, setShowCropMarkers] = useState(false);
  const [showRouteMarkers, setShowRouteMarkers] = useState(false);
  const [showInventoryMarkers, setShowInventoryMarkers] = useState(false);
  const [farmerDialogOpen, setFarmerDialogOpen] = useState(false);
  const [villagerDialogOpen, setVillagerDialogOpen] = useState(false);
  const sceneReady = transform.ready && calibration.hydrated;

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
            onOpenDialog={() => setVillagerDialogOpen(true)}
            onCloseDialog={() => setVillagerDialogOpen(false)}
            shopContent={<SeedShopPanel />}
          />

          <NpcDialog
            open={farmerDialogOpen}
            name={FARMER_NPC.name}
            message={FARMER_NPC.greeting}
            onClose={() => setFarmerDialogOpen(false)}
          />

          <GameMenuPanel
            position={calibration.gameMenuPosition}
            calibratorActive={debug && calibration.target.kind === "gameMenu"}
          />

          <InventoryPanel menuPosition={calibration.gameMenuPosition} />

          <MenuStatsPanel menuPosition={calibration.gameMenuPosition} />

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
                menuPosition={calibration.gameMenuPosition}
                slots={calibration.inventorySlots}
                target={calibration.target}
                visible={showInventoryMarkers}
                onSelect={calibration.setTarget}
                onMoveSlot={calibration.setInventorySlotPosition}
              />

              {menuOpen ? (
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
                  onClose={() => setMenuOpen(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
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
