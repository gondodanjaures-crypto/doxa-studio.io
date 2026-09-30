import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useContact, useContent } from "../data/content";
import VideoEmbed from "./VideoEmbed";
import { SplitText } from "./ui";

function RotatingBadge() {
  return (
    <a
      href="#realisations"
      data-cursor="media"
      data-cursor-label="Play"
      className="group relative flex h-32 w-32 items-center justify-center"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full animate-[spin_14s_linear_infinite]">
        <defs>
          <path
            id="circlePath"
            d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
            fill="none"
          />
        </defs>
        <text className="fill-white/70 text-[10.5px] uppercase tracking-[0.34em]">
          <textPath href="#circlePath">
            Showreel 2026 • Doxa Studio • Showreel 2026 •
          </textPath>
        </text>
      </svg>
      <span className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-rouge transition-transform duration-500 group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </a>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { hero } = useContent();
  const contact = useContact();
  const skills = hero.marquee
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      id="accueil"
      ref={ref}
      className="grain relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-28"
    >
      {/* Vidéo de fond */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-20">
        {hero.video ? (
          <VideoEmbed
            src={hero.video}
            title="Doxa Studio — vidéo d'accueil"
            mode="background"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        ) : (
          <img src={hero.poster} alt="" className="h-full w-full object-cover opacity-55" />
        )}
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/60 to-ink" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-70" />
      <div className="absolute -left-40 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-rouge/25 blur-[140px]" />

      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 py-14 sm:px-8"
      >
        {/* Ligne d'intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25 }}
          className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.28em] text-white/60"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rouge" />
            {hero.badge}
          </span>
          <span className="hidden sm:inline">Communication · Production visuelle</span>
        </motion.div>

        <h1 className="font-display text-[13vw] uppercase leading-[0.86] sm:text-[11vw] lg:text-[8.6vw]">
          <SplitText text={hero.line1} className="block" delay={1.15} />
          <span className="block">
            <SplitText text={hero.line2} delay={1.3} />
            <span className="ml-[0.2em] inline-block">
              <motion.span
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-stroke-red"
              >
                {hero.accent}
              </motion.span>
            </span>
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.8 }}
            className="max-w-lg text-base leading-relaxed text-white/65 sm:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.95 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#realisations"
              data-cursor="link"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
            >
              <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
                {hero.cta1}
              </span>
            </a>
            <a
              href="#contact"
              data-cursor="link"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/25 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-rouge"
            >
              <span className="absolute inset-0 -translate-y-full bg-rouge transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative z-10">{hero.cta2}</span>
            </a>
            <div className="hidden xl:block">
              <RotatingBadge />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bas de hero */}
      <div className="relative">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between px-5 pb-6 sm:px-8">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/45">
            <span className="relative block h-8 w-[18px] rounded-full border border-white/25">
              <span className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 animate-scroll-dot rounded-full bg-rouge" />
            </span>
            Scroll
          </div>
          <div className="xl:hidden">
            <RotatingBadge />
          </div>
          <div className="hidden text-right text-[10px] uppercase leading-relaxed tracking-[0.28em] text-white/45 md:block">
            {contact.city} · {contact.country}
            <br />
            Disponible worldwide
          </div>
        </div>

        <div className="border-y border-white/10 bg-ink/70 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-7 gap-y-2 px-5 py-5 sm:px-8">
            {skills.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="flex items-center gap-7 font-display text-lg uppercase tracking-wide text-white/80 sm:text-xl"
              >
                {s}
                {i < skills.length - 1 && (
                  <span aria-hidden className="text-sm text-rouge">
                    ✳
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
