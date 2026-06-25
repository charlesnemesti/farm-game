"use client";

import dynamic from "next/dynamic";
import { CornCounter } from "@/components/layout/CornCounter";
import { HudPanel } from "@/components/layout/HudPanel";
import { MusicControl } from "@/components/layout/MusicControl";
import { TreasuryControls } from "@/components/layout/TreasuryControls";
import { HEADER_LOGO } from "@/lib/uiConfig";
import { HUD_PANEL } from "@/lib/hudConfig";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className="pointer-events-none absolute left-1/2 z-[51] -translate-x-1/2"
        style={{ top: HEADER_LOGO.screenOffsetY }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HEADER_LOGO.src}
          alt="Corn Farm"
          draggable={false}
          className="h-auto max-w-[calc(100vw-1.5rem)] object-contain pixel-art mix-blend-screen"
          style={{ width: HEADER_LOGO.displayWidth }}
        />
      </div>

      <div
        className="pointer-events-auto absolute top-2 left-2 flex flex-col items-start gap-1 sm:top-3 sm:left-3"
        style={{ width: 340 }}
      >
        <HudPanel width={340}>
          <WalletMultiButton className="hud-wallet-button" />
          <TreasuryControls />
        </HudPanel>
        <HudPanel
          width={340}
          displayHeight={HUD_PANEL.musicControlHeight}
          compact
        >
          <MusicControl />
        </HudPanel>
      </div>

      <div className="pointer-events-auto absolute top-2 right-2 sm:top-3 sm:right-3">
        <HudPanel width={230}>
          <CornCounter />
        </HudPanel>
      </div>
    </header>
  );
}
