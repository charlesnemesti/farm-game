import { STORAGE_PREFIX } from "./brandConfig";

export const WEATHER_INFO_DISMISSED_KEY = `${STORAGE_PREFIX}-weather-info-dismissed-v1`;

export function isWeatherInfoDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(WEATHER_INFO_DISMISSED_KEY) === "1";
}

export function dismissWeatherInfo(): void {
  window.localStorage.setItem(WEATHER_INFO_DISMISSED_KEY, "1");
}
