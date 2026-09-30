import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/* ------------------------------------------------------------------ */
/* Variables d'environnement de l'hébergeur (Netlify)                  */
/* ------------------------------------------------------------------ */
/* Elles sont injectées au BUILD, donc présentes dans CHAQUE déploiement: */
/*   VITE_DOXA_SYNC       = URL de la sauvegarde en ligne (JSONBlob)    */
/*   VITE_DOXA_PROFORMA   = JSON {supabaseUrl, anonKey}                 */
/* Elles complètent le script DOXA_SYNC / DOXA_PROFORMA collé dans      */
/* l'index.html — les deux méthodes sont acceptées.                     */
/* ------------------------------------------------------------------ */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

if (env.VITE_DOXA_SYNC && /^https:\/\//.test(env.VITE_DOXA_SYNC)) {
  (window as { DOXA_SYNC?: string }).DOXA_SYNC = env.VITE_DOXA_SYNC;
}
if (env.VITE_DOXA_PROFORMA) {
  try {
    const parsed = JSON.parse(env.VITE_DOXA_PROFORMA) as {
      supabaseUrl?: string;
      anonKey?: string;
    };
    if (parsed.supabaseUrl && parsed.anonKey) {
      (window as { DOXA_PROFORMA?: { supabaseUrl: string; anonKey: string } }).DOXA_PROFORMA = {
        supabaseUrl: parsed.supabaseUrl,
        anonKey: parsed.anonKey,
      };
    }
  } catch {
    /* JSON invalide : on garde la configuration de l'index.html */
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
