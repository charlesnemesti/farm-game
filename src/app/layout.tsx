// NOTE: All code, UI copy, and comments must be written in English,
// even when product requirements are provided in Spanish.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DebugBottomBar } from "@/components/layout/DebugBottomBar";
import { Header } from "@/components/layout/Header";
import { ModeSelectOverlay } from "@/components/game/ModeSelectOverlay";
import { DemoConnectBanner } from "@/components/game/DemoConnectBanner";
import { TutorialOverlay } from "@/components/game/TutorialOverlay";
import { TutorialReplayButton } from "@/components/layout/TutorialReplayButton";
import { DebugUiProvider } from "@/context/DebugUiProvider";
import { DragProvider } from "@/context/DragProvider";
import { GameProvider } from "@/context/GameProvider";
import { InventoryMenuProvider } from "@/context/InventoryMenuProvider";
import { TutorialProvider } from "@/context/TutorialProvider";
import { BackgroundMusicProvider } from "@/context/BackgroundMusicProvider";
import { PlayModeProvider } from "@/context/PlayModeProvider";
import { SolanaWalletProvider } from "@/components/providers/SolanaWalletProvider";
import { WeatherEffectsLayer } from "@/components/farm/WeatherEffectsLayer";
import { WeatherUprootToast } from "@/components/layout/WeatherUprootToast";
import { WeatherProvider } from "@/context/WeatherProvider";
import { CURRENCY_TICKER, GAME_NAME } from "@/lib/brandConfig";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${GAME_NAME} — Web3 Farm Game`,
  description: `${GAME_NAME} — Web3 farm game on Solana. Plant corn, harvest ${CURRENCY_TICKER}, and grow your farm.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <SolanaWalletProvider>
          <PlayModeProvider>
            <BackgroundMusicProvider>
              <WeatherProvider>
                <GameProvider>
                  <DebugUiProvider>
                    <TutorialProvider>
                      <InventoryMenuProvider>
                        <DragProvider>
                          <Header />
                          <WeatherEffectsLayer />
                          <WeatherUprootToast />
                          <DebugBottomBar />
                          {children}
                          <TutorialOverlay />
                          <TutorialReplayButton />
                          <ModeSelectOverlay />
                          <DemoConnectBanner />
                        </DragProvider>
                      </InventoryMenuProvider>
                    </TutorialProvider>
                  </DebugUiProvider>
                </GameProvider>
              </WeatherProvider>
            </BackgroundMusicProvider>
          </PlayModeProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
