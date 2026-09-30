import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useContent } from "../data/content";
import { clearFocus, useFocus } from "../data/focus";
import type { Project } from "../data/site";
import { getPublished, subscribePublished } from "../data/store";
import { cn } from "../utils/cn";
import { isVimeoUrl } from "../utils/video";
import VideoEmbed from "./VideoEmbed";
import { Reveal, SectionTag, SplitText } from "./ui";

function Card({
  project,
  index,
  flash = false,
  onOpen,
}: {
  project: Project;
  index: number;
  flash?: boolean;
  onOpen: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      data-cursor="media"
      data-cursor-label={project.video ? "Play" : "Agrandir"}
      data-proj-id={project.id}
      className={cn(
        "group relative mb-5 break-inside-avoid cursor-pointer overflow-hidden rounded-xl border bg-ink-2 transition-shadow duration-500",
        flash
          ? "border-rouge ring-4 ring-rouge/70 shadow-[0_0_60px_rgba(255,42,42,0.35)]"
          : "border-white/10",
      )}
    >
      {/* Image au format naturel : un portrait reste vertical,
          un paysage reste horizontal — aucune image n'est rognée. */}
      <img
        src={project.image}
        alt={project.title}
        loading="lazy"
        className="block w-full grayscale transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
      />

      {project.video && hover && (
        <VideoEmbed
          src={project.video}
          title={project.title}
          mode="background"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Voile limité au bas pour laisser respirer les portraits */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink via-ink/55 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Filet rouge animé */}
      <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-rouge transition-transform duration-500 ease-out group-hover:scale-x-100" />

      <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between gap-2">
        <span className="rounded-full bg-ink/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
          {project.category}
        </span>
        <div className="flex flex-col items-end gap-2">
          {project.video && (
            <span className="flex items-center gap-1.5 rounded-full bg-rouge px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-black/20">
              {isVimeoUrl(project.video) ? "Vimeo" : "Vidéo"}
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
          {flash && (
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-full bg-rouge px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            >
              Projet en rapport
            </motion.span>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-rouge">
              {project.client} — {project.year}
            </p>
            <h3 className="mt-2 font-display text-2xl uppercase leading-none">
              {project.title}
            </h3>
            <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 transition-all duration-500 group-hover:border-rouge group-hover:bg-rouge">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Visionneuse plein écran (façon Picasa) : image agrandie + infos     */
/* ------------------------------------------------------------------ */
function Lightbox({
  project,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  project: Project;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const navBtn =
    "absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-rouge hover:bg-rouge hover:text-white";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-[210] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-xl sm:p-10"
    >
      {/* Compteur */}
      <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-ink/70 px-4 py-2 font-display text-sm tracking-[0.2em] text-white/70 backdrop-blur-md">
        {index + 1} / {total}
      </span>

      {/* Fermer */}
      <button
        onClick={onClose}
        data-cursor="link"
        aria-label="Fermer la visionneuse"
        className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-rouge hover:bg-rouge hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* Précédent / suivant */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            data-cursor="link"
            aria-label="Projet précédent"
            className={cn(navBtn, "left-3 sm:left-6")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            data-cursor="link"
            aria-label="Projet suivant"
            className={cn(navBtn, "right-3 sm:right-6")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      {/* Fiche projet */}
      <motion.div
        key={project.id}
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-ink-2 shadow-2xl shadow-black/70"
      >
        <div className="flex max-h-[68vh] items-center justify-center bg-black/70">
          {project.video ? (
            <VideoEmbed
              src={project.video}
              title={project.title}
              mode="player"
              poster={project.image}
              className="aspect-video max-h-[68vh] w-full max-w-[1060px] object-contain"
            />
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="max-h-[68vh] w-full object-contain"
            />
          )}
        </div>

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-rouge/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rouge">
              {project.category}
            </span>
            <h3 className="mt-3 font-display text-3xl uppercase leading-none sm:text-4xl">
              {project.title}
            </h3>
            <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
              {project.client} — {project.year}
            </p>
            {project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <a
            href="#contact"
            onClick={onClose}
            data-cursor="link"
            className="group relative inline-flex shrink-0 items-center justify-center gap-3 overflow-hidden rounded-full bg-rouge px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
              Discuter de votre projet
            </span>
          </a>
        </div>

        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-rouge" />
      </motion.div>
    </motion.div>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState<string>("Tout");
  const [flashId, setFlashId] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { sections } = useContent();

  /* Projets de la vitrine (éditables dans l'admin) + projets Espace Studio */
  const { projects } = useContent();
  const published = useSyncExternalStore(subscribePublished, getPublished);
  const all = useMemo(() => [...published, ...projects], [published, projects]);

  const categories = useMemo(
    () => ["Tout", ...Array.from(new Set(all.map((p) => p.category)))],
    [all],
  );

  const filtered = useMemo(
    () => (filter === "Tout" ? all : all.filter((p) => p.category === filter)),
    [filter, all],
  );

  const currentLightbox = lightbox !== null ? filtered[lightbox] : undefined;
  const closeLightbox = () => setLightbox(null);
  const nextLightbox = () =>
    setLightbox((i) =>
      i === null || filtered.length === 0 ? i : (i + 1) % filtered.length,
    );
  const prevLightbox = () =>
    setLightbox((i) =>
      i === null || filtered.length === 0
        ? i
        : (i - 1 + filtered.length) % filtered.length,
    );

  /* Focalisation demandée depuis les boutons d'expertises :
     on ajuste le filtre, on scrolle vers le projet et on le met en valeur. */
  const focus = useFocus();
  useEffect(() => {
    if (!focus) return;
    const p = all.find((x) => x.id === focus.id);
    if (!p) {
      clearFocus();
      return;
    }
    if (filter !== "Tout" && filter !== p.category) setFilter(p.category);
    const t1 = window.setTimeout(() => {
      document
        .querySelector(`[data-proj-id="${focus.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(p.id);
    }, 380);
    const t2 = window.setTimeout(() => {
      setFlashId(null);
      clearFocus();
    }, 3400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [focus, all, filter]);

  return (
    <section id="realisations" className="relative scroll-mt-20 border-b border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionTag>Réalisations</SectionTag>
            <h2 className="font-display text-[12vw] uppercase leading-[0.9] sm:text-[8vw] lg:text-[5.4vw]">
              <SplitText text={sections.portfolioTitle1} />{" "}
              <span className="text-rouge">
                <SplitText text={sections.portfolioTitle2} delay={0.12} />
              </span>
            </h2>
            <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-white/40">
              {filtered.length} projet{filtered.length > 1 ? "s" : ""}
              {filter !== "Tout" && ` — ${filter}`}
            </p>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                data-cursor="link"
                className={cn(
                  "relative overflow-hidden rounded-full border px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300",
                  filter === c
                    ? "border-rouge bg-rouge text-white"
                    : "border-white/15 text-white/60 hover:border-white/40 hover:text-white",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Mosaïque : les colonnes laissent chaque image garder
            son orientation naturelle (portrait / paysage). */}
        <div className="mt-14 columns-1 gap-5 sm:columns-2 xl:columns-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <Card
                key={p.id}
                project={p}
                index={i}
                flash={flashId === p.id}
                onOpen={() => setLightbox(i)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="mt-14 rounded-2xl border border-dashed border-white/15 p-12 text-center">
            <p className="font-display text-2xl uppercase text-white/50">Aucun projet ici pour le moment</p>
            <p className="mt-2 text-sm text-white/35">Essayez une autre catégorie.</p>
          </div>
        )}

        <Reveal delay={0.1} className="mt-14 flex justify-center">
          <a
            href="#contact"
            data-cursor="link"
            className="group inline-flex items-center gap-4 text-sm uppercase tracking-[0.22em] text-white/70 transition-colors hover:text-white"
          >
            <span className="link-underline">Votre projet mérite cette page</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-all duration-500 group-hover:border-rouge group-hover:bg-rouge">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </Reveal>
      </div>

      {/* Visionneuse plein écran */}
      <AnimatePresence>
        {currentLightbox && lightbox !== null && (
          <Lightbox
            project={currentLightbox}
            index={lightbox}
            total={filtered.length}
            onClose={closeLightbox}
            onPrev={prevLightbox}
            onNext={nextLightbox}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
