// NOTE: All code must stay in English, even when requirements arrive in Spanish.

import {
  rollRandomWeather,
  WEATHER_CYCLE_MS,
  type WeatherType,
} from "./weatherConfig";

export const WEATHER_STATE_STORAGE_KEY = "solfarm-weather-state-v1";

export type PersistedWeatherState = {
  weather: WeatherType;
  nextChangeAt: number;
  weatherEpoch: number;
};

function isWeatherType(value: unknown): value is WeatherType {
  return value === "sunny" || value === "rain" || value === "snow" || value === "wind";
}

export function readPersistedWeather(): PersistedWeatherState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(WEATHER_STATE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedWeatherState>;
    if (
      !isWeatherType(parsed.weather) ||
      typeof parsed.nextChangeAt !== "number" ||
      typeof parsed.weatherEpoch !== "number"
    ) {
      return null;
    }

    return {
      weather: parsed.weather,
      nextChangeAt: parsed.nextChangeAt,
      weatherEpoch: parsed.weatherEpoch,
    };
  } catch {
    return null;
  }
}

export function writePersistedWeather(state: PersistedWeatherState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEATHER_STATE_STORAGE_KEY, JSON.stringify(state));
}

/** Load saved weather or create a new roll; catch up cycles missed while away. */
export function resolveWeatherState(now = Date.now()): PersistedWeatherState {
  const saved = readPersistedWeather();

  if (!saved) {
    const created: PersistedWeatherState = {
      weather: rollRandomWeather(),
      nextChangeAt: now + WEATHER_CYCLE_MS,
      weatherEpoch: 0,
    };
    writePersistedWeather(created);
    return created;
  }

  let { weather, nextChangeAt, weatherEpoch } = saved;
  let changed = false;

  while (now >= nextChangeAt) {
    weather = rollRandomWeather();
    weatherEpoch += 1;
    nextChangeAt += WEATHER_CYCLE_MS;
    changed = true;
  }

  const resolved = { weather, nextChangeAt, weatherEpoch };
  if (changed) {
    writePersistedWeather(resolved);
  }

  return resolved;
}
