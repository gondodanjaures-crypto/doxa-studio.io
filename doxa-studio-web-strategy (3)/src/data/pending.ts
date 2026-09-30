import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Médias « en attente d'enregistrement »                                */
/* ------------------------------------------------------------------ */
/* Un fichier téléversé dans l'admin n'est PAS appliqué au site : il est */
/* d'abord mis en attente (aperçu local). Le clic sur « Enregistrer »    */
/* applique alors tout l'attendu au site avec une barre de progression.  */
/* ------------------------------------------------------------------ */

export type PendingMedia = {
  id: number;
  key: string;
  label: string;
  value: string;
  apply: () => void;
};

let items: PendingMedia[] = [];
let tick = 0;
let uid = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Met un média en attente (remplace l'attendu de même clé). */
export function stageMedia(
  key: string,
  label: string,
  value: string,
  apply: () => void,
) {
  items = items.filter((i) => i.key !== key);
  items = [...items, { id: uid++, key, label, value, apply }];
  emit();
}

/** Retire un seul élément de l'attente. */
export function unstageMedia(key: string) {
  items = items.filter((i) => i.key !== key);
  emit();
}

/** Tout annuler. */
export function discardPending() {
  if (!items.length) return;
  items = [];
  tick++;
  emit();
}

/** Récupère (et vide) la file d'attente. */
export function commitPending(): PendingMedia[] {
  const out = items;
  items = [];
  tick++;
  emit();
  return out;
}

export function getPending(): PendingMedia[] {
  return items;
}
export function getTick(): number {
  return tick;
}
export function subscribePending(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function usePending(): PendingMedia[] {
  return useSyncExternalStore(subscribePending, getPending);
}

/** Change à chaque enregistrement / annulation : les champs
    réinitialisent alors leur aperçu local « en attente ». */
export function usePendingTick(): number {
  return useSyncExternalStore(subscribePending, getTick);
}
