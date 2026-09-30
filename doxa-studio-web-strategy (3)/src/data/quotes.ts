import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Demandes de devis / factures pro forma (stockage local du dashboard) */
/* ------------------------------------------------------------------ */
/* Le client soumet son intention → la demande apparaît dans le          */
/* dashboard Admin (super admin) → vous fixez les prix → vous validez   */
/* et téléchargez/envoyez la facture pro forma définitive.               */
/* ------------------------------------------------------------------ */

export type QuotePrice = { label: string; description: string; amount: number };

export type Quote = {
  id: string;
  number: string;
  createdAt: number;
  name: string;
  email: string;
  company: string;
  needs: string[];
  intention: string;
  status: "pending" | "sent";
  prices: QuotePrice[];
  total: number;
  validUntil: string;
  sentAt?: number;
};

const KEY = "doxa.quotes.v1";
const COUNTER = "doxa.quotes.counter";

function nextNumber(): string {
  const year = new Date().getFullYear();
  let n = 1;
  try {
    n = Number(localStorage.getItem(COUNTER) ?? "0") + 1;
    localStorage.setItem(COUNTER, String(n));
  } catch {
    /* stockage indisponible */
  }
  return `PF-${year}-${String(n).padStart(4, "0")}`;
}

function load(): Quote[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Quote[]) : [];
  } catch {
    return [];
  }
}

let cache: Quote[] = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* quota local dépassé : l'état reste en mémoire */
  }
  listeners.forEach((l) => l());
}

export function getQuotes(): Quote[] {
  return cache;
}

export function addQuote(
  data: Pick<Quote, "name" | "email" | "company" | "needs" | "intention">,
): Quote {
  const now = Date.now();
  const quote: Quote = {
    id: "q" + now.toString(36) + Math.random().toString(36).slice(2, 7),
    number: nextNumber(),
    createdAt: now,
    status: "pending",
    prices: [],
    total: 0,
    validUntil: "",
    ...data,
  };
  cache = [quote, ...cache];
  persist();
  return quote;
}

export function updateQuote(id: string, patch: Partial<Quote>) {
  cache = cache.map((q) => (q.id === id ? { ...q, ...patch } : q));
  persist();
}

export function removeQuote(id: string) {
  cache = cache.filter((q) => q.id !== id);
  persist();
}

export function exportQuotes(): string {
  return JSON.stringify(cache);
}

export function importQuotes(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return false;
    cache = parsed as Quote[];
    persist();
    return true;
  } catch {
    return false;
  }
}

export function subscribeQuotes(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useQuotes(): Quote[] {
  return useSyncExternalStore(subscribeQuotes, getQuotes);
}

export const fcfa = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) +
  " FCFA";

export const dateFR = (value: number | string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
