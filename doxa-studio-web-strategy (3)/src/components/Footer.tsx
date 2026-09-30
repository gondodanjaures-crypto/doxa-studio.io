import { useContent } from "../data/content";
import { Logo } from "./Navbar";
import { Reveal } from "./ui";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Behance", href: "https://behance.net" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export default function Footer() {
  const { contact, footer } = useContent();
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink-2">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-5 py-8 text-center sm:px-8 lg:flex-row lg:text-left">
          <p className="font-display text-2xl uppercase tracking-wide text-white/85 sm:text-3xl">
            Donnons vie à vos <span className="text-rouge">projets visuels</span>
          </p>
          <a
            href="#contact"
            data-cursor="link"
            className="group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full bg-rouge px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
              Démarrer un projet
            </span>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/50">
              {footer.desc}
            </p>
            <div className="mt-7 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="link"
                  className="rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/60 transition-all duration-300 hover:border-rouge hover:bg-rouge hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/35">Navigation</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ["Accueil", "#accueil"],
                ["Expertises", "#expertises"],
                ["Réalisations", "#realisations"],
                ["Agence", "#agence"],
                ["Méthode", "#methode"],
                ["Contact", "#contact"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a
                    href={h}
                    data-cursor="link"
                    className="link-underline text-white/60 transition-colors hover:text-white"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/35">Studio</p>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  data-cursor="link"
                  className="link-underline break-all"
                >
                  {contact.email}
                </a>
              </li>
              {contact.phones.map((p) => (
                <li key={p.tel}>
                  <a href={`tel:${p.tel}`} data-cursor="link" className="link-underline">
                    {p.display}
                  </a>
                </li>
              ))}
              <li className="pt-2 text-white/40">
                {contact.city}
                <br />
                {contact.country}
              </li>
              <li className="text-white/40">{contact.hours}</li>
            </ul>
          </div>
        </div>

        {/* Grand logotype */}
        <Reveal delay={0.1}>
          <div className="mt-16 select-none">
            <h2 className="font-display text-center text-[19vw] uppercase leading-[0.8] text-stroke transition-colors duration-700 hover:text-rouge/90">
              Doxa Studio
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-[11px] text-white/35 sm:flex-row">
          <p>© {new Date().getFullYear()} Doxa Studio. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <a href="#" data-cursor="link" className="hover:text-white">
              Mentions légales
            </a>
            <a href="#" data-cursor="link" className="hover:text-white">
              Confidentialité
            </a>
            <a
              href="#accueil"
              data-cursor="link"
              className="group inline-flex items-center gap-2 text-white/60 hover:text-rouge"
            >
              Haut de page
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-rouge">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
