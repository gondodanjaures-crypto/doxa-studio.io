import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useContent } from "../data/content";
import { Counter, Reveal, SectionTag, SplitText } from "./ui";

export default function About() {
  const { about, stats, clients } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "10%"]);

  return (
    <section id="agence" className="relative border-b border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Visuel */}
          <div ref={ref} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10">
              <motion.img
                style={{ y }}
                src={about.image}
                alt="L'équipe Doxa Studio en tournage"
                loading="lazy"
                className="absolute inset-0 h-[118%] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            </div>

            <Reveal
              delay={0.15}
              className="absolute -bottom-8 -right-3 w-52 sm:-right-8 sm:w-64"
            >
              <div className="rounded-2xl border border-white/10 bg-rouge p-6 shadow-2xl shadow-rouge/20">
                <p className="font-display text-5xl leading-none">{about.statValue}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/85">
                  {about.statLabel}
                </p>
              </div>
            </Reveal>

            <div className="absolute -left-6 top-10 hidden -rotate-90 text-[10px] uppercase tracking-[0.4em] text-white/35 lg:block">
              Doxa — Studio de création
            </div>
          </div>

          {/* Texte */}
          <div className="flex flex-col justify-center">
            <SectionTag>L'agence</SectionTag>
            <h2 className="font-display text-[11vw] uppercase leading-[0.9] sm:text-[7vw] lg:text-[4.4vw]">
              <SplitText text={about.title1} />
              <br />
              <span className="text-rouge">
                <SplitText text={about.title2} delay={0.1} />
              </span>{" "}
              <span className="text-stroke">
                <SplitText text={about.title3} delay={0.18} />
              </span>
            </h2>

            <Reveal delay={0.2}>
              <p className="mt-8 text-white/65">{about.p1}</p>
              <p className="mt-4 text-white/65">{about.p2}</p>
            </Reveal>

            <div className="mt-10 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-3">
              {about.values.map((v, i) => (
                <Reveal key={v.id} delay={0.1 + i * 0.08}>
                  <div className="group h-full bg-ink p-5 transition-colors duration-500 hover:bg-ink-3">
                    <span className="block h-[2px] w-8 bg-rouge transition-all duration-500 group-hover:w-16" />
                    <h3 className="mt-4 font-display text-lg uppercase">{v.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/50">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Chiffres */}
        <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.07}>
              <div className="group relative h-full overflow-hidden bg-ink px-6 py-10 text-center">
                <span className="absolute inset-x-0 bottom-0 h-0 bg-rouge transition-all duration-500 group-hover:h-full" />
                <p className="relative font-display text-5xl leading-none sm:text-6xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="relative mt-3 text-[10.5px] uppercase tracking-[0.22em] text-white/50 transition-colors duration-500 group-hover:text-white">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Clients — mur statique */}
      {clients.length > 0 && (
        <div className="mx-auto mt-20 max-w-[1400px] px-5 sm:px-8">
          <Reveal className="mb-8 flex items-center gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
              Ils nous font confiance
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-4">
            {clients.map((c, i) => (
              <Reveal key={`${c}-${i}`} delay={(i % 4) * 0.06} y={18}>
                <div className="group flex h-full min-h-[92px] items-center justify-center bg-ink px-4 py-6 text-center transition-colors duration-500 hover:bg-rouge">
                  <span className="font-display text-lg uppercase tracking-wide text-white/40 transition-colors duration-500 group-hover:text-white sm:text-xl">
                    {c}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
