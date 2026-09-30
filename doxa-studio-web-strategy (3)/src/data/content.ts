import { useSyncExternalStore } from "react";
import {
  CLIENTS,
  PROCESS,
  PROJECTS,
  SERVICES,
  STATS,
  TESTIMONIALS,
  type Project,
  type Service,
} from "./site";

/* ------------------------------------------------------------------ */
/* Modèle de contenu éditable de TOUT le site (CMS local)               */
/* ------------------------------------------------------------------ */
export type Hero = {
  badge: string;
  line1: string;
  line2: string;
  accent: string;
  subtitle: string;
  cta1: string;
  cta2: string;
  marquee: string;
  video: string;
  poster: string;
};

export type Sections = {
  servicesTitle1: string;
  servicesTitle2: string;
  servicesIntro: string;
  portfolioTitle1: string;
  portfolioTitle2: string;
  processTitle1: string;
  processTitle2: string;
  contactTitle1: string;
  contactTitle2: string;
};

export type ValueItem = { id: number; title: string; text: string };

export type About = {
  title1: string;
  title2: string;
  title3: string;
  p1: string;
  p2: string;
  statValue: string;
  statLabel: string;
  image: string;
  values: ValueItem[];
};

export type Founder = {
  photo: string;
  name: string;
  role: string;
  bio1: string;
  bio2: string;
  quote: string;
};

export type Showreel = {
  video: string;
  poster: string;
  title: string;
  subtitle: string;
  marquee: string;
};

export type ServiceItem = Service & { id: number };
export type ProjectItem = Project;
export type StepItem = { id: number; step: string; title: string; text: string };
export type TestimonialItem = {
  id: number;
  quote: string;
  name: string;
  role: string;
};
export type StatItem = {
  id: number;
  value: number;
  suffix: string;
  label: string;
};

export type DelayBox = {
  label: string;
  value: string;
  suffix: string;
  text: string;
};

export type ContactInfo = {
  intro: string;
  email: string;
  phones: { display: string; tel: string }[];
  whatsapp: string;
  city: string;
  country: string;
  location: string;
  hours: string;
};

export type FooterInfo = { desc: string };

export type Banner = {
  id: number;
  kind: "image" | "video";
  media: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  position: "top" | "middle" | "bottom";
};

export type SiteContent = {
  logo: string | null;
  hero: Hero;
  sections: Sections;
  about: About;
  founder: Founder;
  showreel: Showreel;
  services: ServiceItem[];
  projects: ProjectItem[];
  process: StepItem[];
  delayBox: DelayBox;
  testimonials: TestimonialItem[];
  stats: StatItem[];
  clients: string[];
  contact: ContactInfo;
  footer: FooterInfo;
  banners: Banner[];
};

/* ------------------------- Valeurs par défaut ---------------------- */
const DEFAULT_VALUES: ValueItem[] = [
  {
    id: 1,
    title: "Précision",
    text: "Chaque frame, chaque kerning, chaque niveau de gris est un choix assumé.",
  },
  {
    id: 2,
    title: "Vitesse",
    text: "Un studio agile : des allers-retours courts, des livraisons qui tiennent la date.",
  },
  {
    id: 3,
    title: "Impact",
    text: "On ne fabrique pas des jolies images, on fabrique des résultats mesurables.",
  },
];

