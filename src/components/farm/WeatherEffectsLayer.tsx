"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useWeather } from "@/context/WeatherProvider";
import type { WeatherType } from "@/lib/weatherConfig";
import { isDocsRoute } from "@/lib/routes";
import {
  WEATHER_EFFECTS_LAYER_OPACITY,
  WEATHER_SPRITES,
  type WeatherSpriteConfig,
} from "@/lib/weatherSprites";

type ParticleLayer = {
  offsetX: number;
  offsetY: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

function wrapOffset(value: number, size: number): number {
  return ((value % size) + size) % size;
}

function buildLayers(config: WeatherSpriteConfig): ParticleLayer[] {
  return [
    {
      offsetX: 0,
      offsetY: 0,
      speedX: config.speedX,
      speedY: config.speedY,
      opacity: config.opacity,
    },
    {
      offsetX: config.width * 0.5,
      offsetY: config.height * 0.35,
      speedX: config.speedX * 1.35,
      speedY: config.speedY * 1.2,
      opacity: Math.min(config.opacity + 0.12, 0.85),
    },
  ];
}

function drawTiledLayer(
  ctx: CanvasRenderingContext2D,
  sprite: CanvasImageSource,
  layer: ParticleLayer,
  config: WeatherSpriteConfig,
  width: number,
  height: number,
) {
  const tileW = config.width * config.tileScale;
  const tileH = config.height * config.tileScale;
  const startX = -tileW + wrapOffset(layer.offsetX, tileW);
  const startY = -tileH + wrapOffset(layer.offsetY, tileH);

  ctx.globalAlpha = layer.opacity * WEATHER_EFFECTS_LAYER_OPACITY;

  for (let y = startY; y < height + tileH; y += tileH) {
    for (let x = startX; x < width + tileW; x += tileW) {
      ctx.drawImage(sprite, x, y, tileW, tileH);
    }
  }
}

// Full-screen weather particles (rain, snow, wind). Sunny renders nothing.
export function WeatherEffectsLayer() {
  const pathname = usePathname();
  const onDocs = isDocsRoute(pathname);
  const { weather } = useWeather();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const weatherRef = useRef<WeatherType>(weather);

  weatherRef.current = weather;

  useEffect(() => {
    if (onDocs) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const spriteCache = new Map<Exclude<WeatherType, "sunny">, HTMLImageElement>();
    const layerCache = new Map<Exclude<WeatherType, "sunny">, ParticleLayer[]>();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId = 0;
    let reduceMotion = motionQuery.matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ensureSprite = (type: Exclude<WeatherType, "sunny">) => {
      let image = spriteCache.get(type);
      if (image) return image;

      image = new Image();
      image.decoding = "async";
      image.src = WEATHER_SPRITES[type].src;
      spriteCache.set(type, image);
      return image;
    };

    const tick = () => {
      animationId = requestAnimationFrame(tick);

      const activeWeather = weatherRef.current;
      if (activeWeather === "sunny") {
        if (canvas.width > 0) {
          ctx.clearRect(0, 0, width, height);
        }
        return;
      }

      const config = WEATHER_SPRITES[activeWeather];
      const sprite = ensureSprite(activeWeather);
      if (!sprite.complete || sprite.naturalWidth === 0) return;

      let layers = layerCache.get(activeWeather);
      if (!layers) {
        layers = buildLayers(config);
        layerCache.set(activeWeather, layers);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const layer of layers) {
        drawTiledLayer(ctx, sprite, layer, config, width, height);

        if (!reduceMotion) {
          layer.offsetX += layer.speedX;
          layer.offsetY += layer.speedY;
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const onMotionChange = () => {
      reduceMotion = motionQuery.matches;
    };

    resize();
    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", onMotionChange);
    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [onDocs]);

  if (onDocs) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="weather-layer pointer-events-none fixed inset-0 z-[30] pixel-art"
      aria-hidden
    />
  );
}
