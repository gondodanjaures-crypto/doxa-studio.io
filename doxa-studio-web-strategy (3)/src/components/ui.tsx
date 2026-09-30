import { motion, useInView, useScroll, useSpring } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/* Reveal : apparition au défilement (fade + translation)              */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* SplitText : révélation mot par mot façon générique cinéma            */
/* ------------------------------------------------------------------ */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.07,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="overflow-hidden pb-[0.06em] pr-[0.26em]">
          <motion.span
            className={cn("inline-block will-change-transform", wordClassName)}
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.9,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic : élément attiré par le curseur                             */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate3d(0,0,0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("inline-block transition-transform duration-500 ease-out", className)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bouton principal rouge / fantôme                                     */
/* ------------------------------------------------------------------ */
export function ActionButton({
  children,
  href,
  variant = "solid",
  className,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300";
  const styles =
    variant === "solid"
      ? "bg-rouge text-white"
      : "border border-white/25 text-white hover:border-rouge";

  const inner = (
    <>
      <span
        className={cn(
          "absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0",
          variant === "ghost" && "bg-rouge",
        )}
      />
      <span
        className={cn(
          "relative z-10 transition-colors duration-300",
          variant === "solid" ? "group-hover:text-ink" : "group-hover:text-white",
        )}
      >
        {children}
      </span>
      <svg
        className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </>
  );

  if (href) {
    return (
      <a href={href} data-cursor="link" className={cn(base, styles, className)}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} data-cursor="link" className={cn(base, styles, className)}>
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Étiquette de section                                                 */
/* ------------------------------------------------------------------ */
export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-rouge" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rouge" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">
        {children}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau défilant                                                     */
/* ------------------------------------------------------------------ */
export function Marquee({
  items,
  className,
  reverse = false,
  separator = "✳",
  duration = 32,
}: {
  items: string[];
  className?: string;
  reverse?: boolean;
  separator?: string;
  duration?: number;
}) {
  const row = [...items, ...items];
  return (
    <div className={cn("flex overflow-hidden", className)}>
      <div
        className="flex w-max shrink-0 items-center gap-8 pr-8"
        style={
          {
            animation: `${reverse ? "marquee-rev" : "marquee"} ${duration}s linear infinite`,
          } as CSSProperties
        }
      >
        {row.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8 whitespace-nowrap">
            {item}
            <span className="text-rouge">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compteur animé                                                       */
/* ------------------------------------------------------------------ */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Barre de progression de lecture                                      */
/* ------------------------------------------------------------------ */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[120] h-[3px] w-full origin-left bg-rouge"
    />
  );
}