export const DEFAULT_CONTENT: SiteContent = {
  logo: null,
  hero: {
    badge: "Studio ouvert — 3 slots en 2026",
    line1: "Donnez vie",
    line2: "à vos projets",
    accent: "visuels",
    subtitle:
      "Doxa Studio est une agence de communication et de production visuelle. Motion design, 3D, identité de marque et films : nous fabriquons des images qui font bouger vos audiences.",
    cta1: "Voir nos réalisations",
    cta2: "Discuter de votre projet",
    marquee:
      "Motion Design, 3D & SketchUp, Identité Visuelle, Production Vidéo, Campagnes 360°, Infographie",
    video:
      "https://videos.pexels.com/video-files/35698947/15129739_1920_1080_24fps.mp4",
    poster:
      "https://images.pexels.com/videos/35698947/abstract-abstract-animation-abstract-background-animation-35698947.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1920",
  },
  sections: {
    servicesTitle1: "Un studio,",
    servicesTitle2: "six terrains de jeu",
    servicesIntro:
      "De la stratégie au fichier final : une équipe pluridisciplinaire qui pense l'image comme un outil de performance, jamais comme une décoration.",
    portfolioTitle1: "Le travail",
    portfolioTitle2: "parle.",
    processTitle1: "Quatre temps,",
    processTitle2: "zéro flou.",
    contactTitle1: "Parlons de",
    contactTitle2: "votre image.",
  },
  about: {
    title1: "Créatifs par",
    title2: "conviction,",
    title3: "stratèges par méthode.",
    p1: "Doxa Studio est né d'une obsession : rendre visible ce qui vous rend unique. Nous réunissons directeurs artistiques, motion designers, modélisateurs 3D et réalisateurs autour d'une même table — et d'un même objectif : que votre marque reste dans la rétine.",
    p2: "Basés à Abidjan, en Côte d'Ivoire, nous accompagnons startups, institutions et grands comptes d'Afrique de l'Ouest sur l'ensemble de leur chaîne visuelle, du concept à la diffusion.",
    statValue: "9",
    statLabel: "années à fabriquer des images qui comptent",
    image:
      "https://images.pexels.com/photos/30396798/pexels-photo-30396798.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1100",
    values: DEFAULT_VALUES,
  },
  founder: {
    photo: "",
    name: "Le Fondateur",
    role: "Fondateur & Directeur de création",
    bio1: "Derrière Doxa Studio, il y a une conviction simple : une image bien pensée change la trajectoire d'une marque. J'ai fondé le studio à Abidjan pour offrir aux entreprises d'ici et d'ailleurs le même niveau d'exigence visuelle que les plus grandes agences.",
    bio2: "Motion design, 3D, identité, film : je dirige personnellement chaque production, du premier brief à la livraison finale. Quand vous travaillez avec Doxa, vous travaillez directement avec moi.",
    quote: "On ne fabrique pas des jolies images, on fabrique des résultats.",
  },
  showreel: {
    video:
      "https://videos.pexels.com/video-files/28825871/12487101_1920_1080_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/28825871/art-code-motion-technology-28825871.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1920",
    title: "Showreel 2026",
    subtitle:
      "2 minutes pour comprendre ce que Doxa peut faire de votre marque",
    marquee:
      "Direction artistique, Réalisation, Animation 3D, Étalonnage, Sound design",
  },
  services: SERVICES.map((s, i) => ({ ...s, id: i + 1 })),
  projects: PROJECTS.map((p) => ({ ...p })),
  process: PROCESS.map((p, i) => ({ ...p, id: i + 1 })),
  delayBox: {
    label: "Délai moyen de production",
    value: "10–21",
    suffix: "jours",
    text: "Du brief validé à la livraison des masters, selon le format et le volume. Urgences et formats express : parlons-en.",
  },
  testimonials: TESTIMONIALS.map((t, i) => ({ ...t, id: i + 1 })),
  stats: STATS.map((s, i) => ({ ...s, id: i + 1 })),
  clients: [...CLIENTS],
  contact: {
    intro:
      "Un brief, une idée floue, un deadline serré ? Écrivez-nous : nous répondons sous 24 h ouvrées avec une première piste et une estimation honnête.",
    email: "gondodanjaures@gmail.com",
    phones: [
      { display: "+225 07 47 27 68 79", tel: "+2250747276879" },
      { display: "+225 01 02 47 03 06", tel: "+2250102470306" },
    ],
    whatsapp: "https://wa.me/2250747276879",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    location: "Abidjan, Côte d'Ivoire",
    hours: "Lun – Sam · 08h00 → 19h00",
  },
  footer: {
    desc: "Agence de communication et de production visuelle. Nous concevons des identités, des films et des animations qui donnent une longueur d'avance à nos clients.",
  },
  banners: [
    {
      id: 1,
      kind: "image",
      media:
        "https://images.pexels.com/photos/29237420/pexels-photo-29237420.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1080&w=1920",
      title: "Un projet en tête ?",
      subtitle:
        "Nos créateurs étudient chaque demande sous 24 h : estimation claire, deadline tenue, résultat à la hauteur.",
      cta: "Démarrer un projet",
      ctaLink: "#contact",
      position: "top",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Store réactif (localStorage) — v2 avec migration depuis la v1        */
/* ------------------------------------------------------------------ */
const KEY = "doxa.content.v2";
const OLD_KEY = "doxa.content.v1";
const VIMEO_PROJECT_MIGRATION = "doxa.migration.vimeo-project-679140957.v2";

function load(): SiteContent {
  const fresh = (): SiteContent => structuredClone(DEFAULT_CONTENT);
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<SiteContent>;
      const d = DEFAULT_CONTENT;
      return {
        ...d,
        ...p,
        hero: { ...d.hero, ...(p.hero ?? {}) },
        sections: { ...d.sections, ...(p.sections ?? {}) },
        about: {
          ...d.about,
          ...(p.about ?? {}),
          values: Array.isArray(p.about?.values)
            ? (p.about.values as ValueItem[])
            : d.about.values,
        },
        founder: { ...d.founder, ...(p.founder ?? {}) },
        showreel: { ...d.showreel, ...(p.showreel ?? {}) },
        delayBox: { ...d.delayBox, ...(p.delayBox ?? {}) },
        services: Array.isArray(p.services) ? p.services : d.services,
        projects: Array.isArray(p.projects) ? p.projects : d.projects,
        process: Array.isArray(p.process) ? p.process : d.process,
        testimonials: Array.isArray(p.testimonials)
          ? p.testimonials
          : d.testimonials,
        stats: Array.isArray(p.stats) ? p.stats : d.stats,
        clients: Array.isArray(p.clients) ? p.clients : d.clients,
        contact: { ...d.contact, ...(p.contact ?? {}) },
        footer: { ...d.footer, ...(p.footer ?? {}) },
        banners: Array.isArray(p.banners) ? (p.banners as Banner[]) : [],
      };
    }
    /* Migration v1 → v2 : on conserve textes, logo, contact, bannières */
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const p = JSON.parse(old) as Partial<SiteContent>;
      const d = fresh();
      const merged: SiteContent = {
        ...d,
        logo: (p.logo ?? null) as string | null,
        hero: { ...d.hero, ...(p.hero ?? {}) },
        sections: { ...d.sections, ...(p.sections ?? {}) },
        about: { ...d.about, ...(p.about ?? {}) },
        contact: { ...d.contact, ...(p.contact ?? {}) },
        footer: { ...d.footer, ...(p.footer ?? {}) },
        banners: Array.isArray(p.banners) ? (p.banners as Banner[]) : [],
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(merged));
        localStorage.removeItem(OLD_KEY);
      } catch {
        /* stockage indisponible : on garde la mémoire */
      }
      return merged;
    }
    return fresh();
  } catch {
    return fresh();
  }
}

