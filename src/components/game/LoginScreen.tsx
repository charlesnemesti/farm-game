"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlayMode } from "@/context/PlayModeProvider";
import { useWalletConnectAction } from "@/hooks/useWalletConnectAction";
import { GAME_NAME } from "@/lib/brandConfig";
import {
  LOGIN_COPY,
  LOGIN_FEATURES,
  LOGIN_TAGLINE,
} from "@/lib/loginConfig";
import { HEADER_LOGO } from "@/lib/uiConfig";
import { LoginBackground } from "@/components/game/login/LoginBackground";
import { LoginModePanel } from "@/components/game/login/LoginModePanel";
import { LoginSocialLinks } from "@/components/game/login/LoginSocialLinks";

// Cinematic full-screen login gate — AAA launcher experience.
export function LoginScreen() {
  const { gateActive, hydrated, playMode, selectPlayMode, switchPlayMode } =
    usePlayMode();
  const { connectWallet, connecting } = useWalletConnectAction();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!hydrated || !gateActive) {
      setRevealed(false);
      return;
    }

    const timer = window.setTimeout(() => setRevealed(true), 80);
    return () => window.clearTimeout(timer);
  }, [gateActive, hydrated, playMode]);

  if (hydrated && !gateActive) return null;

  const awaitingWallet = playMode === "wallet";

  return (
    <div className={`login-screen ${revealed ? "login-screen--revealed" : ""}`}>
      <LoginBackground />

      <header className="login-topbar login-stagger" style={{ animationDelay: "0.05s" }}>
        <div className="login-topbar__badges">
          {LOGIN_FEATURES.map((feature) => (
            <span key={feature.label} className="login-badge">
              <span aria-hidden>{feature.icon}</span>
              {feature.label}
            </span>
          ))}
        </div>

        <LoginSocialLinks variant="header" />
      </header>

      <div className="login-screen__content">
        <main className="login-main">
          <section className="login-hero login-stagger" style={{ animationDelay: "0.15s" }}>
            <div className="login-hero__logo-wrap">
              <span className="login-hero__logo-glow" aria-hidden />
              <span className="login-hero__logo-ring" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HEADER_LOGO.src}
                alt={GAME_NAME}
                draggable={false}
                className="login-hero__logo pixel-art"
                style={{ width: HEADER_LOGO.displayWidth }}
              />
            </div>

            <p className="login-hero__tagline">{LOGIN_TAGLINE}</p>
            <p className="login-hero__subtitle">{LOGIN_COPY.heroSubtitle}</p>
          </section>

          <div className="login-stagger" style={{ animationDelay: "0.28s" }}>
            <LoginModePanel
              awaitingWallet={awaitingWallet}
              connecting={connecting}
              onSelectDemo={() => selectPlayMode("demo")}
              onSelectWallet={() => selectPlayMode("wallet")}
              onConnectWallet={connectWallet}
              onBack={switchPlayMode}
            />
          </div>
        </main>

        <footer className="login-footer login-stagger" style={{ animationDelay: "0.4s" }}>
          <LoginSocialLinks variant="footer" />

          <nav className="login-footer__nav" aria-label="Site links">
            <Link href="/docs" className="login-footer__link">
              {LOGIN_COPY.docsLabel}
            </Link>
            <span className="login-footer__dot" aria-hidden>
              ·
            </span>
            <Link href="/docs" className="login-footer__link">
              {LOGIN_COPY.tokenomicsLabel}
            </Link>
          </nav>

          <p className="login-footer__copy">{LOGIN_COPY.copyright}</p>
        </footer>
      </div>
    </div>
  );
}
