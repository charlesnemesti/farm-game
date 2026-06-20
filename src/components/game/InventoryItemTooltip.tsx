"use client";

import type { InventoryEntry } from "@/lib/gameState";
import {
  SEED_PACK_TOOLTIP,
  getInventoryItemImage,
  isSeedPack,
} from "@/lib/itemConfig";
import {
  RARITY_LABELS,
  RARITY_TEXT_CLASS,
  SEED_STATS,
  formatHarvestCycle,
  type SeedRarity,
} from "@/lib/seedConfig";

type InventoryItemTooltipProps = {
  entry: InventoryEntry;
};

export function InventoryItemTooltip({ entry }: InventoryItemTooltipProps) {
  if (isSeedPack(entry.itemId)) {
    return (
      <div className="pointer-events-none absolute bottom-full left-1/2 z-[60] mb-2 w-44 -translate-x-1/2 rounded-lg border border-white/15 bg-black/95 p-2.5 text-left text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
        <p className="text-xs font-bold text-farm-sun">{SEED_PACK_TOOLTIP.title}</p>
        <p className="mt-1 text-[11px] leading-snug text-white/70">
          {SEED_PACK_TOOLTIP.description}
        </p>
      </div>
    );
  }

  if (entry.rarity === undefined) return null;

  const rarity = entry.rarity as SeedRarity;
  const stats = SEED_STATS[rarity];

  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-[60] mb-2 w-48 -translate-x-1/2 rounded-lg border border-white/15 bg-black/95 p-2.5 text-left text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
      <p className={`text-xs font-bold ${RARITY_TEXT_CLASS[rarity]}`}>
        {RARITY_LABELS[rarity]}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-white/65">
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
      </dl>
    </div>
  );
}

type InventoryItemVisualProps = {
  entry: InventoryEntry;
  itemSize: number;
  selected?: boolean;
  onOpenPack?: () => void;
  onSelectSeed?: () => void;
};

export function InventoryItemVisual({
  entry,
  itemSize,
  selected = false,
  onOpenPack,
  onSelectSeed,
}: InventoryItemVisualProps) {
  const imageSrc = getInventoryItemImage(entry);
  if (!imageSrc) return null;

  const iconSize = itemSize * 0.85;
  const isSeed = !isSeedPack(entry.itemId) && entry.rarity !== undefined;

  return (
    <div
      className={`group absolute flex cursor-pointer items-center justify-center rounded-lg ${
        selected ? "ring-2 ring-farm-sun ring-offset-1 ring-offset-transparent" : ""
      }`}
      style={{
        width: itemSize,
        height: itemSize,
      }}
      onClick={() => {
        if (isSeedPack(entry.itemId)) {
          onOpenPack?.();
          return;
        }
        if (isSeed) {
          onSelectSeed?.();
        }
      }}
    >
      <InventoryItemTooltip entry={entry} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={entry.rarity ? RARITY_LABELS[entry.rarity] : entry.itemId}
        draggable={false}
        className="object-contain drop-shadow pixel-art transition-transform duration-150 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      />
      {entry.quantity > 1 ? (
        <span className="absolute right-0 bottom-0 rounded bg-black/75 px-1 text-[10px] font-bold text-white">
          {entry.quantity}
        </span>
      ) : null}
    </div>
  );
}