let cache: SiteContent = load();
const listeners = new Set<() => void>();

function persist(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* quota local dépassé : le contenu reste en mémoire */
    listeners.forEach((l) => l());
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

export function getContent(): SiteContent {
  return cache;
}

function merge<K extends keyof SiteContent>(
  key: K,
  patch: Partial<SiteContent[K]>,
) {
  cache = {
    ...cache,
    [key]: { ...(cache[key] as object), ...patch },
  } as SiteContent;
  persist();
}

export function setHero(patch: Partial<Hero>) {
  merge("hero", patch);
}
export function setSections(patch: Partial<Sections>) {
  merge("sections", patch);
}
export function setAbout(patch: Partial<About>) {
  merge("about", patch);
}
export function setFounder(patch: Partial<Founder>) {
  merge("founder", patch);
}
export function setShowreel(patch: Partial<Showreel>) {
  merge("showreel", patch);
}
export function setDelayBox(patch: Partial<DelayBox>) {
  merge("delayBox", patch);
}
export function setContact(patch: Partial<ContactInfo>) {
  merge("contact", patch);
}
export function setFooter(patch: Partial<FooterInfo>) {
  merge("footer", patch);
}

export function setLogo(dataUrl: string | null) {
  cache = { ...cache, logo: dataUrl };
  persist();
}

/* ------------------------- Collections génériques ------------------ */
type CollKey = "services" | "projects" | "process" | "testimonials" | "stats";

type WithId = { id: number };

function getList(key: CollKey): WithId[] {
  return (cache as unknown as Record<CollKey, WithId[]>)[key] ?? [];
}

function setList(key: CollKey, list: WithId[]) {
  cache = { ...cache, [key]: list } as SiteContent;
  persist();
}

function updateIn(key: CollKey, id: number, patch: Record<string, unknown>) {
  setList(
    key,
    getList(key).map((it) => (it.id === id ? { ...it, ...patch } : it)),
  );
}

function addTo(key: CollKey, item: WithId) {
  setList(key, [item, ...getList(key)]);
}

function removeFrom(key: CollKey, id: number) {
  setList(
    key,
    getList(key).filter((it) => it.id !== id),
  );
}

function moveIn(key: CollKey, id: number, dir: 1 | -1) {
  const list = [...getList(key)];
  const i = list.findIndex((it) => it.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  setList(key, list);
}

/* Services */
export const updateService = (id: number, p: Partial<ServiceItem>) =>
  updateIn("services", id, p);
export const addService = (s: ServiceItem) => addTo("services", s);
export const removeService = (id: number) => removeFrom("services", id);
export const moveService = (id: number, d: 1 | -1) => moveIn("services", id, d);
export function resetServices() {
  cache = {
    ...cache,
    services: structuredClone(DEFAULT_CONTENT.services),
  };
  persist();
}

/* Projets de base (vitrine) */
export const updateProjectItem = (id: number, p: Partial<ProjectItem>) =>
  updateIn("projects", id, p);
export const addProjectItem = (p: ProjectItem) => addTo("projects", p);
export const removeProjectItem = (id: number) => removeFrom("projects", id);
export const moveProjectItem = (id: number, d: 1 | -1) =>
  moveIn("projects", id, d);
export function resetProjects() {
  cache = {
    ...cache,
    projects: structuredClone(DEFAULT_CONTENT.projects),
  };
  persist();
}

/* Étapes de la méthode */
export const updateStep = (id: number, p: Partial<StepItem>) =>
  updateIn("process", id, p);
export const addStep = (s: StepItem) => {
  const list = cache.process;
  cache = { ...cache, process: [...list, s] };
  persist();
};
export const removeStep = (id: number) => removeFrom("process", id);
export const moveStep = (id: number, d: 1 | -1) => moveIn("process", id, d);

/* Témoignages */
export const updateTestimonial = (id: number, p: Partial<TestimonialItem>) =>
  updateIn("testimonials", id, p);
export const addTestimonial = (t: TestimonialItem) =>
  addTo("testimonials", t);
export const removeTestimonial = (id: number) =>
  removeFrom("testimonials", id);
export const moveTestimonial = (id: number, d: 1 | -1) =>
  moveIn("testimonials", id, d);

/* Chiffres */
export const updateStat = (id: number, p: Partial<StatItem>) =>
  updateIn("stats", id, p);
export const addStat = (s: StatItem) => addTo("stats", s);
export const removeStat = (id: number) => removeFrom("stats", id);
export const moveStat = (id: number, d: 1 | -1) => moveIn("stats", id, d);

/* Valeurs de l'agence (imbriquées dans « about ») */
export function updateValue(id: number, p: Partial<ValueItem>) {
  cache = {
    ...cache,
    about: {
      ...cache.about,
      values: cache.about.values.map((v) =>
        v.id === id ? { ...v, ...p } : v,
      ),
    },
  };
  persist();
}
export const addValue = (v: ValueItem) => {
  const list = cache.about.values;
  cache = { ...cache, about: { ...cache.about, values: [...list, v] } };
  persist();
};
export const removeValue = (id: number) => {
  cache = {
    ...cache,
    about: { ...cache.about, values: cache.about.values.filter((v) => v.id !== id) },
  };
  persist();
};

/* Clients (marquee) */
export function setClients(clients: string[]) {
  cache = { ...cache, clients };
  persist();
}

/* Bannières */
/** Ajoute une bannière. Renvoie false si le stockage local est saturé. */
export function addBanner(data: Omit<Banner, "id">): boolean {
  const item: Banner = { ...data, id: Date.now() };
  cache = { ...cache, banners: [item, ...cache.banners] };
  return persist();
}

export function removeBanner(id: number) {
  cache = { ...cache, banners: cache.banners.filter((b) => b.id !== id) };
  persist();
}

/* ------------------------- Sauvegarde / reset ----------------------- */
export function resetContent() {
  cache = structuredClone(DEFAULT_CONTENT);
  persist();
}

export function exportJSON(): string {
  return JSON.stringify(cache, null, 2);
}

export function importJSON(json: string): boolean {
  try {
    const p = JSON.parse(json) as Partial<SiteContent>;
    if (!p || typeof p !== "object" || !p.hero) return false;
    const d = DEFAULT_CONTENT;
    cache = {
      ...d,
      ...p,
      hero: { ...d.hero, ...(p.hero ?? {}) },
      sections: { ...d.sections, ...(p.sections ?? {}) },
      about: { ...d.about, ...(p.about ?? {}) },
      founder: { ...d.founder, ...(p.founder ?? {}) },
      showreel: { ...d.showreel, ...(p.showreel ?? {}) },
      delayBox: { ...d.delayBox, ...(p.delayBox ?? {}) },
      contact: { ...d.contact, ...(p.contact ?? {}) },
      footer: { ...d.footer, ...(p.footer ?? {}) },
    } as SiteContent;
    persist();
    return true;
  } catch {
    return false;
  }
}

/**
 * Ajoute la réalisation Vimeo fournie par le studio une seule fois aux
 * installations déjà personnalisées. N'annule pas une suppression manuelle
 * effectuée dans l'admin après la migration.
 */
export function ensureVimeoProjectSeed(): boolean {
  const seed = PROJECTS.find((p) => p.id === 679140957);
  if (!seed) return false;
  try {
    if (localStorage.getItem(VIMEO_PROJECT_MIGRATION) === "1") return false;
  } catch {
    /* le site continue sans marqueur */
  }

  const existingIndex = cache.projects.findIndex(
    (p) => p.id === seed.id || p.video?.includes("679140957"),
  );
  if (existingIndex >= 0) {
    const existing = cache.projects[existingIndex];
    // Upgrade the earlier low-resolution Vimeo thumbnail without overwriting
    // a custom poster or title that an admin may already have selected.
    const legacyPoster =
      existing.image.includes("1376245639-") && existing.image.includes("d_295x166");
    const legacyTitle = existing.title.trim().toLowerCase() === "generique jvc 3";
    if (legacyPoster || legacyTitle) {
      cache = {
        ...cache,
        projects: cache.projects.map((p, i) =>
          i === existingIndex
            ? {
                ...p,
                ...(legacyPoster ? { image: seed.image } : {}),
                ...(legacyTitle ? { title: seed.title } : {}),
              }
            : p,
        ),
      };
      const saved = persist();
      if (!saved) return false;
    }
    try {
      localStorage.setItem(VIMEO_PROJECT_MIGRATION, "1");
    } catch {
      /* ignore */
    }
    return false;
  }

  cache = { ...cache, projects: [...cache.projects, seed] };
  const saved = persist();
  if (saved) {
    try {
      localStorage.setItem(VIMEO_PROJECT_MIGRATION, "1");
    } catch {
      /* ignore */
    }
  }
  return saved;
}

export function subscribeContent(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/* ------------------------------------------------------------------ */
/* Hooks                                                                */
/* ------------------------------------------------------------------ */
export function useContent(): SiteContent {
  return useSyncExternalStore(subscribeContent, getContent);
}

export function useContact(): ContactInfo {
  return useContent().contact;
}
