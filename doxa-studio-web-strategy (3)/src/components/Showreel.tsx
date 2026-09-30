import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useContent } from "../data/content";
import { Magnetic } from "./ui";
import VideoEmbed from "./VideoEmbed";

export default function Showreel() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { showreel } = useContent();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const textX = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  const marqueeItems = showreel.marquee
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <section
        ref={ref}
        className="grain relative h-[70vh] min-h-[460px] overflow-hidden border-b border-white/10"
      >
        <motion.div style={{ y }} className="absolute inset-x-0 -top-[12%] h-[124%]">
          {showreel.video ? (
            <VideoEmbed
              src={showreel.video}
              title={showreel.title}
              mode="background"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          ) : (
            <img
              src={showreel.poster}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/40 to-ink" />

        <motion.div
          style={{ x: textX }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="font-display whitespace-nowrap text-[18vw] uppercase leading-none text-stroke">
            {showreel.title}
          </span>
        </motion.div>

        <div className="relative flex h-full flex-col items-center justify-center gap-8 px-5 text-center">
          <Magnetic strength={0.45}>
            <button
              onClick={() => setOpen(true)}
              data-cursor="media"
              data-cursor-label="Play"
              className="group relative flex h-24 w-24 items-center justify-center rounded-full bg-rouge transition-transform duration-500 hover:scale-105 sm:h-28 sm:w-28"
            >
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-rouge/60" />
              <svg viewBox="0 0 24 24" className="relative ml-1 h-8 w-8 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </Magnetic>
          <p className="max-w-md text-sm uppercase tracking-[0.28em] text-white/60">
            {showreel.subtitle}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-ink/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-3.5">
            {marqueeItems.map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-6 text-[11px] uppercase tracking-[0.3em] text-white/45"
              >
                {item}
                {i < marqueeItems.length - 1 && (
                  <span aria-hidden className="text-rouge">
                    /
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/95 p-5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15"
              onClick={(e) => e.stopPropagation()}
            >
              <VideoEmbed
                src={showreel.video}
                title={showreel.title}
                mode="player"
                poster={showreel.poster}
                className="aspect-video w-full object-contain"
              />
            </motion.div>
            <button
              onClick={() => setOpen(false)}
              data-cursor="link"
              aria-label="Fermer"
              className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-rouge hover:bg-rouge"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
