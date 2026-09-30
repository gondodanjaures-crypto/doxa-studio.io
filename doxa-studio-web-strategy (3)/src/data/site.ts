/* Les coordonnées sont désormais éditables depuis l'administration
   (voir src/data/content.ts — champ « Coordonnées »). */

export type Project = {
  id: number;
  title: string;
  client: string;
  category: string;
  year: string;
  image: string;
  video?: string;
  tags: string[];
  size: "wide" | "tall" | "std";
};

export const CATEGORIES = [
  "Tout",
  "Motion Design",
  "3D & Architecture",
  "Identité Visuelle",
  "Production Vidéo",
] as const;

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Pulse Générique",
    client: "Radio Lagune FM",
    category: "Motion Design",
    year: "2025",
    image:
      "https://images.pexels.com/photos/29450016/pexels-photo-29450016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    video: "https://videos.pexels.com/video-files/35698947/15129739_1920_1080_24fps.mp4",
    tags: ["After Effects", "Sound Design", "Branding TV"],
    size: "wide",
  },
  {
    id: 2,
    title: "Skyline Résidence",
    client: "Groupe Bâtir+",
    category: "3D & Architecture",
    year: "2025",
    image:
      "https://images.pexels.com/photos/16911118/pexels-photo-16911118.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
    tags: ["SketchUp", "Lumion", "Visite virtuelle"],
    size: "tall",
  },
  {
    id: 3,
    title: "Rebrand Écarlate",
    client: "Maison Adjoua",
    category: "Identité Visuelle",
    year: "2024",
    image:
      "https://images.pexels.com/photos/12883028/pexels-photo-12883028.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    tags: ["Logotype", "Charte", "Print"],
    size: "std",
  },
  {
    id: 4,
    title: "Backstage 04",
    client: "Festival Abidjan Live",
    category: "Production Vidéo",
    year: "2025",
    image:
      "https://images.pexels.com/photos/23384400/pexels-photo-23384400.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    video: "https://videos.pexels.com/video-files/8089118/8089118-uhd_4096_2160_25fps.mp4",
    tags: ["Réalisation", "Étalonnage", "Reels"],
    size: "std",
  },
  {
    id: 5,
    title: "Loop Néon",
    client: "Orange Digital",
    category: "Motion Design",
    year: "2024",
    image:
      "https://images.pexels.com/photos/29237420/pexels-photo-29237420.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    video: "https://videos.pexels.com/video-files/28825871/12487101_1920_1080_25fps.mp4",
    tags: ["3D Loop", "Cinema 4D", "Social Ads"],
    size: "std",
  },
  {
    id: 6,
    title: "Volumes Bruts",
    client: "Atelier Concrete",
    category: "3D & Architecture",
    year: "2024",
    image:
      "https://images.pexels.com/photos/29546665/pexels-photo-29546665.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    tags: ["Modélisation", "Rendu PBR", "Direction art."],
    size: "wide",
  },
  {
    id: 7,
    title: "Silence Studio",
    client: "Label Tempo",
    category: "Production Vidéo",
    year: "2023",
    image:
      "https://images.pexels.com/photos/30396798/pexels-photo-30396798.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
    video: "https://videos.pexels.com/video-files/8089223/8089223-uhd_4096_2160_25fps.mp4",
    tags: ["Clip", "Lumière", "Post-prod"],
    size: "tall",
  },
  {
    id: 8,
    title: "Signal Intérieur",
    client: "Plateau Coworking",
    category: "Identité Visuelle",
    year: "2025",
    image:
      "https://images.pexels.com/photos/30001009/pexels-photo-30001009.png?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    tags: ["Signalétique", "Wayfinding", "Mockups"],
    size: "std",
  },
  {
    id: 9,
    title: "Gradient Wave",
    client: "Abidjan Tech Summit",
    category: "Motion Design",
    year: "2023",
    image:
      "https://images.pexels.com/photos/29579758/pexels-photo-29579758.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
    video: "https://videos.pexels.com/video-files/35370260/14986403_1920_1080_24fps.mp4",
    tags: ["Habillage scène", "LED Wall", "Boucle"],
    size: "std",
  },
  {
    id: 679140957,
    title: "Générique JVC 3",
    client: "JVC",
    category: "Motion Design",
    year: "2022",
    image:
      "https://i.vimeocdn.com/video/1376245639-93327d21d488bb3c33583e864979df5502495ec4c033618905ad55f7d2dc50d6-d_1280?region=us",
    video: "https://vimeo.com/679140957",
    tags: ["Générique", "Motion Design", "Vimeo"],
    size: "wide",
  },
];

