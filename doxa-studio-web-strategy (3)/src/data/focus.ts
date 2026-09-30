import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Focalisation d'un projet depuis une autre section (Expertises)       */
/* ------------------------------------------------------------------ */
export type ProjectFocus = { id: number; ts: number } | null;

let focus: ProjectFocus = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function focusProject(id: number) {
  focus = { id, ts: Date.now() };
  emit();
}

export function clearFocus() {
  focus = null;
  emit();
}

export function getFocus(): ProjectFocus {
  return focus;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useFocus(): ProjectFocus {
  return useSyncExternalStore(subscribe, getFocus);
}
