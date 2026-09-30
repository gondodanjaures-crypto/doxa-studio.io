import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  setThemeMode,
  THEME_LABELS,
  useResolvedTheme,
  useThemeMode,
  type ThemeMode,
} from "../data/theme";
import { cn } from "../utils/cn";

const ORDER: ThemeMode[] = ["auto", "day", "night"];

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
    </svg>
  );
}

function AutoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 000 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Petit bouton flottant : bascule le site en blanc ou en noir.
 * Mode « Automatique » : noir la nuit (19h → 6h30), blanc le jour.
 */
export default function ThemeToggle() {
  const mode = useThemeMode();
  const resolved = useResolvedTheme();
  const [open, setOpen] = useState(false);
  const isDark = resolved === "dark";

  const cycle = () => {
    const i = ORDER.indexOf(mode);
    setThemeMode(ORDER[(i + 1) % ORDER.length]);
  };

  return (
    <div className="fixed bottom-5 left-5 z-[130] sm:bottom-8 sm:left-8">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 overflow-hidden rounded-2xl border border-white/12 bg-ink-2/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <p className="border-b border-white/10 px-4 py-2.5 text-[9px] uppercase tracking-[0.24em] text-white/40">
              Apparence
            </p>
            {ORDER.map((m) => (
              <button
                key={m}
                onClick={() => setThemeMode(m)}
                data-cursor="link"
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-300",
                  mode === m ? "bg-rouge/15" : "hover:bg-white/5",
                )}
              >
                <span className={cn("shrink-0", mode === m ? "text-rouge" : "text-white/45")}>
                  {m === "auto" ? <AutoIcon className="h-4 w-4" /> : m === "day" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-[12px] font-semibold", mode === m ? "text-rouge" : "text-white/80")}>
                    {THEME_LABELS[m].title}
                  </span>
                  <span className="block text-[10px] text-white/35">{THEME_LABELS[m].hint}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group relative flex items-center gap-1 rounded-full border border-white/15 bg-ink-2/90 p-1.5 pr-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 group-hover:border-rouge">
        <button
          onClick={cycle}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          data-cursor="link"
          aria-label={`Basculer le thème — actuel : ${THEME_LABELS[mode].title}`}
          title={`${THEME_LABELS[mode].title} — ${THEME_LABELS[mode].hint}`}
          className="flex items-center gap-2.5 rounded-full py-1.5 pl-1 pr-1 transition-colors duration-300 sm:pr-2"
        >
          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "moon" : "sun"}
                initial={{ y: 18, opacity: 0, rotate: -40 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -18, opacity: 0, rotate: 40 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="absolute text-rouge"
              >
                {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors group-hover:text-white sm:block">
            {mode === "auto" ? "Auto" : isDark ? "Nuit" : "Jour"}
          </span>
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          aria-label="Choisir un mode d'apparence"
          aria-expanded={open}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors duration-300 hover:bg-white/10 hover:text-rouge"
        >
          <svg
            viewBox="0 0 24 24"
            className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
