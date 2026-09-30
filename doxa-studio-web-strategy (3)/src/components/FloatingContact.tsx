import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useContact } from "../data/content";

export default function FloatingContact() {
  const contact = useContact();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const actions = [
    {
      label: "WhatsApp",
      href: contact.whatsapp,
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1s-.7 1-.9 1.2c-.2.2-.3.2-.6.1a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-.9-2.2c-.3-.6-.5-.5-.7-.5H7.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2.6 1 3.1.8 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4l-.5-.1zM12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1113.6-2.4 8.2 8.2 0 01-6.4 6.3z" />
        </svg>
      ),
    },
    {
      label: contact.phones[0]?.display ?? "Téléphone",
      href: `tel:${contact.phones[0]?.tel ?? ""}`,
      external: false,
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.4c.9.3 1.8.5 2.8.6a2 2 0 011.7 2z" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:${contact.email}`,
      external: false,
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 7l10 6 10-6" />
        </svg>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 right-5 z-[115] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8"
        >
          <AnimatePresence>
            {open &&
              actions.map((a, i) => (
                <motion.a
                  key={a.label}
                  href={a.href}
                  target={a.external ? "_blank" : undefined}
                  rel={a.external ? "noreferrer" : undefined}
                  data-cursor="link"
                  initial={{ opacity: 0, x: 24, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 24, scale: 0.9 }}
                  transition={{ delay: i * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-center gap-3 rounded-full border border-white/15 bg-ink-2/90 py-2.5 pl-4 pr-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-xl transition-colors duration-300 hover:border-rouge hover:bg-rouge hover:text-white"
                >
                  {a.label}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-rouge">
                    {a.icon}
                  </span>
                </motion.a>
              ))}
          </AnimatePresence>

          <button
            onClick={() => setOpen((v) => !v)}
            data-cursor="link"
            aria-label="Nous contacter"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-rouge shadow-2xl shadow-rouge/30 transition-transform duration-400 hover:scale-105"
          >
            {!open && (
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-rouge/60" />
            )}
            <span className="relative">
              {open ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                  <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1s-.7 1-.9 1.2c-.2.2-.3.2-.6.1a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-.9-2.2c-.3-.6-.5-.5-.7-.5H7.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2.6 1 3.1.8 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4l-.5-.1zM12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2z" />
                </svg>
              )}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
