import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useContent, useContact } from "../data/content";
import LogoMark from "./LogoMark";
import { Reveal, SectionTag, SplitText } from "./ui";

export default function Founder() {
  const { founder } = useContent();
  const contact = useContact();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "10%"]);

  return (
    <section id="fondateur" className="grain relative overflow-hidden border-b border-white/10 py-24 sm:py-32">
      <div className="absolute -right-40 top-1/4 h-[420px] w-[420px] rounded-full bg-rouge/12 blur-[150px]" />
      <div className="grid-lines absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Portrait */}
          <div ref={ref} className="relative mx-auto w-full max-w-[440px]">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-2xl border border-rouge/50" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-ink-2">
              {founder.photo ? (
                <motion.img
                  style={{ y }}
                  src={founder.photo}
                  alt={`Portrait de ${founder.name}`}
                  loading="lazy"
                  className="absolute inset-0 h-[118%] w-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_35%,rgba(255,42,42,0.14),transparent_65%)]">
                  <LogoMark className="h-24 w-24 text-white/85" />
                  <p className="font-display text-2xl uppercase tracking-wide text-white/70">
                    Doxa Studio
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            </div>

            {/* Carte rôle flottante */}
            <Reveal delay={0.2} className="absolute -bottom-7 left-1/2 w-[92%] -translate-x-1/2">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/90 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rouge font-display text-lg">
                  {founder.name.trim().charAt(0).toUpperCase() || "D"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg uppercase leading-tight">{founder.name}</p>
                  <p className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rouge" />
                    {founder.role}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Texte */}
          <div className="pt-4 lg:pt-0">
            <SectionTag>Le fondateur</SectionTag>
            <h2 className="font-display text-[11vw] uppercase leading-[0.9] sm:text-[7vw] lg:text-[4.2vw]">
              <SplitText text="Le visage" />
              <br />
              <span className="text-rouge">
                <SplitText text="derrière Doxa" delay={0.1} />
              </span>
            </h2>

            <Reveal delay={0.18}>
              <p className="mt-8 text-white/65">{founder.bio1}</p>
              <p className="mt-4 text-white/65">{founder.bio2}</p>
            </Reveal>

            <Reveal delay={0.26}>
              <blockquote className="mt-8 border-l-2 border-rouge pl-6">
                <p className="font-display text-2xl uppercase leading-tight sm:text-3xl">
                  “{founder.quote}”
                </p>
                <footer className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span className="text-rouge">{founder.name}</span> — {contact.city}, {contact.country}
                </footer>
              </blockquote>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#contact"
                  data-cursor="link"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
                >
                  <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
                    Travailler avec moi
                  </span>
                </a>
                <a
                  href="#realisations"
                  data-cursor="link"
                  className="link-underline text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
                >
                  Voir les réalisations
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
