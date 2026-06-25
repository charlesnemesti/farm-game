export type WeatherType = "sunny" | "rain" | "snow" | "wind";

/** Weather changes every 3 minutes with a roulette spin animation. */
export const WEATHER_CYCLE_MS = 3 * 60 * 1000;

/** Roulette spin duration at full scale. */
export const WEATHER_SPIN_DURATION_MS = 2000;

/** Wheel scale during spin (300% = 3×). */
export const WEATHER_SPIN_SCALE = 3;

export const WEATHER_SPIN_SCALE_UP_MS = 350;
export const WEATHER_SPIN_SCALE_DOWN_MS = 350;

export const WEATHER_SPIN_TOTAL_MS =
  WEATHER_SPIN_SCALE_UP_MS + WEATHER_SPIN_DURATION_MS + WEATHER_SPIN_SCALE_DOWN_MS;

/** Random roll weights when the wheel stops (must sum to 100). */
export const WEATHER_ROLL_WEIGHTS: Record<WeatherType, number> = {
  sunny: 50,
  rain: 20,
  snow: 20,
  wind: 10,
};

/** Needle rotation (0° = up) toward each quadrant center on the wheel art. */
export const WEATHER_NEEDLE_DEG: Record<WeatherType, number> = {
  rain: 315,
  sunny: 45,
  snow: 135,
  wind: 225,
};

export const WEATHER_WHEEL = {
  src: "/assets/ui/weather-wheel.png?v=4",
  displaySize: 228,
} as const;

export type WeatherSpinSession = {
  id: number;
  from: WeatherType;
  to: WeatherType;
};

export function rollRandomWeather(): WeatherType {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const [type, weight] of Object.entries(WEATHER_ROLL_WEIGHTS) as [
    WeatherType,
    number,
  ][]) {
    cumulative += weight;
    if (roll < cumulative) return type;
  }

  return "sunny";
}

export function getMsUntilNextWeather(nextChangeAt: number, now = Date.now()): number {
  return Math.max(0, nextChangeAt - now);
}

export function formatWeatherCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - Math.pow(1 - clamped, 3);
}

export function computeSpinNeedleDelta(from: WeatherType, to: WeatherType): number {
  const fromDeg = WEATHER_NEEDLE_DEG[from];
  const toDeg = WEATHER_NEEDLE_DEG[to];
  const extraSpins = 4 + Math.floor(Math.random() * 2);
  let delta = toDeg - fromDeg;
  while (delta <= 0) delta += 360;
  return extraSpins * 360 + delta;
}
