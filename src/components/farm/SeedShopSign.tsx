import { designToScreen, type CoverTransform } from "@/hooks/useCoverTransform";
import { SEED_SHOP_SIGN } from "@/lib/npcSprites";

type SeedShopSignProps = {
  transform: CoverTransform;
};

// Wooden seed shop sign — villager stands below this anchor.
export function SeedShopSign({ transform }: SeedShopSignProps) {
  const { x: designX, y: designY } = SEED_SHOP_SIGN.anchor;
  const designHeight =
    SEED_SHOP_SIGN.height *
    (SEED_SHOP_SIGN.displayWidth / SEED_SHOP_SIGN.width);
  const screen = designToScreen(designX, designY, transform);
  const width = SEED_SHOP_SIGN.displayWidth * transform.scale;
  const height = designHeight * transform.scale;

  return (
    <div
      className="pointer-events-none absolute z-[14]"
      style={{
        left: screen.x - width / 2,
        top: screen.y - height,
        width,
        height,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SEED_SHOP_SIGN.src}
        alt=""
        draggable={false}
        className="h-full w-full object-contain pixel-art"
      />
    </div>
  );
}
