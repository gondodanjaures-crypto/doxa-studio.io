import { motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { useContent } from "../data/content";
import { focusProject } from "../data/focus";
import { getPublished, subscribePublished } from "../data/store";
import { SectionTag, SplitText } from "./ui";

export default function Services() {
  const { sections, services, projects } = useContent();
  const published = useSyncExternalStore(subscribePublished, getPublished);

  /* Le clic sur une expertise ramène vers un projet correspondant
     de la section Réalisations (même catégorie). */
  const openProject = (title: string) => {
    const all = [...published, ...projects];
    const byTitle = (t: string) =>
      t
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const wanted = byTitle(title);
    const match =
      all.find((p) => byTitle(p.category) === wanted) ??
      all.find((p) => wanted.includes(byTitle(p.category)) || byTitle(p.category).includes(wanted.slice(0, 6)));
    if (match) focusProject(match.id);
    document
      .getElementById("realisations")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="expertises" className="relative border-b border-white/10 py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTag>Nos expertises</SectionTag>
            <h2 className="font-display text-4xl uppercase leading-none sm:text-5xl">
              <SplitText text={sections.servicesTitle1} />{" "}
              <span className="text-stroke">
                <SplitText text={sections.servicesTitle2} delay={0.08} />
              </span>
            </h2>
          </div>
          <p className="max-w-[320px] text-xs leading-relaxed text-white/45 line-clamp-2 sm:text-right">
            Cliquez sur une expertise : on vous emmène directement sur un
            projet correspondant déjà publié sur le site.
          </p>
        </div>

        {/* Boutons d'expertises — clic = projet en rapport */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {services.map((s, i) => (
            <motion.button
              key={s.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => openProject(s.title)}
              data-cursor="media"
              data-cursor-label="Voir"
              className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-ink p-4 text-left transition-colors duration-300 hover:border-rouge/60"
            >
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-rouge transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <div className="flex items-start justify-between">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 stroke-rouge transition-transform duration-500 group-hover:scale-110"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={s.icon} />
                </svg>
                <span className="font-display text-sm text-white/15 transition-colors duration-300 group-hover:text-rouge">
                  {s.num}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[15px] uppercase leading-tight text-white/90 transition-colors duration-300 group-hover:text-white">
                {s.title}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/0 transition-all duration-300 group-hover:text-rouge">
                Voir un projet
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
