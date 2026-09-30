import { useSyncExternalStore } from "react";
import { exportJSON, importJSON, subscribeContent } from "./content";
import { exportQuotes, importQuotes, subscribeQuotes } from "./quotes";
import { getPublished, importPublished, subscribePublished } from "./store";
import { getThemeMode, setThemeMode, subscribeTheme } from "./theme";
import { getUsers, importUsers, subscribeUsers } from "./users";

/* ------------------------------------------------------------------ */
/* Synchronisation en ligne du site (JSONBlob)                          */
/* ------------------------------------------------------------------ */
/* Toutes les modifications (contenu, comptes, projets publiés, thème)  */
/* sont poussées vers une adresse en ligne. Le site publié la charge    */
/* automatiquement à l'ouverture → toutes les modifications sont        */
/* visibles par tous, sur tous les appareils.                            */
/* ------------------------------------------------------------------ */

export type CloudPayload = {
  v: 1;
  savedAt: number;
  content: unknown;
  users: unknown;
  published: unknown;
  quotes: unknown;
  theme: "auto" | "day" | "night";
};

export type CloudStatus =
  | { state: "offline" }
  | { state: "saving"; label: string }
  | { state: "saved"; at: number; url: string }
  | { state: "error"; message: string };

const URL_KEY = "doxa.cloud.url";
const APPLIED_KEY = "doxa.cloud.appliedAt";
const AUTOSAVE_KEY = "doxa.cloud.autosave";
const AUTOSAVE_DELAY = 6000;

/* ------------------------------- État ------------------------------ */
let status: CloudStatus = { state: "offline" };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getStatus(): CloudStatus {
  return status;
}
export function subscribeStatus(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function useCloudStatus(): CloudStatus {
  return useSyncExternalStore(subscribeStatus, getStatus);
}

/* ------------------------- Adresse en ligne ------------------------ */
/** URL du blob : d'abord le code injecté dans le site (window.DOXA_SYNC),
    puis l'enregistrée sur cet appareil. */
export function getCloudUrl(): string | null {
  try {
    const injected = (window as unknown as { DOXA_SYNC?: string }).DOXA_SYNC;
    if (injected && /^https:\/\//.test(injected)) return injected;
  } catch {
    /* ignore */
  }
  try {
    return localStorage.getItem(URL_KEY) || null;
  } catch {
    return null;
  }
}

export function setCloudUrl(url: string | null) {
  try {
    if (url) localStorage.setItem(URL_KEY, url);
    else localStorage.removeItem(URL_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function getAutoSave(): boolean {
  try {
    return localStorage.getItem(AUTOSAVE_KEY) !== "0";
  } catch {
    return true;
  }
}
export function setAutoSave(v: boolean) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit();
}

/* --------------------------- Charge utile --------------------------- */
export function buildPayload(): CloudPayload {
  return {
    v: 1,
    savedAt: Date.now(),
    content: JSON.parse(exportJSON()),
    users: getUsers(),
    published: getPublished(),
    quotes: JSON.parse(exportQuotes()),
    theme: getThemeMode(),
  };
}

let applying = false;

/** Applique un payload téléchargé sur les stores locaux. */
export function applyPayload(p: CloudPayload): boolean {
  try {
    applying = true;
    let ok = true;
    if (p.content) ok = importJSON(JSON.stringify(p.content)) && ok;
    if (Array.isArray(p.users)) importUsers(JSON.stringify(p.users));
    if (Array.isArray(p.published)) importPublished(JSON.stringify(p.published));
    if (Array.isArray(p.quotes)) importQuotes(JSON.stringify(p.quotes));
    if (p.theme) setThemeMode(p.theme);
    if (ok) {
      try {
        localStorage.setItem(APPLIED_KEY, String(p.savedAt));
      } catch {
        /* ignore */
      }
    }
    return ok;
  } finally {
    applying = false;
  }
}

/* ------------------------------ POUSSER ----------------------------- */
export async function pushCloud(): Promise<{ ok: boolean; url?: string; error?: string }> {
  const payload = buildPayload();
  const body = JSON.stringify(payload);
  let url = getCloudUrl();
  status = { state: "saving", label: "Envoi des modifications…" };
  emit();
  try {
    if (!url) {
      const res = await fetch("https://jsonblob.com/api/jsonBlob", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
      });
      if (!res.ok) throw new Error("Le serveur a répondu " + res.status);
      url = res.headers.get("Location");
      if (!url) throw new Error("Aucune adresse en ligne retournée.");
      setCloudUrl(url);
    } else {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
      });
      if (!res.ok) throw new Error("Le serveur a répondu " + res.status);
    }
    status = { state: "saved", at: Date.now(), url };
    emit();
    return { ok: true, url };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Connexion au cloud impossible.";
    status = { state: "error", message };
    emit();
    return { ok: false, error: message };
  }
}

/* ------------------------------ TIRER ------------------------------ */
export async function pullCloud(): Promise<{ ok: boolean; error?: string }> {
  const url = getCloudUrl();
  if (!url) return { ok: false, error: "Aucune adresse en ligne liée à cet appareil." };
  status = { state: "saving", label: "Téléchargement de la version en ligne…" };
  emit();
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Le serveur a répondu " + res.status);
    const p = (await res.json()) as CloudPayload;
    const ok = applyPayload(p);
    status = { state: "saved", at: Date.now(), url };
    emit();
    return ok ? { ok: true } : { ok: false, error: "Contenu invalide." };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Téléchargement impossible.";
    status = { state: "error", message };
    emit();
    return { ok: false, error: message };
  }
}

/* -------------------- Synchro à l'ouverture du site ------------------ */
let initDone = false;
export async function initCloudSync(): Promise<void> {
  if (initDone) return;
  initDone = true;
  const url = getCloudUrl();
  if (!url) return;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return;
    const p = (await res.json()) as CloudPayload;
    let applied = 0;
    try {
      applied = Number(localStorage.getItem(APPLIED_KEY) || 0);
    } catch {
      applied = 0;
    }
    if (p && typeof p.savedAt === "number" && p.savedAt > applied) {
      applyPayload(p);
    }
  } catch {
    /* hors ligne : le site reste sur sa version locale */
  }
}

/* ------------------------- Sauvegarde automatique ------------------- */
let timer: number | null = null;

function scheduleAutoSave() {
  if (applying || !getAutoSave() || !getCloudUrl()) return;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    if (status.state === "saving") return;
    void pushCloud();
  }, AUTOSAVE_DELAY);
}

/* Démarrage : on surveille tous les stores du site. */
subscribeContent(scheduleAutoSave);
subscribeUsers(scheduleAutoSave);
subscribePublished(scheduleAutoSave);
subscribeQuotes(scheduleAutoSave);
subscribeTheme(scheduleAutoSave);
