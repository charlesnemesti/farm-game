import type { PlantedCrop } from "@/lib/cropState";
import {
  formatRemainingTime,
  getCycleProgress,
} from "@/lib/cropState";

type CropTimerProps = {
  crop: PlantedCrop;
  now: number;
  scale: number;
};

export function CropTimer({ crop, now, scale }: CropTimerProps) {
  const { remainingMs, progress } = getCycleProgress(crop, now);
  const barWidth = Math.max(36, 48 * scale);

  return (
    <div
      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
      style={{ bottom: `${32 * scale + 6}px` }}
    >
      <div
        className="overflow-hidden rounded-full border border-black/50 bg-black/70"
        style={{ width: barWidth, height: Math.max(10, 10 * scale) }}
      >
        <div
          className="h-full rounded-full bg-farm-sun transition-[width] duration-200"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
      <p
        className="mt-0.5 text-center font-bold text-white drop-shadow"
        style={{ fontSize: Math.max(8, 9 * scale) }}
      >
        {formatRemainingTime(remainingMs)}
      </p>
    </div>
  );
}
