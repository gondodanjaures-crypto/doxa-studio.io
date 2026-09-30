/* ------------------------------------------------------------------ */
/* API publique du processus de devis / pro forma                      */
/* ------------------------------------------------------------------ */

export type ProformaConfig = { supabaseUrl: string; anonKey: string };

export type QuoteRequest = {
  id: string;
  quoteNumber: string;
  name: string;
  email: string;
  company: string;
  needs: string[];
  intention: string;
  createdAt: string;
  expiresAt: string;
};

export type QuoteLine = { label: string; description: string; amount: number };

const CONFIG_KEY = "doxa.proforma.config.v1";

declare global {
  interface Window {
    DOXA_PROFORMA?: ProformaConfig;
  }
}

export function getProformaConfig(): ProformaConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const value = JSON.parse(raw) as ProformaConfig;
      if (value.supabaseUrl && value.anonKey) return value;
    }
  } catch {
    /* continue to the published config */
  }
  const injected = window.DOXA_PROFORMA;
  return injected?.supabaseUrl && injected.anonKey ? injected : null;
}

export function saveProformaConfig(config: ProformaConfig | null) {
  try {
    if (config) localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    else localStorage.removeItem(CONFIG_KEY);
  } catch {
    /* stockage local indisponible */
  }
}

export async function callProforma<T>(body: Record<string, unknown>): Promise<T> {
  const config = getProformaConfig();
  if (!config) {
    throw new Error("Le service de devis n'est pas encore configuré. Contactez-nous par email.");
  }
  const root = config.supabaseUrl.replace(/\/+$/, "");
  const response = await fetch(`${root}/functions/v1/proforma`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Erreur serveur (${response.status}).`);
  return payload;
}
