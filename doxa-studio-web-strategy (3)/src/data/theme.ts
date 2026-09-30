import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Thème du site : auto (jour/nuit), jour ou nuit                       */
/* ------------------------------------------------------------------ */
export type ThemeMode = "auto" | "day" | "night";
export type Resolved = "dark" | "light";

const KEY = "doxa.theme.v1";
const ROOT = document.documentElement;

/** Débute / fin de la période « nuit ». Nuit = 19h00 → 06h30. */
const NIGHT_START = 19;
const NIGHT_END = 6.5;

function computeAuto(): Resolved {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  return h >= NIGHT_START || h < NIGHT_END ? "dark" : "light";
}

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "day" || v === "night" || v === "auto" ? v : "auto";
  } catch {
    return "auto";
  }
}

let mode: ThemeMode = read();
let resolved: Resolved = mode === "auto" ? computeAuto() : mode === "day" ? "light" : "dark";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function apply() {
  ROOT.setAttribute("data-theme", resolved);
  ROOT.style.colorScheme = resolved === "dark" ? "dark" : "light";
}

function resolve(m: ThemeMode): Resolved {
  if (m === "day") return "light";
  if (m === "night") return "dark";
  return computeAuto();
}

/** Change le mode et l'applique au document. */
export function setThemeMode(m: ThemeMode) {
  mode = m;
  const next = resolve(m);
  const changed = next !== resolved;
  resolved = next;
  try {
    localStorage.setItem(KEY, m);
  } catch {
    /* stockage indisponible */
  }
  apply();
  if (changed) emit();
  else emit();
}

/* Vérifie chaque minute si le basculement automatique doit s'appliquer. */
setInterval(() => {
  if (mode !== "auto") return;
  const next = computeAuto();
  if (next !== resolved) {
    resolved = next;
    apply();
    emit();
  }
}, 60_000);

/* Application immédiate au chargement du module. */
apply();

export function getThemeMode(): ThemeMode {
  return mode;
}

export function getResolvedTheme(): Resolved {
  return resolved;
}

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/* ------------------------------- Hooks ----------------------------- */
export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribeTheme, getThemeMode);
}

export function useResolvedTheme(): Resolved {
  return useSyncExternalStore(subscribeTheme, getResolvedTheme);
}

export const THEME_LABELS: Record<ThemeMode, { title: string; hint: string }> = {
  auto: { title: "Automatique", hint: "Jour / nuit selon l'heure" },
  day: { title: "Mode jour", hint: "Thème blanc forcé" },
  night: { title: "Mode nuit", hint: "Thème noir forcé" },
};
