"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CornCounter } from "@/components/layout/CornCounter";
import { HudPanel } from "@/components/layout/HudPanel";
import { MusicControl } from "@/components/layout/MusicControl";
import { TreasuryControls } from "@/components/layout/TreasuryControls";
import { WalletConnectButton } from "@/components/layout/WalletConnectButton";
import { WeatherHelpSection } from "@/components/layout/WeatherHelpSection";
import { GAME_NAME } from "@/lib/brandConfig";
import { isDocsRoute } from "@/lib/routes";
import { HEADER_LOGO } from "@/lib/uiConfig";

const WALLET_PANEL_WIDTH = 620;

export function Header() {
  const pathname = usePathname();
  const onDocs = isDocsRoute(pathname);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {!onDocs ? (
        <div
          className="pointer-events-none absolute left-1/2 z-[51] -translate-x-1/2"
          style={{ top: HEADER_LOGO.screenOffsetY }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HEADER_LOGO.src}
            alt={GAME_NAME}
            draggable={false}
            className="h-auto max-w-[calc(100vw-1.5rem)] object-contain pixel-art mix-blend-screen"
            style={{ width: HEADER_LOGO.displayWidth }}
          />
        </div>
      ) : null}

      <div
        className="pointer-events-auto absolute top-2 left-2 flex max-w-[calc(100vw-17rem)] flex-col items-start gap-1 sm:top-3 sm:left-3"
      >
        <HudPanel width={WALLET_PANEL_WIDTH} className="max-w-full">
          <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden">
            <WalletConnectButton />
            <div className="flex shrink-0 items-center gap-2">
              <TreasuryControls />
              <MusicControl />
              <Link href="/docs" className="hud-action-button shrink-0">
                <span className="hud-action-button__icon" aria-hidden>
                  ◎
                </span>
                Docs
              </Link>
            </div>
          </div>
        </HudPanel>
      </div>

      <div className="pointer-events-auto absolute top-2 right-2 flex flex-col items-center gap-1.5 sm:top-3 sm:right-3">
        <HudPanel width={230}>
          <CornCounter />
        </HudPanel>
        {!onDocs ? <WeatherHelpSection /> : null}
      </div>
    </header>
  );
}
