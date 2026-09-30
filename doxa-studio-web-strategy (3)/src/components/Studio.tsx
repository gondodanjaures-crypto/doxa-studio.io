import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useContent } from "../data/content";
import {
  addProject,
  getPublished,
  removeProject,
  subscribePublished,
} from "../data/store";
import { ROLE_LABELS, type Account } from "../data/users";
import { isVimeoUrl, normalizeVideoInput } from "../utils/video";
import BrandMark from "./BrandLogo";
import { cn } from "../utils/cn";

const EMPTY = {
  title: "",
  client: "",
  category: "Motion Design",
  year: "2026",
  image: "",
  video: "",
  tags: "",
  size: "std" as "std" | "wide" | "tall",
};

const inputCls = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]",
    invalid ? "border-rouge" : "border-white/12",
  );

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/45">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-rouge">{error}</p>}
    </div>
  );
}

export default function Studio({
  user,
  onLogout,
  onBackSite,
  onAdmin,
}: {
  user: Account;
  onLogout: () => void;
  onBackSite: () => void;
  onAdmin: () => void;
}) {
  const { services } = useContent();
  const defaultCategory = services[0]?.title ?? "Motion Design";
  const [projects, setProjects] = useState(getPublished());
  const [form, setForm] = useState({ ...EMPTY, category: defaultCategory });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(
    () => subscribePublished(() => setProjects(getPublished())),
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const set = (k: keyof typeof EMPTY) => (v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const imageOk = /^https?:\/\/.+\..+/.test(form.image.trim());
  const lastPub = projects[0]?.publishedAt;

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const err: Record<string, string> = {};
    if (form.title.trim().length < 3) err.title = "Titre requis (3 caractères min).";
    if (form.client.trim().length < 2) err.client = "Client requis.";
    if (!imageOk) err.image = "URL d'image valide requise (https://…).";
    const normalizedVideo = form.video.trim()
      ? normalizeVideoInput(form.video) ?? undefined
      : undefined;
    if (form.video.trim() && !normalizedVideo)
      err.video = "URL de vidéo invalide.";
    if (!/^\d{4}$/.test(form.year.trim())) err.year = "Année en 4 chiffres.";
    setErrors(err);
    if (Object.values(err).some(Boolean)) return;

    /* Barre de chargement, puis mise en ligne effective. */
    setSaving(true);
    setProgress(0);
    const data = {
      title: form.title.trim(),
      client: form.client.trim(),
      category: form.category,
      year: form.year.trim(),
      image: form.image.trim(),
      video: normalizedVideo,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 4),
      size: form.size,
    };
    const t0 = performance.now();
    const dur = 1200;
    await new Promise<void>((resolve) => {
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / dur);
        setProgress(Math.round(p * 100));
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    addProject(data);
    setSaving(false);
    setProgress(0);
    setForm({ ...EMPTY, category: defaultCategory });
    setToast("Projet enregistré — visible dans la section Réalisations du site.");
  };

  return (
    <div className="min-h-screen">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <button
            onClick={onBackSite}
            data-cursor="link"
            className="group flex items-center gap-3"
          >
            <BrandMark className="h-9 w-9 text-white object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-180" />
            <span className="font-display text-base uppercase tracking-[0.08em] text-white">
              Doxa<span className="text-rouge"> Studio</span>
            </span>
            <span className="hidden rounded-full border border-rouge/40 bg-rouge/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-rouge sm:inline">
              Espace équipe
            </span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onAdmin}
              data-cursor="link"
              className="group relative hidden items-center gap-2 overflow-hidden rounded-full bg-rouge px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white sm:inline-flex"
            >
              <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-ink">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h.1a1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.5 1h.2a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
                </svg>
                Admin
              </span>
            </button>
            <span className="hidden max-w-[260px] items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] text-white/60 md:flex">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-rouge" />
              <span className="truncate">{user.pseudo}</span>
              <span className="shrink-0 rounded-full bg-rouge/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-rouge">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <button
              onClick={onBackSite}
              data-cursor="link"
              className="hidden rounded-full border border-white/15 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/50 hover:text-white sm:inline-flex"
            >
              Voir le site
            </button>
            <button
              onClick={onLogout}
              data-cursor="link"
              className="rounded-full border border-rouge/50 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-rouge transition-all duration-300 hover:bg-rouge hover:text-white"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
        {/* Accueil */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-rouge">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rouge" />
            Tableau de bord
          </p>
          <h1 className="mt-3 font-display text-[9vw] uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
            Bonjour, <span className="text-rouge">Équipe</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
            Publiez une réalisation en moins d'une minute : elle apparaît
            immédiatement dans la section{" "}
            <span className="text-white">Réalisations</span> du site public,
            sans validation. Retirez-la à tout moment.
          </p>
        </motion.div>

        {/* Statistiques */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
          {[
            {
              label: "Projets en ligne",
              value: String(projects.length),
            },
            {
              label: "Catégories actives",
              value: String(new Set(projects.map((p) => p.category)).size),
            },
            {
              label: "Dernière publication",
              value: lastPub
                ? new Date(lastPub).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-ink px-6 py-6"
            >
              <p className="font-display text-4xl leading-none transition-colors duration-300 group-hover:text-rouge">
                {s.value}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-8 xl:grid-cols-[430px_minmax(0,1fr)]">
          {/* Formulaire de publication */}
          <motion.form
            onSubmit={publish}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-white/12 bg-ink-2/70 p-6 backdrop-blur-xl sm:p-8 xl:sticky xl:top-24"
          >
            <h2 className="font-display text-2xl uppercase leading-none">
              Mettre un projet <span className="text-rouge">en ligne</span>
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Les champs marqués * sont obligatoires.
            </p>

            <div className="mt-6 space-y-5">
              <Field label="Titre du projet *" error={errors.title}>
                <input
                  value={form.title}
                  onChange={(e) => set("title")(e.target.value)}
                  placeholder="Ex. : Identité Café Sankofa"
                  className={inputCls(Boolean(errors.title))}
                />
              </Field>

              <Field label="Client / Marque *" error={errors.client}>
                <input
                  value={form.client}
                  onChange={(e) => set("client")(e.target.value)}
                  placeholder="Ex. : Café Sankofa"
                  className={inputCls(Boolean(errors.client))}
                />
              </Field>

              <div className="grid grid-cols-[1fr_92px] gap-3">
                <Field label="Catégorie — Nos expertises">
                  <select
                    value={form.category}
                    onChange={(e) => set("category")(e.target.value)}
                    className={cn(inputCls(false), "appearance-none")}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title} className="bg-ink-2">
                        {s.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Année" error={errors.year}>
                  <input
                    value={form.year}
                    onChange={(e) => set("year")(e.target.value)}
                    placeholder="2026"
                    className={inputCls(Boolean(errors.year))}
                  />
                </Field>
              </div>

              <Field label="URL de l'image *" error={errors.image}>
                <div className="mb-3 rounded-xl border border-white/10 bg-ink/70 p-3.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rouge">
                    Dimensions pour la mosaique
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    {[
                      ["Paysage", "1600 x 1000"],
                      ["Portrait", "1200 x 1600"],
                      ["Carre", "1200 x 1200"],
                    ].map(([name, size]) => (
                      <div key={name} className="rounded-lg border border-white/10 bg-white/[0.025] px-2 py-2">
                        <p className="text-[8.5px] uppercase tracking-[0.14em] text-white/35">{name}</p>
                        <p className="mt-1 text-[10.5px] font-semibold text-white/75">{size} px</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-white/35">
                    WebP ou JPG, sRGB, 2 Mo conseille. La mosaique respecte automatiquement l'orientation.
                  </p>
                </div>
                <input
                  value={form.image}
                  onChange={(e) => {
                    set("image")(e.target.value);
                    setImageSize(null);
                  }}
                  placeholder="https://…"
                  className={inputCls(Boolean(errors.image))}
                />
                {form.image.trim() && (
                  <div className="relative mt-3 overflow-hidden rounded-lg border border-white/10">
                    <img
                      src={form.image.trim()}
                      alt="Aperçu du projet"
                      className={cn(
                        "h-40 w-full object-cover",
                        !imageOk && "opacity-40",
                      )}
                      onLoad={(e) =>
                        setImageSize({
                          width: e.currentTarget.naturalWidth,
                          height: e.currentTarget.naturalHeight,
                        })
                      }
                    />
                    <span className="absolute bottom-2 left-2 rounded-full bg-ink/85 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/70">
                      Aperçu
                    </span>
                    {imageSize && (
                      <span
                        className={cn(
                          "absolute bottom-2 right-2 rounded-full border bg-ink/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md",
                          Math.max(imageSize.width, imageSize.height) >= 1000
                            ? "border-[#28c840]/50 text-[#28c840]"
                            : "border-rouge/50 text-rouge",
                        )}
                      >
                        {imageSize.width} x {imageSize.height} px
                      </span>
                    )}
                  </div>
                )}
              </Field>

              <Field
                label="Extrait vidéo (optionnel — mp4, lien Vimeo ou code d'intégration)"
                error={errors.video}
              >
                <input
                  value={form.video}
                  onChange={(e) => set("video")(e.target.value)}
                  placeholder="Lien Vimeo, code iframe Vimeo ou URL mp4"
                  className={inputCls(Boolean(errors.video))}
                />
                {isVimeoUrl(form.video) && (
                  <p className="mt-1.5 text-[10.5px] font-semibold text-[#28c840]">
                    ✓ Lien Vimeo détecté — la vidéo sera lue en lecteur Vimeo
                    (survol et visionneuse).
                  </p>
                )}
              </Field>

              <Field label="Tags (séparés par des virgules)">
                <input
                  value={form.tags}
                  onChange={(e) => set("tags")(e.target.value)}
                  placeholder="SketchUp, Rendu, Visite virtuelle"
                  className={inputCls(false)}
                />
              </Field>

              <button
                type="submit"
                data-cursor="link"
                disabled={saving}
                className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-90"
              >
                <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                {saving && (
                  <span
                    className="absolute inset-y-0 left-0 bg-white/25 transition-[width] duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                      Enregistrement… {progress}%
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      Mettre en ligne
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.form>

          {/* Projets publiés */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl uppercase">
                Projets publiés{" "}
                <span className="text-rouge">({projects.length})</span>
              </h2>
              <button
                onClick={onBackSite}
                data-cursor="link"
                className="link-underline text-[10.5px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
              >
                Voir sur le site →
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-10 text-center">
                <BrandMark className="h-14 w-14 text-white/25 object-contain" />
                <p className="mt-5 font-display text-xl uppercase text-white/60">
                  Aucun projet en ligne
                </p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/40">
                  Remplissez le formulaire : votre première réalisation
                  apparaît ici et sur le site public.
                </p>
              </div>
            ) : (
              <motion.div layout className="grid gap-5 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {projects.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-ink-2"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
                          {p.category}
                        </span>
                        {p.video && (
                          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-rouge px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] text-white">
                            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-white">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Vidéo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-lg uppercase">
                            {p.title}
                          </h3>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                            {p.client} — {p.year}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={onBackSite}
                            data-cursor="link"
                            className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => {
                              removeProject(p.id);
                              setToast("Projet retiré du site.");
                            }}
                            data-cursor="link"
                            aria-label={`Retirer ${p.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-rouge/40 text-rouge transition-colors duration-300 hover:bg-rouge hover:text-white"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.9}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.section>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 30, x: "-50%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 z-[150] flex items-center gap-3 rounded-full border border-rouge/40 bg-ink-2/95 py-3 pl-4 pr-6 shadow-2xl shadow-rouge/20 backdrop-blur-xl"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rouge">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <p className="text-[12.5px] font-medium">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
