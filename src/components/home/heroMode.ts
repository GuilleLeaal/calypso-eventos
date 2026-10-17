import { useSyncExternalStore } from "react";

export type HeroMode = "day" | "night";

// Turno día: 11 a 17 h. Antes de las 7 y desde las 17 se muestra la casa de noche.
function getModeForCurrentHour(): HeroMode {
  const hour = Number(
    new Intl.DateTimeFormat("es-UY", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "America/Montevideo",
    }).format(new Date()),
  );

  return hour >= 7 && hour < 17 ? "day" : "night";
}

let currentMode: HeroMode = getModeForCurrentHour();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setHeroMode(mode: HeroMode) {
  if (mode === currentMode) return;
  currentMode = mode;
  listeners.forEach((listener) => listener());
}

export function useHeroMode() {
  return useSyncExternalStore(subscribe, () => currentMode);
}
