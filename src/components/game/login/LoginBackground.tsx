"use client";

import { LOGIN_PARTICLES, LOGIN_VIDEO_SRC } from "@/lib/loginConfig";

// Cinematic video backdrop with grain, vignette, orbs, and floating particles.
export function LoginBackground() {
  return (
    <div className="login-bg" aria-hidden>
      <video
        className="login-bg__video"
        src={LOGIN_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="login-bg__vignette" />
      <div className="login-bg__gradient" />
      <div className="login-bg__grain" />
      <div className="login-bg__scanline" />

      <div className="login-bg__orb login-bg__orb--gold" />
      <div className="login-bg__orb login-bg__orb--green" />
      <div className="login-bg__orb login-bg__orb--sky" />

      {LOGIN_PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="login-bg__particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <div className="login-bg__letterbox login-bg__letterbox--top" />
      <div className="login-bg__letterbox login-bg__letterbox--bottom" />
    </div>
  );
}
