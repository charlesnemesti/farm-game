"use client";

import { useBackgroundMusic } from "@/context/BackgroundMusicProvider";

export function MusicControl() {
  const { hydrated, muted, volume, setVolume, toggleMute } = useBackgroundMusic();

  if (!hydrated) return null;

  const volumePercent = Math.round(volume * 100);

  return (
    <div className="flex w-full items-center gap-1">
      <button
        type="button"
        onClick={toggleMute}
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-[9px] leading-none text-[#4a3428] transition hover:bg-[#4a3428]/10"
        aria-label={muted ? "Unmute music" : "Mute music"}
        title={muted ? "Unmute music" : "Mute music"}
      >
        {muted || volumePercent === 0 ? "🔇" : "🔊"}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={muted ? 0 : volumePercent}
        onChange={(event) => setVolume(Number(event.target.value) / 100)}
        className="music-volume-slider h-1 min-w-0 flex-1 cursor-pointer accent-[#8b6914]"
        aria-label="Music volume"
        title={`Music volume: ${volumePercent}%`}
      />
    </div>
  );
}
