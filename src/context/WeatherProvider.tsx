"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getMsUntilNextWeather,
  rollRandomWeather,
  WEATHER_CYCLE_MS,
  WEATHER_SPIN_TOTAL_MS,
  type WeatherSpinSession,
  type WeatherType,
} from "@/lib/weatherConfig";
import {
  resolveWeatherState,
  writePersistedWeather,
  type PersistedWeatherState,
} from "@/lib/weatherState";

type WeatherContextValue = {
  weather: WeatherType;
  msUntilChange: number;
  isSpinning: boolean;
  spinSession: WeatherSpinSession | null;
  weatherEpoch: number;
  hydrated: boolean;
  /** Debug: start the weather roulette spin immediately. */
  triggerWeatherSpin: () => boolean;
};

function startSpinSession(
  from: WeatherType,
  weatherEpoch: number,
  spinSessionRef: { current: WeatherSpinSession | null },
  setSpinSession: (session: WeatherSpinSession | null) => void,
): boolean {
  if (spinSessionRef.current) return false;

  const session: WeatherSpinSession = {
    id: weatherEpoch + 1,
    from,
    to: rollRandomWeather(),
  };
  spinSessionRef.current = session;
  setSpinSession(session);
  return true;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

function createPlaceholderState(): PersistedWeatherState {
  return {
    weather: "sunny",
    nextChangeAt: Number.MAX_SAFE_INTEGER,
    weatherEpoch: 0,
  };
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedWeatherState>(
    createPlaceholderState,
  );
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [spinSession, setSpinSession] = useState<WeatherSpinSession | null>(null);
  const spinSessionRef = useRef<WeatherSpinSession | null>(null);
  const weatherRef = useRef<WeatherType>(persisted.weather);
  const weatherEpochRef = useRef(persisted.weatherEpoch);

  const weather = persisted.weather;
  const nextChangeAt = persisted.nextChangeAt;
  const weatherEpoch = persisted.weatherEpoch;

  spinSessionRef.current = spinSession;
  weatherRef.current = weather;
  weatherEpochRef.current = weatherEpoch;

  useEffect(() => {
    const resolved = resolveWeatherState(Date.now());
    setPersisted(resolved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writePersistedWeather(persisted);
  }, [hydrated, persisted]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNow(Date.now());
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const finishSpin = useCallback(() => {
    const session = spinSessionRef.current;
    if (!session) return;

    spinSessionRef.current = null;
    setSpinSession(null);
    setPersisted((prev) => ({
      weather: session.to,
      weatherEpoch: prev.weatherEpoch + 1,
      nextChangeAt: Date.now() + WEATHER_CYCLE_MS,
    }));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!spinSession) return;

    const timeoutId = window.setTimeout(finishSpin, WEATHER_SPIN_TOTAL_MS);
    return () => window.clearTimeout(timeoutId);
  }, [finishSpin, hydrated, spinSession]);

  useEffect(() => {
    if (!hydrated) return;
    if (spinSessionRef.current) return;
    if (now < nextChangeAt) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }

    startSpinSession(weather, weatherEpoch, spinSessionRef, setSpinSession);
  }, [hydrated, now, nextChangeAt, weather, weatherEpoch]);

  const triggerWeatherSpin = useCallback((): boolean => {
    if (!hydrated) return false;
    return startSpinSession(
      weatherRef.current,
      weatherEpochRef.current,
      spinSessionRef,
      setSpinSession,
    );
  }, [hydrated]);

  const value = useMemo<WeatherContextValue>(
    () => ({
      weather,
      msUntilChange: spinSession ? 0 : getMsUntilNextWeather(nextChangeAt, now),
      isSpinning: spinSession !== null,
      spinSession,
      weatherEpoch,
      hydrated,
      triggerWeatherSpin,
    }),
    [hydrated, nextChangeAt, now, spinSession, triggerWeatherSpin, weather, weatherEpoch],
  );

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeather(): WeatherContextValue {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within WeatherProvider");
  }
  return context;
}
