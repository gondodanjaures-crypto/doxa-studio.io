import { motion } from "motion/react";
import { useContent, type Banner } from "../data/content";
import VideoEmbed from "./VideoEmbed";
import { Reveal } from "./ui";

/**
 * Rend les bannières (image ou vidéo) ajoutées depuis l'administration,
 * à l'emplacement choisi : top / middle / bottom.
 */
export default function DynamicBanners({
  position,
}: {
  position: Banner["position"];
}) {
  const { banners } = useContent();
  const list = banners.filter((b) => b.position === position);
  if (list.length === 0) return null;

  return (
    <>
      {list.map((b) => (
        <section
          key={b.id}
          className="grain relative overflow-hidden border-b border-white/10"
        >
          <div className="absolute inset-0">
            {b.kind === "video" ? (
              <VideoEmbed
                src={b.media}
                title={b.title}
                mode="background"
                className="h-full w-full object-cover opacity-60"
              />
            ) : (
              <motion.img
                src={b.media}
                alt={b.title}
                className="h-full w-full object-cover opacity-60"
                initial={{ scale: 1.18 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 14, ease: "easeOut" }}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />

          <div className="relative mx-auto flex min-h-[52vh] max-w-[1400px] flex-col items-start justify-center px-5 py-24 sm:px-8">
            <Reveal>
              <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-rouge">
                <span className="h-px w-10 bg-rouge" />
                {b.kind === "video" ? "En vidéo" : "Annonce"}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="max-w-[14ch] font-display text-[11vw] uppercase leading-[0.9] sm:text-[6vw]">
                {b.title}
              </h3>
            </Reveal>
            {b.subtitle && (
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-xl text-white/65">{b.subtitle}</p>
              </Reveal>
            )}
            {b.cta && (
              <Reveal delay={0.22}>
                <a
                  href={b.ctaLink || "#contact"}
                  data-cursor="link"
                  className="group relative mt-9 inline-flex items-center gap-3 overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
                >
                  <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
                    {b.cta}
                  </span>
                </a>
              </Reveal>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
