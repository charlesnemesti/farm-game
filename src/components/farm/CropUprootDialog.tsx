"use client";

import { formatCornPerHour } from "@/lib/cropState";
import { getSeedImage } from "@/lib/itemConfig";
import {
  RARITY_GLOW_CLASS,
  RARITY_LABELS,
  RARITY_TEXT_CLASS,
  SEED_STATS,
  formatHarvestCycle,
  type SeedRarity,
} from "@/lib/seedConfig";

type CropUprootDialogProps = {
  open: boolean;
  rarity: SeedRarity;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CropUprootDialog({
  open,
  rarity,
  onConfirm,
  onCancel,
}: CropUprootDialogProps) {
  if (!open) return null;

  const stats = SEED_STATS[rarity];
  const seedImage = getSeedImage(rarity);
  const cornPerHour =
    (stats.cornPerCycle / stats.harvestCycleSeconds) * 3600;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-sm rounded-xl border border-white/15 bg-black/95 p-4 text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-uproot-dialog-title"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/5 ${RARITY_GLOW_CLASS[rarity]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={seedImage}
              alt={RARITY_LABELS[rarity]}
              draggable={false}
              className="pixel-art h-10 w-10 object-contain drop-shadow"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="crop-uproot-dialog-title"
              className={`text-sm font-bold ${RARITY_TEXT_CLASS[rarity]}`}
            >
              {RARITY_LABELS[rarity]}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              {stats.description}
            </p>
            <dl className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-white/50">Harvest cycle</dt>
                <dd className="font-semibold text-white/90">
                  {formatHarvestCycle(stats.harvestCycleSeconds)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/50">$CORN / cycle</dt>
                <dd className="font-semibold text-farm-sun">
                  {stats.cornPerCycle.toLocaleString("en-US")}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/50">Yield / hour</dt>
                <dd className="font-semibold text-farm-sun">
                  {formatCornPerHour(cornPerHour)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-white/55">
          Remove this plant? The furrow will be empty and you keep no rewards from
          the current cycle.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-red-500/40 bg-red-950/80 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-900"
          >
            Uproot
          </button>
        </div>
      </div>
    </div>
  );
}
