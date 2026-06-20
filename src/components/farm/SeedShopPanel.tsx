"use client";

import { useState } from "react";
import { useGame } from "@/context/GameProvider";
import { SEED_PACK_ITEM } from "@/lib/shopConfig";

export function SeedShopPanel() {
  const { corn, buyItem } = useGame();
  const [message, setMessage] = useState<string | null>(null);
  const item = SEED_PACK_ITEM;
  const canAfford = corn >= item.priceCorn;

  const handleBuy = () => {
    const result = buyItem(item);
    switch (result) {
      case "success":
        setMessage("Seeds Pack added to inventory.");
        break;
      case "insufficient-corn":
        setMessage("Not enough $CORN.");
        break;
      case "inventory-full":
        setMessage("Inventory is full.");
        break;
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-white/60">
        Welcome! Pick up supplies for your farm.
      </p>

      <article className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageSrc}
            alt={item.name}
            className="h-16 w-12 shrink-0 object-contain drop-shadow-md"
            draggable={false}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white">{item.name}</h4>
            <p className="mt-0.5 text-xs font-semibold text-farm-sun">
              {item.priceCorn.toLocaleString("en-US")} $CORN
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBuy}
          disabled={!canAfford}
          className="mt-3 w-full rounded-lg bg-farm-sun py-2 text-xs font-bold text-farm-wood transition hover:bg-farm-sun-dark disabled:cursor-not-allowed disabled:opacity-45"
        >
          Buy
        </button>
      </article>

      {message ? (
        <p className="text-[11px] text-white/70" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
