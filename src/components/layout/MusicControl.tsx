"use client";

import { useBackgroundMusic } from "@/context/BackgroundMusicProvider";

export function MusicControl() {
  const { hydrated, muted, volume, setVolume, toggleMute } = useBackgroundMusic();

  if (!hydrated) return null;

  const volumePercent = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-2 py-1">
      <button
        type="button"
        onClick={toggleMute}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm transition hover:bg-white/10"
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
        className="music-volume-slider h-1.5 w-16 cursor-pointer accent-farm-sun sm:w-20"
        aria-label="Music volume"
        title={`Music volume: ${volumePercent}%`}
      />
    </div>
  );
}
