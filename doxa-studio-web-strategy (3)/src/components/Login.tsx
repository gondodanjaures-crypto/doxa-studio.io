import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  findRecoveryAccount,
  login as dbLogin,
  needsSetup,
  resetPassword,
  setupRootPassword,
  type Account,
} from "../data/users";
import BrandMark from "./BrandLogo";
import { cn } from "../utils/cn";

const ROOT_EMAIL = "gondodanjaures@gmail.com";

const inputCls =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]";

function strength(p: string): 0 | 1 | 2 | 3 {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return (s <= 1 ? 1 : s <= 3 ? 2 : 3) as 0 | 1 | 2 | 3;
}

function StrengthBars({ value }: { value: string }) {
  const s = strength(value);
  const labels = ["", "Faible", "Moyenne", "Forte"];
  const colors = ["", "bg-rouge", "bg-white/60", "bg-[#28c840]"];
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              s >= i ? colors[s] : "bg-white/10",
            )}
          />
        ))}
      </div>
      <span className="text-[9.5px] uppercase tracking-[0.16em] text-white/40">
        {value ? `Sécurité ${labels[s]}` : "8 caractères minimum"}
      </span>
    </div>
  );
}

function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence>
      {children ? (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-2 rounded-xl border border-rouge/40 bg-rouge/10 px-4 py-3 text-[12px] leading-relaxed text-rouge"
        >
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {children}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

/* ================================================================== */
/* Écran 1 — Première ouverture : création du mot de passe             */
/* ================================================================== */
function SetupCard({ onDone }: { onDone: (a: Account) => void }) {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) {
      setError("Votre mot de passe doit contenir au moins 8 caractères.");
      setShake((s) => s + 1);
      return;
    }
    if (pass !== pass2) {
      setError("Les deux mots de passe ne correspondent pas.");
      setShake((s) => s + 1);
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      const res = setupRootPassword(ROOT_EMAIL, pass);
      if (!res.ok) {
        setLoading(false);
        setError(res.error);
        setShake((s) => s + 1);
        return;
      }
      setDone(true);
      window.setTimeout(() => onDone(res.account), 1100);
    }, 700);
  };

  return (
    <motion.div
      key={`setup-${shake}`}
      initial={false}
      animate={shake > 0 ? { x: [0, -12, 12, -7, 7, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rouge/15">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-rouge" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-rouge">
            Première ouverture
          </p>
          <h2 className="font-display text-3xl uppercase leading-none">
            Initialisation
          </h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/55">
        Bienvenue <span className="text-white">Admin/Jaures</span>. Créez le
        mot de passe d'administration : il servira à vous connecter et
        l'email de récupération est déjà enregistré à votre nom.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
            Email de récupération
          </label>
          <div className="relative">
            <input
              value={ROOT_EMAIL}
              disabled
              className={cn(inputCls, "pr-11 border-rouge/40 text-white/70")}
            />
            <svg
              viewBox="0 0 24 24"
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rouge"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </div>
          <p className="mt-1.5 text-[10.5px] text-white/35">
            Compte fondateur — email non modifiable.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError("");
            }}
            placeholder="••••••••"
            className={inputCls}
            autoFocus
          />
          <StrengthBars value={pass} />
        </div>

        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={pass2}
            onChange={(e) => {
              setPass2(e.target.value);
              setError("");
            }}
            placeholder="••••••••"
            className={inputCls}
          />
        </div>

        <ErrorNote>{error}</ErrorNote>

        <button
          type="submit"
          data-cursor="link"
          disabled={loading || done}
          className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-80"
        >
          <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Enregistrement…
              </>
            ) : done ? (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12.5l5 5L20 6.5" />
                </svg>
                Mot de passe créé
              </>
            ) : (
              "Créer mon mot de passe"
            )}
          </span>
        </button>
      </form>
    </motion.div>
  );
}

