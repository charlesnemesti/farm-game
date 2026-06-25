import type { WeatherType } from "./weatherConfig";

/** Overall opacity for the full-screen weather particle canvas. */
export const WEATHER_EFFECTS_LAYER_OPACITY = 0.1;

export type WeatherSpriteConfig = {
  src: string;
  width: number;
  height: number;
  tileScale: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

export const WEATHER_SPRITES: Record<Exclude<WeatherType, "sunny">, WeatherSpriteConfig> = {
  rain: {
    src: "/assets/ambient/rain-01.png",
    width: 136,
    height: 80,
    tileScale: 2,
    speedX: 0.45,
    speedY: 0.26,
    opacity: 0.5,
  },
  snow: {
    src: "/assets/ambient/snow-01.png",
    width: 64,
    height: 64,
    tileScale: 3,
    speedX: 0.12,
    speedY: 0.35,
    opacity: 0.55,
  },
  wind: {
    src: "/assets/ambient/wind-01.png",
    width: 272,
    height: 160,
    tileScale: 2,
    speedX: 0.7,
    speedY: 0.08,
    opacity: 0.48,
  },
};
