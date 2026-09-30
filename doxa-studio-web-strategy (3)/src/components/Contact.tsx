import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useContent } from "../data/content";
import { callProforma, getProformaConfig } from "../data/proforma";
import { addQuote } from "../data/quotes";
import { cn } from "../utils/cn";
import { Reveal, SectionTag, SplitText } from "./ui";

type Fields = { name: string; email: string; company: string; intention: string };
type Receipt = { number: string };

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea = false,
  placeholder,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full resize-y rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm leading-relaxed text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]",
            error ? "border-rouge" : "border-white/12",
          )}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]",
            error ? "border-rouge" : "border-white/12",
          )}
        />
      )}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-[11px] text-rouge">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const { contact, sections, services } = useContent();
  const [f, setF] = useState<Fields>({ name: "", email: "", company: "", intention: "" });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [needs, setNeeds] = useState<string[]>([]);
  const [website, setWebsite] = useState(""); // Honeypot anti-spam.
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [requestError, setRequestError] = useState("");

  const set = (key: keyof Fields) => (value: string) => {
    setF((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  };

  const toggleNeed = (name: string) =>
    setNeeds((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Fields> = {};
    if (f.name.trim().length < 2) nextErrors.name = "Indiquez votre nom complet.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) nextErrors.email = "Adresse email invalide.";
    if (f.intention.trim().length < 80)
      nextErrors.intention = "Merci de détailler votre intention (80 caractères minimum).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || needs.length === 0) {
      if (needs.length === 0) setRequestError("Choisissez au moins une expertise pour préparer votre demande.");
      return;
    }

    setLoading(true);
    setRequestError("");

    /* 1. La demande part immédiatement dans le dashboard du studio. */
    const quote = addQuote({
      name: f.name.trim(),
      email: f.email.trim(),
      company: f.company.trim(),
      needs,
      intention: f.intention.trim(),
    });

    /* 2. Relais par email automatique, seulement si le service est configuré. */
    if (getProformaConfig() && !website) {
      void callProforma({
        action: "request",
        name: f.name.trim(),
        email: f.email.trim(),
        company: f.company.trim(),
        needs,
        intention: f.intention.trim(),
        website,
      }).catch(() => undefined);
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    setReceipt({ number: quote.number });
    setLoading(false);
  };

  const reset = () => {
    setReceipt(null);
    setF({ name: "", email: "", company: "", intention: "" });
    setNeeds([]);
    setErrors({});
    setRequestError("");
  };

  const rows = [
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    ...contact.phones.map((phone, index) => ({
      label: index === 0 ? "Téléphone" : `Ligne ${index + 1}`,
      value: phone.display,
      href: `tel:${phone.tel}`,
    })),
    { label: "WhatsApp", value: "Discuter maintenant", href: contact.whatsapp },
    { label: "Studio", value: contact.location, href: "#agence" },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-rouge/12 blur-[170px]" />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <SectionTag>Contact</SectionTag>
            <h2 className="font-display text-[12vw] uppercase leading-[0.88] sm:text-[8vw] lg:text-[5vw]">
              <SplitText text={sections.contactTitle1} />
              <br />
              <span className="text-rouge"><SplitText text={sections.contactTitle2} delay={0.1} /></span>
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-7 max-w-md text-white/60">{contact.intro}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-6 rounded-xl border border-rouge/40 bg-rouge/[0.06] p-4">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rouge">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M9 13h6M9 17h6" />
                  </svg>
                  Devis validé par Doxa Studio
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-white/60">
                  Décrivez votre intention avec précision. Nous étudions le brief, fixons le prix,
                  puis vous envoyons la <span className="text-white">facture pro forma PDF par email</span> après validation.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 space-y-px overflow-hidden rounded-xl bg-white/10">
              {rows.map((row) => (
                <a
                  key={row.label}
                  href={row.href}
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                  rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                  data-cursor="link"
                  className="group flex items-center justify-between gap-4 bg-ink px-5 py-4 transition-colors duration-400 hover:bg-rouge"
                >
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.24em] text-white/45 transition-colors group-hover:text-white/80">{row.label}</span>
                  <span className="flex items-center gap-3 text-right text-[13px] font-medium sm:text-sm">
                    {row.value}
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 -rotate-45 text-rouge transition-all duration-400 group-hover:rotate-0 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-ink-2/70 p-6 backdrop-blur-xl sm:p-9">
              <AnimatePresence mode="wait">
                {receipt ? (
                  <motion.div key="receipt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[440px] flex-col items-center justify-center text-center">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 210, damping: 15 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-[#28c840]">
                      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                    </motion.span>
                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.26em] text-[#28c840]">Demande reçue</p>
                    <h3 className="mt-2 font-display text-4xl uppercase">Votre brief est transmis</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                      Merci {f.name.split(" ")[0]}. Votre demande <span className="text-white">{receipt.number}</span> a été envoyée à notre équipe.
                      Nous allons étudier votre intention et chiffrer les prestations. La facture pro forma définitive vous sera envoyée par email après validation.
                    </p>
                    <div className="mt-6 rounded-xl border border-white/10 bg-ink px-5 py-4 text-left">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Prochaines étapes</p>
                      <ol className="mt-3 space-y-2 text-[12px] text-white/60">
                        <li>1. Doxa étudie vos besoins et fixe les tarifs.</li>
                        <li>2. Vous recevez le devis pro forma par email.</li>
                        <li>3. Vous pouvez alors confirmer votre projet.</li>
                      </ol>
                    </div>
                    <button onClick={reset} data-cursor="link" className="mt-8 text-[11px] uppercase tracking-[0.22em] text-rouge link-underline">Envoyer un autre brief</button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rouge">Demande de devis</p>
                        <h3 className="mt-1 font-display text-2xl uppercase">Parlez-nous du projet</h3>
                      </div>
                      <span className="hidden rounded-full border border-white/12 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-white/40 sm:inline">Sans engagement</span>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="name" label="Nom complet *" value={f.name} onChange={set("name")} error={errors.name} placeholder="Jean Dupont" />
                      <Field id="email" label="Email pour recevoir le devis *" type="email" value={f.email} onChange={set("email")} error={errors.email} placeholder="jean@marque.com" />
                    </div>
                    <Field id="company" label="Entreprise / Marque" value={f.company} onChange={set("company")} placeholder="Nom de votre organisation" />

                    <div>
                      <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-white/45">Expertises concernées *</p>
                      <div className="flex flex-wrap gap-2">
                        {services.map((service) => (
                          <button key={service.id} type="button" onClick={() => toggleNeed(service.title)} data-cursor="link" className={cn("rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.12em] transition-all duration-300", needs.includes(service.title) ? "border-rouge bg-rouge text-white" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white")}>
                            {service.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Field
                        id="intention"
                        label="Intention du projet — soyez aussi précis que possible *"
                        textarea
                        rows={7}
                        value={f.intention}
                        onChange={set("intention")}
                        error={errors.intention}
                        placeholder={"Présentez votre contexte et votre objectif.\n\n• Que souhaitez-vous réaliser ?\n• À qui s'adresse le projet ?\n• Quels livrables attendez-vous ?\n• Avez-vous une date limite ou des références ?\n• Y a-t-il des contraintes à connaître ?"}
                      />
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-[10.5px] leading-relaxed text-white/35">Un brief complet nous aide à établir un devis juste. Minimum 80 caractères.</p>
                        <span className={cn("shrink-0 font-mono text-[10px]", f.intention.trim().length >= 80 ? "text-[#28c840]" : "text-white/35")}>
                          {f.intention.trim().length} / 80
                        </span>
                      </div>
                    </div>

                    {/* Honeypot antispam, invisible aux humains. */}
                    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor="website">Ne pas remplir</label>
                      <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>

                    {requestError && <p role="alert" className="rounded-xl border border-rouge/40 bg-rouge/10 px-4 py-3 text-[12px] leading-relaxed text-rouge">{requestError}</p>}

                    <button type="submit" data-cursor="link" disabled={loading} className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-70">
                      <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                      <span className="relative z-10 flex items-center justify-center gap-3 py-1 transition-colors duration-300 group-hover:text-ink">
                        {loading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Transmission sécurisée…</> : "Transmettre mon intention"}
                      </span>
                    </button>
                    <p className="text-center text-[10px] leading-relaxed text-white/30">
                      Aucun prix n'est généré automatiquement. Doxa vérifie votre brief, valide le chiffrage puis vous envoie la pro forma PDF.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}