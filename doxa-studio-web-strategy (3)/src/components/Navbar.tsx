import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useContact } from "../data/content";
import BrandMark from "./BrandLogo";
import { cn } from "../utils/cn";

const LINKS = [
  { label: "Accueil", href: "#accueil" },
  { label: "Expertises", href: "#expertises" },
  { label: "Réalisations", href: "#realisations" },
  { label: "Agence", href: "#agence" },
  { label: "Fondateur", href: "#fondateur" },
  { label: "Méthode", href: "#methode" },
  { label: "Contact", href: "#contact" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#accueil"
      data-cursor="link"
      className={cn("group flex items-center gap-3", className)}
    >
      <span className="flex h-10 w-10 items-center justify-center">
        <BrandMark className="h-10 w-10 text-white object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-180" />
      </span>
      <span className="font-display text-lg uppercase leading-none tracking-[0.08em] text-white">
        Doxa<span className="text-rouge"> Studio</span>
      </span>
    </a>
  );
}

export default function Navbar({ onStudio }: { onStudio: () => void }) {
  const contact = useContact();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#accueil");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const pos = window.scrollY + window.innerHeight * 0.35;
      for (const l of LINKS) {
        const el = document.querySelector(l.href) as HTMLElement | null;
        if (el && el.offsetTop <= pos && el.offsetTop + el.offsetHeight > pos) {
          setActive(l.href);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[110] transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-ink/80 py-3 backdrop-blur-xl"
            : "border-b border-transparent py-6",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-cursor="link"
                className={cn(
                  "link-underline text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                  active === l.href ? "text-white" : "text-white/55 hover:text-white",
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onStudio}
              data-cursor="link"
              className="hidden items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors duration-300 hover:border-rouge hover:text-white lg:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rouge" />
              Espace Studio
            </button>
            <a
              href="#contact"
              data-cursor="link"
              className="group relative hidden overflow-hidden rounded-full bg-rouge px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white sm:inline-flex"
            >
              <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
                Démarrer un projet
              </span>
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              data-cursor="link"
              aria-label="Menu"
              className="flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-full border border-white/20 transition-colors hover:border-rouge lg:hidden"
            >
              <span
                className={cn(
                  "h-[2px] w-5 bg-white transition-all duration-300",
                  open && "translate-y-[8px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-[2px] w-5 bg-white transition-all duration-300",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-[2px] w-5 bg-white transition-all duration-300",
                  open && "-translate-y-[8px] -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[105] flex flex-col justify-center bg-ink px-6 lg:hidden"
          >
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
            <nav className="relative flex flex-col gap-2">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-baseline gap-4 border-b border-white/10 py-4"
                >
                  <span className="font-display text-xs text-rouge">0{i + 1}</span>
                  <span className="font-display text-4xl uppercase text-white transition-colors group-hover:text-rouge">
                    {l.label}
                  </span>
                </motion.a>
              ))}

              <motion.button
                onClick={() => {
                  setOpen(false);
                  onStudio();
                }}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.15 + LINKS.length * 0.06,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex items-baseline gap-4 border-b border-white/10 py-4 text-left"
              >
                <span className="font-display text-xs text-rouge">
                  0{LINKS.length + 1}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-display text-4xl uppercase text-white transition-colors group-hover:text-rouge">
                    Espace Studio
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rouge">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19V5M6 11l6-6 6 6" />
                    </svg>
                  </span>
                </span>
              </motion.button>
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative mt-10 space-y-1.5 text-sm text-white/50"
            >
              <a href={`mailto:${contact.email}`} className="block break-all hover:text-rouge">
                {contact.email}
              </a>
              {contact.phones.map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className="block hover:text-rouge">
                  {p.display}
                </a>
              ))}
              <p className="pt-2 text-[11px] uppercase tracking-[0.24em] text-white/35">
                {contact.location}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
