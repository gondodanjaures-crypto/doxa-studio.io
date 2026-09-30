import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { callProforma } from "../data/proforma";
import { cn } from "../utils/cn";
import BrandMark from "./BrandLogo";

type Quote = {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  client_company: string;
  needs: string[];
  intention: string;
  created_at: string;
  token_expires_at: string;
};

type PriceLine = { amount: string; description: string };

const inputClass =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]";

const money = (v: string) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(v) || 0);

export default function QuoteApproval({
  id,
  token,
  onClose,
}: {
  id: string;
  token: string;
  onClose: () => void;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [lines, setLines] = useState<Record<string, PriceLine>>({});
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ number: string; total: number } | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const result = await callProforma<{ quote: Quote }>({ action: "read", id, token });
        if (!active) return;
        setQuote(result.quote);
        setLines(
          Object.fromEntries(
            result.quote.needs.map((need) => [need, { amount: "", description: "" }]),
          ),
        );
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Lien invalide ou expiré.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, token]);

  const total = useMemo(
    () => Object.values(lines).reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [lines],
  );

  const validateAndSend = async () => {
    if (!quote || sending) return;
    setError("");
    const invalid = quote.needs.some((need) => {
      const amount = Number(lines[need]?.amount);
      return !Number.isSafeInteger(amount) || amount <= 0;
    });
    if (invalid) {
      setError("Renseignez un montant entier en FCFA supérieur à zéro pour chaque expertise.");
      return;
    }
    setSending(true);
    try {
      const items = quote.needs.map((label) => ({
        label,
        description: lines[label]?.description.trim() || "Prestation selon le brief validé",
        amount: Number(lines[label].amount),
      }));
      const result = await callProforma<{ ok: true; number: string; total: number }>({
        action: "approve",
        id,
        token,
        items,
        validUntil,
      });
      setSuccess({ number: result.number, total: result.total });
    } catch (e) {
      setError(e instanceof Error ? e.message : "La facture n'a pas pu être envoyée.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-ink px-4 py-8 text-white sm:px-8 sm:py-12">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10 object-contain" />
            <div>
              <p className="font-display text-lg uppercase">Doxa<span className="text-rouge"> Studio</span></p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">Validation pro forma</p>
            </div>
          </div>
          <button onClick={onClose} data-cursor="link" className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 hover:border-white/40 hover:text-white">
            Retour au site
          </button>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-rouge" />
              <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-white/45">Vérification du lien sécurisé…</p>
            </motion.div>
          ) : error && !quote ? (
            <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-rouge/30 bg-ink-2 p-8 text-center sm:p-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rouge/15 text-rouge">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              </span>
              <h1 className="mt-5 font-display text-3xl uppercase">Lien indisponible</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/50">{error}</p>
              <p className="mt-4 text-[11px] text-white/35">Le lien est personnel, expire après 7 jours et ne peut être utilisé qu'une fois.</p>
            </motion.div>
          ) : success ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-[#28c840]/30 bg-ink-2 p-8 text-center sm:p-12">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#28c840]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
              </span>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-[#28c840]">Facture approuvée et envoyée</p>
              <h1 className="mt-2 font-display text-4xl uppercase">{success.number}</h1>
              <p className="mt-4 text-sm text-white/55">Le PDF définitif a été envoyé à <span className="text-white">{quote?.client_email}</span>.</p>
              <p className="mt-2 font-display text-2xl text-[#28c840]">{money(String(success.total))} FCFA</p>
              <button onClick={onClose} data-cursor="link" className="mt-8 rounded-full border border-white/20 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 hover:border-white/50 hover:text-white">Fermer</button>
            </motion.div>
          ) : quote ? (
            <motion.div key="quote" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="rounded-2xl border border-white/10 bg-ink-2 p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rouge">Demande à chiffrer</p>
                <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{quote.quote_number}</h1>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-ink p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Client</p>
                    <p className="mt-1.5 font-semibold">{quote.client_name}</p>
                    {quote.client_company && <p className="text-[12px] text-white/45">{quote.client_company}</p>}
                    <p className="mt-1 break-all text-[11px] text-white/55">{quote.client_email}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-ink p-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Expertises choisies</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {quote.needs.map((need) => <span key={need} className="rounded-full border border-rouge/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] text-rouge">{need}</span>)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4 sm:p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">Intention du client</p>
                  <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-white/75">{quote.intention}</p>
                </div>
                <p className="mt-4 text-[10px] text-white/30">Demande reçue le {new Date(quote.created_at).toLocaleString("fr-FR")} · Lien valable jusqu'au {new Date(quote.token_expires_at).toLocaleDateString("fr-FR")}</p>
              </section>

              <section className="rounded-2xl border border-rouge/25 bg-ink-2 p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rouge">Votre chiffrage</p>
                <h2 className="mt-2 font-display text-2xl uppercase">Définir les tarifs</h2>
                <p className="mt-2 text-[11px] leading-relaxed text-white/45">Entrez le prix de chaque prestation en FCFA. Une facture pro forma PDF sera envoyée au client après validation.</p>

                <div className="mt-5 space-y-3">
                  {quote.needs.map((need) => (
                    <div key={need} className="rounded-xl border border-white/10 bg-ink p-3.5">
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">{need}</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={lines[need]?.amount ?? ""}
                        onChange={(e) => setLines((current) => ({ ...current, [need]: { ...current[need], amount: e.target.value } }))}
                        placeholder="Montant en FCFA"
                        className={inputClass}
                      />
                      <input
                        value={lines[need]?.description ?? ""}
                        onChange={(e) => setLines((current) => ({ ...current, [need]: { ...current[need], description: e.target.value } }))}
                        placeholder="Détail inclus (optionnel)"
                        className="mt-2 w-full border-0 bg-transparent px-1 py-1.5 text-[11px] text-white/60 outline-none placeholder:text-white/25"
                      />
                    </div>
                  ))}
                </div>

                <label className="mt-4 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Date limite de validité du devis</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={cn(inputClass, "mt-2 [color-scheme:dark]")} />

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Total pro forma</span>
                  <span className="font-display text-2xl text-rouge">{money(String(total))} <span className="text-sm">FCFA</span></span>
                </div>

                {error && <p role="alert" className="mt-4 rounded-xl border border-rouge/40 bg-rouge/10 px-4 py-3 text-[11px] leading-relaxed text-rouge">{error}</p>}

                <button onClick={() => void validateAndSend()} disabled={sending || quote.needs.length === 0} data-cursor="link" className="group relative mt-5 w-full overflow-hidden rounded-full bg-rouge px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60">
                  <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 group-hover:translate-y-0" />
                  <span className="relative z-10 flex items-center justify-center gap-2.5 group-hover:text-ink">
                    {sending ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Génération du PDF et envoi…</> : "Valider et envoyer la pro forma PDF"}
                  </span>
                </button>
                <p className="mt-3 text-center text-[9.5px] leading-relaxed text-white/30">Le lien de validation est à usage unique. Après l'envoi, il ne sera plus valable.</p>
              </section>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