export type Service = {
  num: string;
  title: string;
  desc: string;
  items: string[];
  icon: string;
};

export const SERVICES: Service[] = [
  {
    num: "01",
    title: "Motion Design",
    desc: "Des animations qui racontent. Génériques, habillages TV, explainers et boucles social media pensés au frame près.",
    items: ["Habillage & générique", "Explainer vidéo", "Animation logo", "Reels & TikTok"],
    icon: "M4 4h16v12H4zM8 20h8M12 16v4",
  },
  {
    num: "02",
    title: "3D & Architecture",
    desc: "De la maquette SketchUp au rendu photoréaliste : vos volumes deviennent des images qui vendent.",
    items: ["Modélisation SketchUp", "Rendu photoréaliste", "Visite virtuelle", "Produit 3D"],
    icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5",
  },
  {
    num: "03",
    title: "Identité Visuelle",
    desc: "Un territoire graphique cohérent, mémorable et déclinable partout : du logotype à la charte complète.",
    items: ["Logotype & système", "Charte graphique", "Édition & print", "Design social"],
    icon: "M12 3a9 9 0 100 18 4.5 4.5 0 000-9 4.5 4.5 0 010-9zM7.5 9.5h.01M9.5 6.5h.01M14.5 6.5h.01",
  },
  {
    num: "04",
    title: "Production Vidéo",
    desc: "Écriture, tournage, montage, étalonnage. Une équipe complète pour capter vos moments avec exigence.",
    items: ["Film corporate", "Clip & documentaire", "Captation événement", "Post-production"],
    icon: "M3 6h13v12H3zM16 10l5-3v10l-5-3z",
  },
  {
    num: "05",
    title: "Stratégie & Com'",
    desc: "Avant le pixel, l'intention. Positionnement, plan de communication et pilotage de campagnes 360°.",
    items: ["Positionnement", "Plan média", "Campagnes 360°", "Community management"],
    icon: "M4 19V5M4 19h16M8 16V9M12 16v-5M16 16V6",
  },
  {
    num: "06",
    title: "Infographie & Print",
    desc: "Data, affiches, packaging, roll-up : la précision de l'imprimé au service de votre message.",
    items: ["Data-visualisation", "Affiches & flyers", "Packaging", "PLV & stands"],
    icon: "M6 3h12v6H6zM6 15h12v6H6zM4 9h16v6H4z",
  },
];

export const PROCESS = [
  {
    step: "01",
    title: "Brief & Immersion",
    text: "On écoute, on décortique vos objectifs, votre marché et votre audience. Un cadrage clair avant le premier pixel.",
  },
  {
    step: "02",
    title: "Direction Artistique",
    text: "Moodboards, styleframes et concepts. Vous validez une direction visuelle forte avant la production.",
  },
  {
    step: "03",
    title: "Production",
    text: "Tournage, modélisation, animation, design. Notre studio exécute avec une exigence obsessionnelle du détail.",
  },
  {
    step: "04",
    title: "Livraison & Impact",
    text: "Formats optimisés pour chaque canal, fichiers sources, accompagnement au déploiement et mesure des résultats.",
  },
];

export const STATS = [
  { value: 240, suffix: "+", label: "Projets livrés" },
  { value: 86, suffix: "", label: "Marques accompagnées" },
  { value: 12, suffix: " M", label: "Vues cumulées" },
  { value: 9, suffix: " ans", label: "D'obsession visuelle" },
];

export const TESTIMONIALS = [
  {
    quote:
      "Doxa Studio a transformé notre lancement en véritable événement visuel. Le motion design a fait exploser notre engagement.",
    name: "Sarah K.",
    role: "Directrice Marketing — Maison Adjoua",
  },
  {
    quote:
      "Des rendus 3D d'une précision redoutable. Nos acquéreurs se projettent avant même la première pierre.",
    name: "Patrick K.",
    role: "Promoteur — Groupe Bâtir+",
  },
  {
    quote:
      "Réactifs, créatifs, rigoureux. Ils comprennent une marque plus vite que la plupart des agences.",
    name: "Aline T.",
    role: "Fondatrice — Plateau Coworking",
  },
];

export const CLIENTS = [
  "MAISON ADJOUA",
  "GROUPE BÂTIR+",
  "ABIDJAN LIVE",
  "PLATEAU COWORKING",
  "LABEL TEMPO",
  "RADIO LAGUNE FM",
  "ABIDJAN TECH SUMMIT",
  "ATELIER CONCRETE",
];
