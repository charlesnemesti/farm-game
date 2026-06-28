"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePlayMode } from "@/context/PlayModeProvider";
import { isDocsRoute } from "@/lib/routes";
import { LoginScreen } from "@/components/game/LoginScreen";

// Hides in-game UI until a play mode is chosen (and wallet connected in wallet mode).
export function PlayModeShell({ children }: { children: ReactNode }) {
  const { gateActive, hydrated } = usePlayMode();
  const pathname = usePathname();
  const onDocs = isDocsRoute(pathname);

  if (onDocs || (hydrated && !gateActive)) {
    return <>{children}</>;
  }

  return <LoginScreen />;
}
