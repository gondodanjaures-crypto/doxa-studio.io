import type { Project } from "./site";

/* ------------------------------------------------------------------ */
/* Session équipe (simulée côté client)                                 */
/* ------------------------------------------------------------------ */
export type SessionUser = { email: string; name: string; at: number };

const SESSION_KEY = "doxa.session.v1";

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(s: SessionUser) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* stockage indisponible */
  }
}

/* ------------------------------------------------------------------ */
/* Projets publiés par l'équipe — synchronisés avec le site public      */
/* ------------------------------------------------------------------ */
export type PublishedProject = Project & { publishedAt: number };

const PUB_KEY = "doxa.published.v1";

function read(): PublishedProject[] {
  try {
    const raw = localStorage.getItem(PUB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PublishedProject[]) : [];
  } catch {
    return [];
  }
}

let cache = read();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(PUB_KEY, JSON.stringify(cache));
  } catch {
    /* quota dépassé : on garde la mémoire vivante */
  }
  listeners.forEach((l) => l());
}

export function getPublished(): PublishedProject[] {
  return cache;
}

export function addProject(
  data: Omit<PublishedProject, "id" | "publishedAt">,
): PublishedProject {
  const now = Date.now();
  const item: PublishedProject = { ...data, id: now, publishedAt: now };
  cache = [item, ...cache];
  persist();
  return item;
}

export function removeProject(id: number) {
  cache = cache.filter((p) => p.id !== id);
  persist();
}

/* --------------------------- Export / import ------------------------ */
export function exportPublished(): string {
  return JSON.stringify(cache);
}

export function importPublished(json: string): boolean {
  try {
    const p = JSON.parse(json);
    if (!Array.isArray(p)) return false;
    cache = p as PublishedProject[];
    persist();
    return true;
  } catch {
    return false;
  }
}

/** Abonnement réactif (utilisé par useSyncExternalStore). */
export function subscribePublished(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
