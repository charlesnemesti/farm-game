// NOTE: All code, UI copy, and comments must be written in English,
// even when product requirements are provided in Spanish.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DebugBottomBar } from "@/components/layout/DebugBottomBar";
import { Header } from "@/components/layout/Header";
import { ModeSelectOverlay } from "@/components/game/ModeSelectOverlay";
import { TutorialOverlay } from "@/components/game/TutorialOverlay";
import { DebugUiProvider } from "@/context/DebugUiProvider";
import { DragProvider } from "@/context/DragProvider";
import { GameProvider } from "@/context/GameProvider";
import { InventoryMenuProvider } from "@/context/InventoryMenuProvider";
import { TutorialProvider } from "@/context/TutorialProvider";
import { BackgroundMusicProvider } from "@/context/BackgroundMusicProvider";
import { PlayModeProvider } from "@/context/PlayModeProvider";
import { SolanaWalletProvider } from "@/components/providers/SolanaWalletProvider";
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
  title: "SolFarm — Web3 Farm Game",
  description: "Web2.5 farm game on Solana",
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
              <GameProvider>
                <DebugUiProvider>
                  <TutorialProvider>
                    <InventoryMenuProvider>
                      <DragProvider>
                        <Header />
                        <DebugBottomBar />
                        {children}
                        <TutorialOverlay />
                        <ModeSelectOverlay />
                      </DragProvider>
                    </InventoryMenuProvider>
                  </TutorialProvider>
                </DebugUiProvider>
              </GameProvider>
            </BackgroundMusicProvider>
          </PlayModeProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
