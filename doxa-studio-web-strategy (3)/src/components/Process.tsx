import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useContent } from "../data/content";
import { cn } from "../utils/cn";
import { Reveal, SectionTag, SplitText } from "./ui";

function Steps() {
  const ref = useRef<HTMLDivElement>(null);
  const { process } = useContent();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative mt-16">
      {/* Ligne de progression */}
      <div className="absolute left-[22px] top-2 hidden h-[calc(100%-1rem)] w-px bg-white/10 md:block">
        <motion.div style={{ height }} className="w-full bg-rouge" />
      </div>

      <div className="flex flex-col gap-10">
        {process.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06}>
            <div className="group grid gap-5 md:grid-cols-[46px_1fr] md:gap-8">
              <div className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink font-display text-sm transition-colors duration-500 group-hover:border-rouge group-hover:bg-rouge">
                  {p.step}
                </span>
              </div>
              <div className="border-b border-white/10 pb-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-10">
                <h3 className="font-display text-3xl uppercase leading-none transition-colors duration-500 group-hover:text-rouge sm:text-4xl">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55 md:mt-0">
                  {p.text}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const { testimonials } = useContent();
  const [i, setI] = useState(0);
  const t = testimonials[Math.min(i, Math.max(0, testimonials.length - 1))];

  if (!t) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-2 p-8 sm:p-12">
      <div className="absolute -right-10 -top-14 font-display text-[180px] leading-none text-rouge/10">
        “
      </div>
      <motion.blockquote
        key={t.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <p className="font-display text-2xl uppercase leading-tight sm:text-3xl">{t.quote}</p>
        <footer className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <span className="text-rouge">{t.name}</span> — {t.role}
        </footer>
      </motion.blockquote>

      <div className="relative mt-8 flex items-center gap-3">
        {testimonials.map((_, idx) => (
          <button
            key={testimonials[idx].id}
            onClick={() => setI(idx)}
            data-cursor="link"
            aria-label={`Témoignage ${idx + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              idx === Math.min(i, testimonials.length - 1) ? "w-10 bg-rouge" : "w-4 bg-white/20 hover:bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function Process() {
  const { sections, delayBox } = useContent();
  return (
    <section id="methode" className="relative border-b border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionTag>La méthode</SectionTag>
            <h2 className="font-display text-[12vw] uppercase leading-[0.9] sm:text-[8vw] lg:text-[5vw]">
              <SplitText text={sections.processTitle1} />
              <br />
              <span className="text-rouge">
                <SplitText text={sections.processTitle2} delay={0.12} />
              </span>
            </h2>
            <Steps />
          </div>

          <div className="flex flex-col justify-between gap-10">
            <Reveal delay={0.15}>
              <Testimonials />
            </Reveal>

            <Reveal delay={0.2}>
              <div className="relative overflow-hidden rounded-2xl border border-rouge/40 bg-gradient-to-br from-rouge/20 to-transparent p-8">
                <p className="text-[11px] uppercase tracking-[0.24em] text-rouge">
                  {delayBox.label}
                </p>
                <p className="mt-4 font-display text-6xl leading-none">
                  {delayBox.value}
                  <span className="ml-2 text-2xl">{delayBox.suffix}</span>
                </p>
                <p className="mt-4 text-sm text-white/60">{delayBox.text}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