/* ================================================================== */
/* Écran 2 — Récupération de mot de passe                              */
/* ================================================================== */
function ForgotCard({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (msg: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const check = (e: FormEvent) => {
    e.preventDefault();
    const acc = findRecoveryAccount(email);
    if (!acc) {
      setError("Aucun compte n'est associé à cette adresse de récupération.");
      setShake((s) => s + 1);
      return;
    }
    setError("");
    setStep(2);
  };

  const reset = (e: FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      setShake((s) => s + 1);
      return;
    }
    if (pass !== pass2) {
      setError("Les deux mots de passe ne correspondent pas.");
      setShake((s) => s + 1);
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      const res = resetPassword(email, pass);
      if (!res.ok) {
        setLoading(false);
        setError(res.error);
        return;
      }
      onDone(`Mot de passe de ${res.account.pseudo} réinitialisé — connectez-vous.`);
    }, 700);
  };

  return (
    <motion.div
      key={`forgot-${shake}`}
      initial={false}
      animate={shake > 0 ? { x: [0, -12, 12, -7, 7, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rouge/15">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-rouge" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M4 4h16v12H4z" />
            <path d="M22 16l-5-5M12 8v3M12 13h.01" />
          </svg>
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-rouge">
            Étape {step} / 2
          </p>
          <h2 className="font-display text-3xl uppercase leading-none">
            Mot de passe oublié
          </h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/55">
        {step === 1
          ? "Indiquez votre email de récupération : nous vérifions le compte associé, puis vous choisissez un nouveau mot de passe."
          : `Compte trouvé. Choisissez le nouveau mot de passe pour « ${findRecoveryAccount(email)?.pseudo} ».`}
      </p>

      {step === 1 ? (
        <form onSubmit={check} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
              Email de récupération
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="votreemail@gmail.com"
              className={inputCls}
              autoFocus
            />
          </div>
          <ErrorNote>{error}</ErrorNote>
          <button
            type="submit"
            data-cursor="link"
            className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
              Vérifier mon compte
            </span>
          </button>
        </form>
      ) : (
        <form onSubmit={reset} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              className={inputCls}
              autoFocus
            />
            <StrengthBars value={pass} />
          </div>
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
              Confirmer
            </label>
            <input
              type="password"
              value={pass2}
              onChange={(e) => {
                setPass2(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
          <ErrorNote>{error}</ErrorNote>
          <button
            type="submit"
            data-cursor="link"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-80"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Réinitialisation…
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </span>
          </button>
        </form>
      )}

      <button
        onClick={onBack}
        data-cursor="link"
        className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Retour à la connexion
      </button>
    </motion.div>
  );
}

/* ================================================================== */
/* Page connexion                                                      */
/* ================================================================== */
export default function Login({
  onLogin,
  onBack,
}: {
  onLogin: (account: Account) => void;
  onBack: () => void;
}) {
  const [isSetup] = useState(needsSetup());
  const [forgot, setForgot] = useState(false);
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState(isSetup ? ROOT_EMAIL : "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const fail = (msg: string) => {
    setError(msg);
    setShake((s) => s + 1);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fail("Veuillez saisir une adresse email valide.");
      return;
    }
    if (password.length < 6) {
      fail("Mot de passe invalide (6 caractères minimum).");
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      const account = dbLogin(email, password);
      if (account) {
        onLogin(account);
      } else {
        setLoading(false);
        fail("Identifiants incorrects. Mot de passe oublié ? Utilisez le lien ci-dessous.");
      }
    }, 700);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau marque */}
      <div className="grain relative hidden flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex">
        <div className="grid-lines absolute inset-0 opacity-60" />
        <div className="absolute -left-32 top-1/3 h-[440px] w-[440px] rounded-full bg-rouge/20 blur-[150px]" />

        <motion.div
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative"
        >
          <BrandMark className="h-16 w-16 text-white object-contain" />
        </motion.div>

        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[8.5vw] uppercase leading-[0.88]"
          >
            Espace
            <br />
            <span className="text-rouge">Studio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-6 max-w-sm text-sm leading-relaxed text-white/55"
          >
            L'interface réservée à l'équipe Doxa Studio. Connectez-vous pour
            publier vos réalisations et piloter le site.
          </motion.p>
        </div>

        <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>Accès équipe</span>
          <span aria-hidden className="text-rouge">✳</span>
          <span>Doxa Studio</span>
          <span aria-hidden className="text-rouge">✳</span>
          <span>Abidjan — Côte d'Ivoire</span>
        </div>
      </div>

      {/* Formulaire */}
      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="absolute -right-24 top-1/4 h-[300px] w-[300px] rounded-full bg-rouge/10 blur-[130px]" />

        <div className="relative w-full max-w-md">
          <button
            onClick={onBack}
            data-cursor="link"
            className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Retour au site
          </button>

          <div className="rounded-3xl border border-white/12 bg-ink-2/80 p-7 backdrop-blur-xl sm:p-9">
            <div className="mb-7 flex items-center justify-between lg:hidden">
              <BrandMark className="h-11 w-11 text-white object-contain" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Accès équipe
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isSetup ? (
                <motion.div key="setup" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
                  <SetupCard onDone={onLogin} />
                </motion.div>
              ) : forgot ? (
                <motion.div key="forgot" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
                  <ForgotCard
                    onBack={() => {
                      setForgot(false);
                      setError("");
                    }}
                    onDone={(msg) => {
                      setForgot(false);
                      setSuccess(msg);
                      setPassword("");
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div key="login" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
                  <motion.div
                    key={`shake-${shake}`}
                    initial={false}
                    animate={shake > 0 ? { x: [0, -12, 12, -7, 7, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                  >
                    <h2 className="font-display text-4xl uppercase leading-none">
                      Connexion
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                      Accès réservé à l'équipe Doxa Studio.
                    </p>

                    {success && (
                      <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#28c840]/40 bg-[#28c840]/10 px-4 py-3 text-[12px] leading-relaxed text-[#28c840]">
                        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12.5l5 5L20 6.5" />
                        </svg>
                        {success}
                      </p>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-5">
                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          placeholder="votreemail@gmail.com"
                          className={cn(
                            inputCls,
                            error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                              ? "border-rouge"
                              : "border-white/12",
                          )}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setError("");
                            }}
                            placeholder="••••••••"
                            className={cn(inputCls, "pr-12")}
                          />
                          <button
                            type="button"
                            onClick={() => setShow((v) => !v)}
                            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-rouge"
                          >
                            {show ? (
                              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.9 17.9A10 10 0 0112 20C5 20 2 12 2 12a19.8 19.8 0 015.1-6M9.9 4.2A9.9 9.9 0 0112 4c7 0 10 8 10 8a19.6 19.6 0 01-2.2 3.4M1 1l22 22" />
                                <path d="M9.5 9.6a3.4 3.4 0 004.8 4.8" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <ErrorNote>{error}</ErrorNote>

                      <button
                        type="submit"
                        data-cursor="link"
                        disabled={loading}
                        className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-70"
                      >
                        <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                        <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
                          {loading ? (
                            <>
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              Vérification…
                            </>
                          ) : (
                            "Se connecter"
                          )}
                        </span>
                      </button>
                    </form>

                    <div className="mt-5 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setForgot(true);
                          setError("");
                        }}
                        data-cursor="link"
                        className="link-underline text-[11px] font-semibold uppercase tracking-[0.18em] text-rouge"
                      >
                        Mot de passe oublié ?
                      </button>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                        Email de récupération : le vôtre
                      </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-ink/60 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Compte manager de démonstration
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="min-w-0 text-[13px]">
                          <p className="truncate text-white/80">equipe@doxastudio.com</p>
                          <p className="text-white/55">doxa2026</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail("equipe@doxastudio.com");
                            setPassword("doxa2026");
                            setError("");
                          }}
                          data-cursor="link"
                          className="shrink-0 rounded-full border border-white/20 px-3.5 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors duration-300 hover:border-rouge hover:text-rouge"
                        >
                          Utiliser
                        </button>
                      </div>
                      <p className="mt-3 text-[10.5px] leading-relaxed text-white/35">
                        Le compte super admin <span className="text-white/55">Admin/Jaures</span>{" "}
                        se connecte avec <span className="text-white/55">gondodanjaures@gmail.com</span>{" "}
                        et le mot de passe créé à la première ouverture.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/30">
            Accès protégé — toute tentative non autorisée est tracée.
          </p>
        </div>
      </div>
    </div>
  );
}
