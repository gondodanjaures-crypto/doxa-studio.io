import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { fileToMedia } from "../data/media";
import {
  commitPending,
  discardPending,
  stageMedia,
  unstageMedia,
  usePending,
  usePendingTick,
} from "../data/pending";
import {
  addBanner,
  addProjectItem,
  addService,
  addStat,
  addStep,
  addTestimonial,
  addValue,
  exportJSON,
  importJSON,
  moveProjectItem,
  moveService,
  moveStat,
  moveStep,
  moveTestimonial,
  removeBanner,
  removeProjectItem,
  removeService,
  removeStat,
  removeStep,
  removeTestimonial,
  removeValue,
  resetContent,
  resetProjects,
  resetServices,
  setAbout,
  setClients,
  setContact,
  setDelayBox,
  setFooter,
  setHero,
  setLogo,
  setSections,
  setFounder,
  setShowreel,
  updateProjectItem,
  updateService,
  updateStat,
  updateStep,
  updateTestimonial,
  updateValue,
  useContent,
  type Banner,
  type ProjectItem,
  type ServiceItem,
  type StatItem,
  type StepItem,
  type TestimonialItem,
  type ValueItem,
} from "../data/content";
import {
  getAutoSave,
  getCloudUrl,
  pullCloud,
  pushCloud,
  setAutoSave,
  setCloudUrl,
  useCloudStatus,
} from "../data/cloud";
import {
  getProformaConfig,
  saveProformaConfig,
  callProforma,
  type ProformaConfig,
} from "../data/proforma";
import {
  dateFR,
  fcfa,
  removeQuote,
  updateQuote,
  useQuotes,
  type Quote,
} from "../data/quotes";
import { isVimeoUrl, normalizeVideoInput, parseVideoSource } from "../utils/video";
import ProformaSheet from "./ProformaSheet";
import VideoEmbed from "./VideoEmbed";
import {
  assignableRoles,
  canDangerZone,
  canDeleteAccounts,
  canManageAccounts,
  createAccount,
  deleteAccount,
  ROLE_DESC,
  ROLE_LABELS,
  setAccountRole,
  useUsers,
  type Account,
  type Role,
} from "../data/users";
import BrandMark from "./BrandLogo";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/* Utilitaires                                                          */
/* ------------------------------------------------------------------ */
function download(name: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ------------------------------------------------------------------ */
/* Petits composants UI                                                 */
/* ------------------------------------------------------------------ */
const inputCls =
  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-rouge focus:bg-white/[0.06]";

type MediaSpec = {
  id: string;
  title: string;
  use: string;
  recommended: string;
  ratio: string;
  alternatives: string;
  minimum: string;
  minLongSide: number;
  formats: string;
};

const MEDIA_GUIDE: MediaSpec[] = [
  {
    id: "logo",
    title: "Logo",
    use: "Navigation, connexion, footer et favicon",
    recommended: "512 x 512 px",
    ratio: "1:1 carre",
    alternatives: "1024 x 1024 px",
    minimum: "256 x 256 px",
    minLongSide: 256,
    formats: "PNG transparent, SVG ou WebP - 500 Ko max",
  },
  {
    id: "hero",
    title: "Accueil - poster video",
    use: "Image d'attente derriere le grand titre",
    recommended: "1920 x 1080 px",
    ratio: "16:9 paysage",
    alternatives: "1600 x 900 ou 2560 x 1440 px",
    minimum: "1280 x 720 px",
    minLongSide: 1280,
    formats: "WebP ou JPG - 1,5 Mo conseille",
  },
  {
    id: "project",
    title: "Images de projets - mosaique",
    use: "Vitrine, lightbox et filtres par expertise",
    recommended: "Paysage 1600 x 1000 px",
    ratio: "Orientation libre",
    alternatives: "Portrait 1200 x 1600 - Carre 1200 x 1200 px",
    minimum: "1000 px sur le cote le plus long",
    minLongSide: 1000,
    formats: "WebP ou JPG - 2 Mo conseille",
  },
  {
    id: "showreel",
    title: "Showreel - poster",
    use: "Bande video et lecteur plein ecran",
    recommended: "1920 x 1080 px",
    ratio: "16:9 paysage",
    alternatives: "1600 x 900 ou 2560 x 1440 px",
    minimum: "1280 x 720 px",
    minLongSide: 1280,
    formats: "WebP ou JPG - 1,5 Mo conseille",
  },
  {
    id: "founder",
    title: "Portrait du fondateur",
    use: "Section Le visage derriere Doxa",
    recommended: "1200 x 1500 px",
    ratio: "4:5 portrait",
    alternatives: "1080 x 1350 ou 1600 x 2000 px",
    minimum: "800 x 1000 px",
    minLongSide: 1000,
    formats: "WebP ou JPG - 1,5 Mo conseille",
  },
  {
    id: "agency",
    title: "Photo de l'agence",
    use: "Grand visuel vertical de la section Agence",
    recommended: "1200 x 1500 px",
    ratio: "4:5 portrait",
    alternatives: "1100 x 1400 ou 1600 x 2000 px",
    minimum: "800 x 1000 px",
    minLongSide: 1000,
    formats: "WebP ou JPG - 1,5 Mo conseille",
  },
  {
    id: "banner",
    title: "Banniere image",
    use: "Banniere pleine largeur entre les sections",
    recommended: "1920 x 900 px",
    ratio: "Environ 2:1 paysage",
    alternatives: "1920 x 1080 ou 2400 x 1125 px",
    minimum: "1600 x 750 px",
    minLongSide: 1600,
    formats: "WebP ou JPG - 2 Mo conseille",
  },
  {
    id: "video",
    title: "Videos du site",
    use: "Hero, showreel, bannieres et extraits projets",
    recommended: "1920 x 1080 px",
    ratio: "16:9 paysage",
    alternatives: "1280 x 720 px si fichier leger",
    minimum: "1280 x 720 px",
    minLongSide: 1280,
    formats: "MP4 H.264 ou WebM - 8 Mo max en televersement",
  },
];

function mediaSpec(key: string, kind: "image" | "video"): MediaSpec {
  if (kind === "video") return MEDIA_GUIDE.find((s) => s.id === "video")!;
  if (key === "hero-poster") return MEDIA_GUIDE.find((s) => s.id === "hero")!;
  if (key.startsWith("proj-") && key.endsWith("-img"))
    return MEDIA_GUIDE.find((s) => s.id === "project")!;
  if (key === "reel-poster") return MEDIA_GUIDE.find((s) => s.id === "showreel")!;
  if (key === "founder-photo") return MEDIA_GUIDE.find((s) => s.id === "founder")!;
  if (key === "about-photo") return MEDIA_GUIDE.find((s) => s.id === "agency")!;
  if (key.startsWith("banner-draft")) return MEDIA_GUIDE.find((s) => s.id === "banner")!;
  return MEDIA_GUIDE.find((s) => s.id === "project")!;
}

function DimensionGuide({
  spec,
  actual,
}: {
  spec: MediaSpec;
  actual?: { width: number; height: number } | null;
}) {
  const orientation = actual
    ? actual.width === actual.height
      ? "carre"
      : actual.width > actual.height
        ? "paysage"
        : "portrait"
    : "";
  const conform = actual ? Math.max(actual.width, actual.height) >= spec.minLongSide : false;

  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-ink/60 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-rouge">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 15l3-3 2 2 3-4 3 5" />
            </svg>
            Format recommande
          </p>
          <p className="mt-1.5 font-display text-xl uppercase text-white/90">
            {spec.recommended}
          </p>
          <p className="mt-0.5 text-[10.5px] text-white/40">
            {spec.ratio} - {spec.use}
          </p>
        </div>
        {actual && (
          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em]",
              conform
                ? "border-[#28c840]/50 bg-[#28c840]/10 text-[#28c840]"
                : "border-rouge/50 bg-rouge/10 text-rouge",
            )}
          >
            {conform ? "Dimensions conformes" : "Resolution trop faible"}
          </span>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2">
          <p className="text-[8.5px] uppercase tracking-[0.16em] text-white/30">Alternatives</p>
          <p className="mt-1 text-[10.5px] text-white/60">{spec.alternatives}</p>
        </div>
        <div className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2">
          <p className="text-[8.5px] uppercase tracking-[0.16em] text-white/30">Minimum</p>
          <p className="mt-1 text-[10.5px] text-white/60">{spec.minimum}</p>
        </div>
        <div className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2">
          <p className="text-[8.5px] uppercase tracking-[0.16em] text-white/30">Fichier</p>
          <p className="mt-1 text-[10.5px] text-white/60">{spec.formats}</p>
        </div>
      </div>
      {actual && (
        <p className="mt-2 text-[10.5px] text-white/45">
          Fichier detecte : <span className="font-semibold text-white/75">{actual.width} x {actual.height} px</span>{" "}
          - orientation {orientation}
        </p>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  textarea,
  className,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  className?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputCls, "resize-none")}
        />
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

function Group({
  title,
  desc,
  children,
  action,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-2/60 p-6 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl uppercase">{title}</h3>
        <div className="flex items-center gap-3">
          {action}
          <span className="flex shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rouge" />
            Auto-enregistré
          </span>
        </div>
      </div>
      {desc && <p className="-mt-3 mb-5 text-xs text-white/40">{desc}</p>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Champ média : téléversement + URL + aperçu (image ou vidéo). */
function MediaField({
  label,
  value,
  onChange,
  kind,
  notify,
  allowClear,
  hint,
  uid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  kind: "image" | "video";
  notify: (m: string) => void;
  allowClear?: boolean;
  hint?: string;
  uid?: string;
}) {
  const key = uid ?? label;
  const spec = mediaSpec(key, kind);
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [staged, setStaged] = useState<string | null>(null);
  const [actual, setActual] = useState<{ width: number; height: number } | null>(null);
  const tick = usePendingTick();
  const pending = usePending();
  const inPending = pending.some((p) => p.key === key);

  /* Après un enregistrement ou une annulation globale,
     l'aperçu local « en attente » se réinitialise. */
  useEffect(() => setStaged(null), [tick]);

  /* Si l'élément est retiré de l'attente (annulée ou consommée),
     on réinitialise aussi l'aperçu local. */
  useEffect(() => {
    if (staged && !inPending) setStaged(null);
  }, [inPending, staged]);

  const preview = staged ?? value;
  const isPending = staged !== null;
  const pct = busy !== null ? Math.round(busy * 100) : 0;

  const onFile = async (f?: File | null) => {
    if (!f) return;
    setBusy(0);
    try {
      const dataUrl = await fileToMedia(f, kind, (p) => setBusy(p));
      setStaged(dataUrl);
      stageMedia(key, `${label} — ${f.name}`, dataUrl, () => onChange(dataUrl));
      notify("Prêt ! Cliquez sur « Enregistrer » pour l'appliquer au site.");
    } catch (e) {
      notify(
        e instanceof Error && e.message === "too-big"
          ? "Vidéo trop lourde (> 8 Mo) — utilisez une URL mp4."
          : "Impossible de charger ce fichier.",
      );
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const cancelStaged = () => {
    unstageMedia(key);
    setStaged(null);
    setActual(null);
    notify("Mise en attente annulée pour ce média.");
  };

  const ProgressBar = ({ p }: { p: number }) => (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-rouge transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
          {label}
        </label>
        {isPending && (
          <span className="flex items-center gap-1.5 rounded-full border border-rouge/50 bg-rouge/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-rouge">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rouge" />
            En attente
          </span>
        )}
      </div>

      <DimensionGuide spec={spec} actual={actual} />

      {preview ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border bg-ink transition-colors duration-300",
            isPending ? "border-rouge" : "border-white/10",
          )}
        >
          {kind === "image" ? (
            <img
              src={preview}
              alt="Apercu"
              className="h-44 w-full object-cover"
              onLoad={(e) =>
                setActual({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })
              }
            />
          ) : parseVideoSource(preview)?.type === "vimeo" ? (
            <div className="relative h-44 w-full bg-black">
              <VideoEmbed
                src={preview}
                title="Aperçu Vimeo"
                mode="preview"
                className="h-full w-full"
              />
              <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                Lien Vimeo ✓
              </span>
            </div>
          ) : (
            <video
              src={preview}
              muted
              playsInline
              preload="metadata"
              className="h-44 w-full object-cover"
              onLoadedMetadata={(e) =>
                setActual({
                  width: e.currentTarget.videoWidth,
                  height: e.currentTarget.videoHeight,
                })
              }
            />
          )}

          {isPending && (
            <span className="absolute left-3 top-3 rounded-full bg-rouge px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
              En attente d'enregistrement
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2 p-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-cursor="link"
              className="rounded-full bg-rouge px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85"
            >
              {busy !== null ? `Traitement… ${pct}%` : "Remplacer"}
            </button>
            {isPending ? (
              <button
                type="button"
                onClick={cancelStaged}
                data-cursor="link"
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 hover:border-white/50 hover:text-white"
              >
                Annuler
              </button>
            ) : (
              allowClear && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    notify("Média retiré.");
                  }}
                  data-cursor="link"
                  className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 hover:border-rouge hover:text-rouge"
                >
                  Retirer
                </button>
              )
            )}
          </div>

          {busy !== null && (
            <div className="px-3 pb-3">
              <ProgressBar p={pct} />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-cursor="link"
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-6 text-white/40 transition-colors hover:border-rouge hover:text-rouge"
        >
          {busy !== null ? (
            <>
              <span className="font-display text-xl text-white/70">{pct}%</span>
              <span className="text-[10px] uppercase tracking-[0.18em]">Traitement du fichier…</span>
              <div className="w-full max-w-[240px]">
                <ProgressBar p={pct} />
              </div>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
              </svg>
              <span className="text-[10px] uppercase tracking-[0.18em]">
                {kind === "image" ? "Téléverser une image" : "Téléverser une vidéo (< 8 Mo)"}
              </span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={kind === "image" ? "image/png,image/jpeg,image/webp" : "video/mp4,video/webm"}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="mt-2 flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={kind === "video" ? "URL mp4/Vimeo ou code iframe Vimeo…" : "…ou collez une URL puis « OK »"}
          className={cn(inputCls, "py-2.5 text-[13px]")}
        />
        <button
          type="button"
          data-cursor="link"
          onClick={() => {
            const normalized = kind === "video" ? normalizeVideoInput(url) : url.trim();
            if (!normalized || !/^(https?:\/\/|data:|blob:)\S/.test(normalized)) {
              notify(kind === "video" ? "Collez un lien Vimeo, un code d'intégration Vimeo ou une URL vidéo mp4 valide." : "URL invalide.");
              return;
            }
            onChange(normalized);
            setUrl("");
            notify(kind === "video" && isVimeoUrl(normalized) ? "Lien Vimeo appliqué." : "Média appliqué depuis l'URL.");
          }}
          className="shrink-0 rounded-xl border border-white/20 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:border-rouge hover:text-rouge"
        >
          OK
        </button>
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-white/35">{hint}</p>}
    </div>
  );
}

/** Boutons monter / descendre. */
function MoveBtns({ onUp, onDown }: { onUp: () => void; onDown: () => void }) {
  const cls =
    "flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/50 hover:text-white";
  return (
    <div className="flex gap-1.5">
      <button type="button" onClick={onUp} aria-label="Monter" data-cursor="link" className={cls}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
      <button type="button" onClick={onDown} aria-label="Descendre" data-cursor="link" className={cls}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

/** Suppression en 2 temps (anti-clic accidentel). */
function DeleteBtn({ onDelete, label }: { onDelete: () => void; label: string }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      data-cursor="link"
      onClick={() => {
        if (!armed) {
          setArmed(true);
          window.setTimeout(() => setArmed(false), 3000);
          return;
        }
        setArmed(false);
        onDelete();
      }}
      onBlur={() => setArmed(false)}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-300",
        armed
          ? "border-rouge bg-rouge text-white"
          : "border-rouge/40 text-rouge hover:bg-rouge hover:text-white",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
      </svg>
      {armed ? "Sûr ?" : ""}
    </button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="link"
      className="group relative w-full overflow-hidden rounded-full bg-rouge px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white"
    >
      <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
      <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-ink">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {label}
      </span>
    </button>
  );
}

function GhostBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="link"
      className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 transition-colors duration-300 hover:border-rouge hover:text-rouge"
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Accueil (hero)                                              */
/* ------------------------------------------------------------------ */
function AccueilTab({ notify }: { notify: (m: string) => void }) {
  const { hero } = useContent();
  return (
    <div className="space-y-6">
      <Group title="Titre & accroche">
        <TextField label="Badge d'état" value={hero.badge} onChange={(v) => setHero({ badge: v })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Titre — ligne 1" value={hero.line1} onChange={(v) => setHero({ line1: v })} />
          <TextField label="Titre — ligne 2" value={hero.line2} onChange={(v) => setHero({ line2: v })} />
          <TextField label="Mot d'accent (contour rouge)" value={hero.accent} onChange={(v) => setHero({ accent: v })} />
        </div>
        <TextField label="Sous-titre" textarea value={hero.subtitle} onChange={(v) => setHero({ subtitle: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Bouton principal" value={hero.cta1} onChange={(v) => setHero({ cta1: v })} />
          <TextField label="Bouton secondaire" value={hero.cta2} onChange={(v) => setHero({ cta2: v })} />
        </div>
        <TextField
          label="Expertises affichées sous l'accueil (séparées par des virgules)"
          value={hero.marquee}
          onChange={(v) => setHero({ marquee: v })}
        />
      </Group>
      <Group title="Vidéo de fond" desc="Boucle plein écran derrière le titre. Changez-la à tout moment.">
        <MediaField
          label="Vidéo de fond (mp4)"
          uid="hero-video"
          kind="video"
          value={hero.video}
          notify={notify}
          onChange={(v) => setHero({ video: v })}
          hint="Fichier < 8 Mo ou URL mp4 (ex. Pexels, votre hébergeur)."
        />
        <MediaField
          label="Image d'attente (poster)"
          uid="hero-poster"
          kind="image"
          value={hero.poster}
          notify={notify}
          onChange={(v) => setHero({ poster: v })}
          hint="Affichée pendant le chargement de la vidéo."
        />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Réalisations (CRUD projets)                                 */
/* ------------------------------------------------------------------ */
function ProjectEditor({
  p,
  categories,
  notify,
}: {
  p: ProjectItem;
  categories: string[];
  notify: (m: string) => void;
}) {
  const { services } = useContent();
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink">
      <div className="flex items-center gap-3 p-3">
        <img src={p.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base uppercase">{p.title || "Sans titre"}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
            {p.client} · {p.category} · {p.year}
          </p>
        </div>
        <MoveBtns onUp={() => moveProjectItem(p.id, -1)} onDown={() => moveProjectItem(p.id, 1)} />
        <DeleteBtn label="Supprimer le projet" onDelete={() => { removeProjectItem(p.id); notify("Projet supprimé du site."); }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          aria-label="Modifier"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            open ? "border-rouge bg-rouge text-white" : "border-white/20 text-white/60 hover:border-white/50 hover:text-white",
          )}
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Titre" value={p.title} onChange={(v) => updateProjectItem(p.id, { title: v })} />
                <TextField label="Client / Marque" value={p.client} onChange={(v) => updateProjectItem(p.id, { client: v })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Catégorie — Nos expertises</label>
                  <select
                    value={p.category}
                    onChange={(e) => updateProjectItem(p.id, { category: e.target.value })}
                    className={cn(inputCls, "appearance-none")}
                  >
                    {[...new Set([...services.map((s) => s.title), ...categories, p.category])]
                      .filter(Boolean)
                      .map((c) => (
                        <option key={c} value={c} className="bg-ink-2">
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <TextField label="Année" value={p.year} onChange={(v) => updateProjectItem(p.id, { year: v })} />
              </div>
              <p className="-mt-1 text-[11px] leading-relaxed text-white/35">
                La mosaïque du site respecte automatiquement l'orientation de chaque image : une
                image portrait s'affiche en hauteur, une image paysage en largeur.
              </p>
              <MediaField label="Image du projet" uid={`proj-${p.id}-img`} kind="image" value={p.image} notify={notify} onChange={(v) => updateProjectItem(p.id, { image: v })} />
              <MediaField
                label="Extrait vidéo (optionnel — mp4 ou lien Vimeo, joué au survol)"
                uid={`proj-${p.id}-vid`}
                kind="video"
                value={p.video ?? ""}
                notify={notify}
                allowClear
                onChange={(v) => updateProjectItem(p.id, { video: v || undefined })}
              />
              <TextField
                label="Tags (séparés par des virgules)"
                value={p.tags.join(", ")}
                onChange={(v) =>
                  updateProjectItem(p.id, {
                    tags: v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6),
                  })
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjetsTab({ notify }: { notify: (m: string) => void }) {
  const { projects } = useContent();
  const categories = Array.from(new Set(projects.map((p) => p.category)));
  return (
    <div className="space-y-4">
      <Group
        title={`Projets de la vitrine (${projects.length})`}
        desc="Tout est modifiable : images, vidéos, titres, catégories. L'ordre ici = l'ordre sur le site."
        action={<GhostBtn label="Restaurer l'original" onClick={() => { resetProjects(); notify("Projets d'origine restaurés."); }} />}
      >
        <AddBtn
          label="Ajouter un projet"
          onClick={() => {
            addProjectItem({
              id: Date.now(),
              title: "Nouveau projet",
              client: "Client",
              category: categories[0] ?? "Motion Design",
              year: String(new Date().getFullYear()),
              image: "",
              tags: [],
              size: "std",
            });
            notify("Projet créé — ajoutez son image.");
          }}
        />
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectEditor key={p.id} p={p} categories={categories} notify={notify} />
          ))}
        </div>
        {projects.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            Aucun projet — la section Réalisations est vide sur le site.
          </p>
        )}
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Expertises (CRUD services)                                  */
/* ------------------------------------------------------------------ */
const ICON_PRESETS = [
  { label: "Média / Play", path: "M8 5v14l11-7z" },
  { label: "Volume 3D", path: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" },
  { label: "Palette", path: "M12 3a9 9 0 100 18 4.5 4.5 0 000-9 4.5 4.5 0 010-9zM7.5 9.5h.01M9.5 6.5h.01M14.5 6.5h.01" },
  { label: "Caméra", path: "M3 6h13v12H3zM16 10l5-3v10l-5-3z" },
  { label: "Croissance", path: "M4 19V5M4 19h16M8 16V9M12 16v-5M16 16V6" },
  { label: "Calques", path: "M6 3h12v6H6zM6 15h12v6H6zM4 9h16v6H4z" },
  { label: "Mégaphone", path: "M3 11v3l4 1 4 5V6l-4 5H4zM15 9a4 4 0 010 6" },
  { label: "Étoile", path: "M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" },
];

function ServiceEditor({ s, notify }: { s: ServiceItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink">
      <div className="flex items-center gap-3 p-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rouge/15">
          <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-rouge" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d={s.icon} />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base uppercase">{s.num} — {s.title || "Sans titre"}</p>
          <p className="truncate text-[11px] text-white/40">{s.items.join(" · ")}</p>
        </div>
        <MoveBtns onUp={() => moveService(s.id, -1)} onDown={() => moveService(s.id, 1)} />
        <DeleteBtn label="Supprimer le service" onDelete={() => { removeService(s.id); notify("Service supprimé."); }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          aria-label="Modifier"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            open ? "border-rouge bg-rouge text-white" : "border-white/20 text-white/60 hover:border-white/50 hover:text-white",
          )}
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/10 p-4">
              <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                <TextField label="N°" value={s.num} onChange={(v) => updateService(s.id, { num: v })} />
                <TextField label="Titre" value={s.title} onChange={(v) => updateService(s.id, { title: v })} />
              </div>
              <TextField label="Description" textarea value={s.desc} onChange={(v) => updateService(s.id, { desc: v })} />
              <TextField
                label="Prestations (séparées par des virgules)"
                value={s.items.join(", ")}
                onChange={(v) =>
                  updateService(s.id, {
                    items: v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
                  })
                }
              />
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Icône</label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {ICON_PRESETS.map((ic) => (
                    <button
                      key={ic.label}
                      type="button"
                      title={ic.label}
                      onClick={() => updateService(s.id, { icon: ic.path })}
                      data-cursor="link"
                      className={cn(
                        "flex h-11 items-center justify-center rounded-xl border transition-all duration-300",
                        s.icon === ic.path
                          ? "border-rouge bg-rouge/15"
                          : "border-white/12 hover:border-white/40",
                      )}
                    >
                      <svg viewBox="0 0 24 24" className={cn("h-5 w-5", s.icon === ic.path ? "stroke-rouge" : "stroke-white/50")} fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d={ic.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServicesTab({ notify }: { notify: (m: string) => void }) {
  const { services } = useContent();
  return (
    <Group
      title={`Expertises (${services.length})`}
      desc="Cartes de la section Expertises : titre, description, prestations, icône."
      action={<GhostBtn label="Restaurer l'original" onClick={() => { resetServices(); notify("Services d'origine restaurés."); }} />}
    >
      <AddBtn
        label="Ajouter un service"
        onClick={() => {
          addService({
            id: Date.now(),
            num: String(services.length + 1).padStart(2, "0"),
            title: "Nouveau service",
            desc: "Décrivez ce savoir-faire en une phrase.",
            items: ["Prestation 1", "Prestation 2"],
            icon: ICON_PRESETS[0].path,
          });
          notify("Service créé.");
        }}
      />
      <div className="space-y-3">
        {services.map((s) => (
          <ServiceEditor key={s.id} s={s} notify={notify} />
        ))}
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Showreel                                                    */
/* ------------------------------------------------------------------ */
function ShowreelTab({ notify }: { notify: (m: string) => void }) {
  const { showreel } = useContent();
  return (
    <div className="space-y-6">
      <Group title="Vidéo du showreel" desc="Bandeau plein écran + lecture en plein pot au clic.">
        <MediaField label="Vidéo" uid="reel-video" kind="video" value={showreel.video} notify={notify} onChange={(v) => setShowreel({ video: v })} />
        <MediaField label="Image d'attente (poster)" uid="reel-poster" kind="image" value={showreel.poster} notify={notify} onChange={(v) => setShowreel({ poster: v })} />
      </Group>
      <Group title="Textes du showreel">
        <TextField label="Grand titre" value={showreel.title} onChange={(v) => setShowreel({ title: v })} />
        <TextField label="Sous-titre" value={showreel.subtitle} onChange={(v) => setShowreel({ subtitle: v })} />
        <TextField
          label="Savoir-faire affichés sous le showreel (séparés par des virgules)"
          value={showreel.marquee}
          onChange={(v) => setShowreel({ marquee: v })}
        />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Fondateur                                                     */
/* ------------------------------------------------------------------ */
function FondateurTab({ notify }: { notify: (m: string) => void }) {
  const { founder } = useContent();
  return (
    <div className="space-y-6">
      <Group
        title="Photo du fondateur"
        desc="Portrait affiché dans la section « Le visage derrière Doxa ». Téléversez votre photo : elle apparaît aussitôt sur le site."
      >
        <MediaField
          label="Portrait (format vertical idéal)"
          uid="founder-photo"
          kind="image"
          value={founder.photo}
          notify={notify}
          allowClear
          onChange={(v) => setFounder({ photo: v })}
          hint="Une photo nette sur fond sombre s'intègre parfaitement au design du site."
        />
      </Group>
      <Group title="Identité">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nom" value={founder.name} onChange={(v) => setFounder({ name: v })} />
          <TextField label="Rôle" value={founder.role} onChange={(v) => setFounder({ role: v })} />
        </div>
      </Group>
      <Group title="Présentation">
        <TextField label="Paragraphe 1" textarea value={founder.bio1} onChange={(v) => setFounder({ bio1: v })} />
        <TextField label="Paragraphe 2" textarea value={founder.bio2} onChange={(v) => setFounder({ bio2: v })} />
        <TextField label="Citation signature" textarea value={founder.quote} onChange={(v) => setFounder({ quote: v })} />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Agence (photo, valeurs, chiffres, clients)                  */
/* ------------------------------------------------------------------ */
function ValueEditor({ v, notify }: { v: ValueItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <p className="flex-1 truncate font-display text-base uppercase">{v.title || "Sans titre"}</p>
        <DeleteBtn label="Supprimer" onDelete={() => { removeValue(v.id); notify("Valeur supprimée."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <TextField label="Titre" value={v.title} onChange={(t) => updateValue(v.id, { title: t })} />
          <TextField label="Texte" textarea value={v.text} onChange={(t) => updateValue(v.id, { text: t })} />
        </div>
      )}
    </div>
  );
}

function StatEditor({ s, notify }: { s: StatItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <p className="flex-1 font-display text-xl">
          {s.value}
          <span className="text-rouge">{s.suffix}</span>
          <span className="ml-2 align-middle font-sans text-[10px] uppercase tracking-[0.16em] text-white/40">{s.label}</span>
        </p>
        <MoveBtns onUp={() => moveStat(s.id, -1)} onDown={() => moveStat(s.id, 1)} />
        <DeleteBtn label="Supprimer" onDelete={() => { removeStat(s.id); notify("Chiffre supprimé."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-3">
          <TextField label="Valeur (nombre)" type="number" value={String(s.value)} onChange={(v) => updateStat(s.id, { value: parseInt(v, 10) || 0 })} />
          <TextField label="Suffixe (+, M, ans…)" value={s.suffix} onChange={(v) => updateStat(s.id, { suffix: v })} />
          <TextField label="Libellé" value={s.label} onChange={(v) => updateStat(s.id, { label: v })} />
        </div>
      )}
    </div>
  );
}

function AgenceTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  const [clientsText, setClientsText] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <Group title="Textes de l'agence">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Titre — ligne 1" value={c.about.title1} onChange={(v) => setAbout({ title1: v })} />
          <TextField label="Ligne 2 (rouge)" value={c.about.title2} onChange={(v) => setAbout({ title2: v })} />
          <TextField label="Ligne 3 (contour)" value={c.about.title3} onChange={(v) => setAbout({ title3: v })} />
        </div>
        <TextField label="Paragraphe 1" textarea value={c.about.p1} onChange={(v) => setAbout({ p1: v })} />
        <TextField label="Paragraphe 2" textarea value={c.about.p2} onChange={(v) => setAbout({ p2: v })} />
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <TextField label="Chiffre (badge rouge)" value={c.about.statValue} onChange={(v) => setAbout({ statValue: v })} />
          <TextField label="Texte sous le chiffre" value={c.about.statLabel} onChange={(v) => setAbout({ statLabel: v })} />
        </div>
      </Group>

      <Group title="Photo de l'agence" desc="Portrait vertical affiché à gauche de la section.">
        <MediaField label="Photo" uid="about-photo" kind="image" value={c.about.image} notify={notify} onChange={(v) => setAbout({ image: v })} hint="Format portrait idéal (ex. 1100 × 1400)." />
      </Group>

      <Group title={`Valeurs (${c.about.values.length})`} desc="Les 3 cartes sous le texte (ajoutez-en ou retirez-en librement).">
        <AddBtn
          label="Ajouter une valeur"
          onClick={() => {
            addValue({ id: Date.now(), title: "Nouvelle valeur", text: "Décrivez-la en une phrase." });
            notify("Valeur ajoutée.");
          }}
        />
        <div className="space-y-3">
          {c.about.values.map((v) => (
            <ValueEditor key={v.id} v={v} notify={notify} />
          ))}
        </div>
      </Group>

      <Group title={`Chiffres clés (${c.stats.length})`} desc="Compteurs animés sous la section.">
        <AddBtn
          label="Ajouter un chiffre"
          onClick={() => {
            addStat({ id: Date.now(), value: 100, suffix: "+", label: "Nouveau chiffre" });
            notify("Chiffre ajouté.");
          }}
        />
        <div className="space-y-3">
          {c.stats.map((s) => (
            <StatEditor key={s.id} s={s} notify={notify} />
          ))}
        </div>
      </Group>

      <Group title="Clients (bandeau défilant)" desc="Un client par ligne.">
        <textarea
          rows={5}
          value={clientsText ?? c.clients.join("\n")}
          onChange={(e) => setClientsText(e.target.value)}
          onBlur={() => {
            if (clientsText !== null) {
              setClients(clientsText.split("\n").map((l) => l.trim()).filter(Boolean));
              setClientsText(null);
              notify("Liste clients mise à jour.");
            }
          }}
          className={cn(inputCls, "resize-none font-display uppercase tracking-wide")}
        />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Méthode & Avis                                              */
/* ------------------------------------------------------------------ */
function StepEditor({ s, notify }: { s: StepItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rouge font-display text-sm">{s.step}</span>
        <p className="flex-1 truncate font-display text-base uppercase">{s.title || "Sans titre"}</p>
        <MoveBtns onUp={() => moveStep(s.id, -1)} onDown={() => moveStep(s.id, 1)} />
        <DeleteBtn label="Supprimer" onDelete={() => { removeStep(s.id); notify("Étape supprimée."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
            <TextField label="N°" value={s.step} onChange={(v) => updateStep(s.id, { step: v })} />
            <TextField label="Titre" value={s.title} onChange={(v) => updateStep(s.id, { title: v })} />
          </div>
          <TextField label="Texte" textarea value={s.text} onChange={(v) => updateStep(s.id, { text: v })} />
        </div>
      )}
    </div>
  );
}

function TestimonialEditor({ t, notify }: { t: TestimonialItem; notify: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink p-3">
      <div className="flex items-center gap-3">
        <p className="flex-1 truncate text-sm text-white/70">“{t.quote || "Sans texte"}” — <span className="text-rouge">{t.name}</span></p>
        <MoveBtns onUp={() => moveTestimonial(t.id, -1)} onDown={() => moveTestimonial(t.id, 1)} />
        <DeleteBtn label="Supprimer" onDelete={() => { removeTestimonial(t.id); notify("Témoignage supprimé."); }} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          data-cursor="link"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white/50 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <TextField label="Citation" textarea value={t.quote} onChange={(v) => updateTestimonial(t.id, { quote: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Nom" value={t.name} onChange={(v) => updateTestimonial(t.id, { name: v })} />
            <TextField label="Fonction / Entreprise" value={t.role} onChange={(v) => updateTestimonial(t.id, { role: v })} />
          </div>
        </div>
      )}
    </div>
  );
}

function MethodeTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  return (
    <div className="space-y-6">
      <Group title="Titres de la section">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ligne 1" value={c.sections.processTitle1} onChange={(v) => setSections({ processTitle1: v })} />
          <TextField label="Ligne 2 (rouge)" value={c.sections.processTitle2} onChange={(v) => setSections({ processTitle2: v })} />
        </div>
      </Group>
      <Group title={`Étapes de la méthode (${c.process.length})`} desc="Ajoutées en fin de liste, réordonnez avec les flèches.">
        <AddBtn
          label="Ajouter une étape"
          onClick={() => {
            addStep({
              id: Date.now(),
              step: String(c.process.length + 1).padStart(2, "0"),
              title: "Nouvelle étape",
              text: "Décrivez cette étape en une phrase.",
            });
            notify("Étape ajoutée.");
          }}
        />
        <div className="space-y-3">
          {c.process.map((s) => (
            <StepEditor key={s.id} s={s} notify={notify} />
          ))}
        </div>
      </Group>
      <Group title="Encadré délai">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Libellé" value={c.delayBox.label} onChange={(v) => setDelayBox({ label: v })} />
          <TextField label="Valeur (ex. 10–21)" value={c.delayBox.value} onChange={(v) => setDelayBox({ value: v })} />
          <TextField label="Suffixe (ex. jours)" value={c.delayBox.suffix} onChange={(v) => setDelayBox({ suffix: v })} />
        </div>
        <TextField label="Texte" textarea value={c.delayBox.text} onChange={(v) => setDelayBox({ text: v })} />
      </Group>
      <Group title={`Témoignages clients (${c.testimonials.length})`}>
        <AddBtn
          label="Ajouter un témoignage"
          onClick={() => {
            addTestimonial({ id: Date.now(), quote: "Nouveau témoignage client.", name: "Nom", role: "Fonction — Entreprise" });
            notify("Témoignage ajouté.");
          }}
        />
        <div className="space-y-3">
          {c.testimonials.map((t) => (
            <TestimonialEditor key={t.id} t={t} notify={notify} />
          ))}
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Identité & Logo                                             */
/* ------------------------------------------------------------------ */
function IdentiteTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [staged, setStaged] = useState<string | null>(null);
  const [actual, setActual] = useState<{ width: number; height: number } | null>(null);
  const tick = usePendingTick();
  useEffect(() => setStaged(null), [tick]);
  const pct = busy !== null ? Math.round(busy * 100) : 0;

  const onFile = async (f?: File | null) => {
    if (!f) return;
    setBusy(0);
    try {
      const dataUrl = await fileToMedia(f, "image", (p) => setBusy(p));
      setStaged(dataUrl);
      stageMedia("logo", `Logo du site — ${f.name}`, dataUrl, () => setLogo(dataUrl));
      notify("Logo prêt ! Cliquez sur « Enregistrer » pour l'appliquer.");
    } catch {
      notify("Impossible de charger cette image.");
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Group
      title="Logo du site"
      desc="Apparaît dans la navigation, le pied de page, l'écran de connexion, l'espace studio et l'administration."
    >
      <DimensionGuide
        spec={MEDIA_GUIDE.find((s) => s.id === "logo")!}
        actual={actual}
      />
      <div
        className={cn(
          "relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border bg-ink transition-colors duration-300",
          staged ? "border-rouge" : "border-white/10",
        )}
      >
        <div className="grid-lines absolute inset-0 opacity-50" />
        {staged || c.logo ? (
          <img
            src={staged ?? c.logo ?? ""}
            alt="Apercu du logo"
            className="relative h-24 w-24 object-contain"
            onLoad={(e) =>
              setActual({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
          />
        ) : (
          <BrandMark className="relative h-24 w-24 object-contain" />
        )}
        {staged && (
          <span className="absolute left-4 top-4 rounded-full bg-rouge px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
            En attente d'enregistrement
          </span>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
        {c.logo ? (
          <span className="text-rouge">Logo personnalisé actif</span>
        ) : (
          "Logo par défaut (œil Doxa)"
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-cursor="link"
          className="group relative overflow-hidden rounded-full bg-rouge px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center justify-center gap-2.5 transition-colors duration-300 group-hover:text-ink">
            {busy !== null ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
              </svg>
            )}
            {busy !== null ? `Traitement… ${pct}%` : "Téléverser un logo"}
          </span>
        </button>
        {staged ? (
          <button
            type="button"
            onClick={() => {
              unstageMedia("logo");
              setStaged(null);
              notify("Mise en attente du logo annulée.");
            }}
            data-cursor="link"
            className="rounded-full border border-white/20 px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors duration-300 hover:border-white/50 hover:text-white"
          >
            Annuler
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setLogo(null);
              notify("Logo par défaut (œil Doxa) restauré.");
            }}
            data-cursor="link"
            className="rounded-full border border-white/20 px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors duration-300 hover:border-rouge hover:text-white"
          >
            Restaurer l'œil Doxa
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…ou collez l'URL d'une image (https://…)"
          className={inputCls}
        />
        <button
          type="button"
          data-cursor="link"
          onClick={() => {
            if (!/^https?:\/\/.+/.test(url.trim())) {
              notify("URL d'image invalide.");
              return;
            }
            setLogo(url.trim());
            setUrl("");
            notify("Logo appliqué depuis l'URL.");
          }}
          className="shrink-0 rounded-xl border border-white/20 px-5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-rouge hover:text-rouge"
        >
          Appliquer
        </button>
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Textes (titres sections + contact + footer)                 */
/* ------------------------------------------------------------------ */
function TextesTab() {
  const c = useContent();
  return (
    <div className="space-y-6">
      <Group title="Titres des sections">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Expertises — ligne 1" value={c.sections.servicesTitle1} onChange={(v) => setSections({ servicesTitle1: v })} />
          <TextField label="Expertises — ligne 2" value={c.sections.servicesTitle2} onChange={(v) => setSections({ servicesTitle2: v })} />
        </div>
        <TextField label="Expertises — introduction" textarea value={c.sections.servicesIntro} onChange={(v) => setSections({ servicesIntro: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Réalisations — ligne 1" value={c.sections.portfolioTitle1} onChange={(v) => setSections({ portfolioTitle1: v })} />
          <TextField label="Réalisations — ligne 2 (rouge)" value={c.sections.portfolioTitle2} onChange={(v) => setSections({ portfolioTitle2: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Contact — ligne 1" value={c.sections.contactTitle1} onChange={(v) => setSections({ contactTitle1: v })} />
          <TextField label="Contact — ligne 2 (rouge)" value={c.sections.contactTitle2} onChange={(v) => setSections({ contactTitle2: v })} />
        </div>
      </Group>
      <Group title="Section Contact — introduction">
        <TextField label="Texte d'intro" textarea value={c.contact.intro} onChange={(v) => setContact({ intro: v })} />
      </Group>
      <Group title="Pied de page">
        <TextField label="Description du studio" textarea value={c.footer.desc} onChange={(v) => setFooter({ desc: v })} />
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Coordonnées                                                 */
/* ------------------------------------------------------------------ */
function CoordonneesTab() {
  const { contact: ct } = useContent();

  const setPhone = (i: number, patch: { display?: string; tel?: string }) =>
    setContact({
      phones: ct.phones.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    });

  return (
    <div className="space-y-6">
      <Group
        title="Contact direct"
        desc="Utilisés dans la section Contact, le pied de page, le menu mobile et le bouton flottant."
      >
        <TextField label="Email" value={ct.email} onChange={(v) => setContact({ email: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-rouge">Ligne {i + 1}</p>
              <TextField label="Affichage" value={ct.phones[i]?.display ?? ""} onChange={(v) => setPhone(i, { display: v })} />
              <TextField label="Numéro (lien d'appel)" value={ct.phones[i]?.tel ?? ""} onChange={(v) => setPhone(i, { tel: v })} />
            </div>
          ))}
        </div>
        <TextField label="Lien WhatsApp (https://wa.me/…)" value={ct.whatsapp} onChange={(v) => setContact({ whatsapp: v })} />
      </Group>

      <Group title="Localisation & horaires">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ville" value={ct.city} onChange={(v) => setContact({ city: v })} />
          <TextField label="Pays" value={ct.country} onChange={(v) => setContact({ country: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Adresse / position complète" value={ct.location} onChange={(v) => setContact({ location: v })} />
          <TextField label="Horaires" value={ct.hours} onChange={(v) => setContact({ hours: v })} />
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Bannières & Vidéos                                          */
/* ------------------------------------------------------------------ */
type BannerDraft = {
  kind: "image" | "video";
  media: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  position: Banner["position"];
};

const EMPTY_BANNER: BannerDraft = {
  kind: "image",
  media: "",
  title: "",
  subtitle: "",
  cta: "Démarrer un projet",
  ctaLink: "#contact",
  position: "top",
};

const POSITIONS: { value: Banner["position"]; label: string }[] = [
  { value: "top", label: "Après l'accueil" },
  { value: "middle", label: "Après les réalisations" },
  { value: "bottom", label: "Après l'agence" },
];

function BannieresTab({ notify }: { notify: (m: string) => void }) {
  const c = useContent();
  const [f, setF] = useState({ ...EMPTY_BANNER });
  const [err, setErr] = useState("");
  const pending = usePending();

  const add = () => {
    /* Le média téléversé (en attente) est utilisé tel quel. */
    const staged = pending.find((p) => p.key.startsWith("banner-draft"));
    const rawMedia = (f.media.trim() || (staged ? staged.value : "")).trim();
    const media =
      f.kind === "video" && !/^(data:|blob:)/.test(rawMedia)
        ? normalizeVideoInput(rawMedia)
        : rawMedia;
    /* Fichier téléversé (data:) ou URL distante (https:) acceptés. */
    if (!media || !/^(https?:\/\/|data:|blob:)\S/.test(media)) {
      setErr("Ajoutez une image ou une vidéo : téléversez un fichier ou collez son URL.");
      return;
    }
    if (f.title.trim().length < 2) {
      setErr("Le titre est requis.");
      return;
    }
    const saved = addBanner({
      kind: f.kind,
      media,
      title: f.title.trim(),
      subtitle: f.subtitle.trim(),
      cta: f.cta.trim(),
      ctaLink: f.ctaLink.trim() || "#contact",
      position: f.position,
    });
    if (staged) unstageMedia(staged.key);
    setF({ ...EMPTY_BANNER });
    setErr("");
    notify(
      saved
        ? "Bannière publiée sur le site public."
        : "Bannière affichée, mais mémoire saturée : utilisez une URL d'image plutôt qu'un fichier lourd.",
    );
  };

  return (
    <div className="space-y-6">
      <Group title="Nouvelle bannière" desc="Publiée immédiatement sur le site public, à l'emplacement choisi.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Emplacement</label>
            <select
              value={f.position}
              onChange={(e) => setF({ ...f, position: e.target.value as Banner["position"] })}
              className={inputCls}
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value} className="bg-ink-2">{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Type de média</label>
            <div className="grid grid-cols-2 gap-2">
              {(["image", "video"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setF({ ...f, kind: k })}
                  data-cursor="link"
                  className={cn(
                    "rounded-xl border px-3 py-3 text-[10.5px] uppercase tracking-[0.14em] transition-all duration-300",
                    f.kind === k
                      ? "border-rouge bg-rouge/15 text-white"
                      : "border-white/12 text-white/50 hover:border-white/35",
                  )}
                >
                  {k === "image" ? "Image" : "Vidéo"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <MediaField
          label={f.kind === "video" ? "Vidéo (mp4, lien Vimeo ou code d'intégration)" : "Image (haute définition)"}
          uid={`banner-draft-${f.kind}`}
          kind={f.kind}
          value={f.media}
          notify={notify}
          onChange={(v) => {
            setF({ ...f, media: v });
            setErr("");
          }}
        />
        <TextField
          label="Titre"
          value={f.title}
          onChange={(v) => {
            setF({ ...f, title: v });
            setErr("");
          }}
        />
        <TextField label="Sous-titre" textarea value={f.subtitle} onChange={(v) => setF({ ...f, subtitle: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Libellé du bouton (vide = aucun bouton)" value={f.cta} onChange={(v) => setF({ ...f, cta: v })} />
          <TextField label="Lien du bouton" value={f.ctaLink} onChange={(v) => setF({ ...f, ctaLink: v })} placeholder="#contact, #realisations, https://…" />
        </div>

        {err && <p className="text-[11px] text-rouge">{err}</p>}

        <button
          type="button"
          onClick={add}
          data-cursor="link"
          className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white"
        >
          <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter la bannière
          </span>
        </button>
      </Group>

      <section>
        <h3 className="mb-4 font-display text-xl uppercase">
          Bannières actives <span className="text-rouge">({c.banners.length})</span>
        </h3>
        {c.banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/40">
            Aucune bannière — le site est au format standard.
          </div>
        ) : (
          <div className="space-y-4">
            {c.banners.map((b) => (
              <div key={b.id} className="flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-ink-2/60 p-3">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                  {b.kind === "video" && parseVideoSource(b.media)?.type === "vimeo" ? (
                    <>
                      <span className="absolute inset-0 bg-gradient-to-br from-ink to-ink-3" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rouge">
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                      <span className="absolute bottom-1 left-1 rounded bg-ink/85 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white">
                        Vimeo
                      </span>
                    </>
                  ) : b.kind === "video" ? (
                    <>
                      <video src={b.media} muted preload="metadata" playsInline className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rouge">
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5 fill-white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    </>
                  ) : (
                    <img src={b.media} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base uppercase">{b.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {POSITIONS.find((p) => p.value === b.position)?.label} ·{" "}
                    {b.kind === "video"
                      ? parseVideoSource(b.media)?.type === "vimeo"
                        ? "Vidéo Vimeo"
                        : "Vidéo"
                      : "Image"}
                  </p>
                </div>
                <DeleteBtn label="Supprimer la bannière" onDelete={() => { removeBanner(b.id); notify("Bannière retirée du site."); }} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Sauvegarde                                                  */
/* ------------------------------------------------------------------ */
function SauvegardeTab({
  user,
  notify,
}: {
  user: Account;
  notify: (m: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [paste, setPaste] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const doImport = (json: string) => {
    if (importJSON(json)) {
      setPaste("");
      notify("Sauvegarde importée — site mis à jour.");
    } else {
      notify("Fichier invalide : import annulé.");
    }
  };

  return (
    <div className="space-y-6">
      <Group
        title="Exporter le site"
        desc="Téléchargez l'intégralité du contenu (textes, images, projets, bannières…) en un fichier JSON. Gardez-le précieusement."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              download(`doxa-studio-${new Date().toISOString().slice(0, 10)}.json`, exportJSON());
              notify("Sauvegarde téléchargée.");
            }}
            data-cursor="link"
            className="group relative overflow-hidden rounded-full bg-rouge px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">Télécharger la sauvegarde</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportJSON());
                notify("Contenu copié dans le presse-papiers.");
              } catch {
                notify("Copie impossible dans ce navigateur.");
              }
            }}
            data-cursor="link"
            className="rounded-full border border-white/20 px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70 hover:border-white/50 hover:text-white"
          >
            Copier le JSON
          </button>
        </div>
      </Group>

      <Group
        title="Importer une sauvegarde"
        desc="Restaure un contenu précédemment exporté. Remplace tout le contenu actuel."
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          data-cursor="link"
          className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-white/40 transition-colors hover:border-rouge hover:text-rouge"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.18em]">Choisir un fichier .json</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => doImport(String(r.result ?? ""));
            r.readAsText(f);
            e.target.value = "";
          }}
        />
        <textarea
          rows={4}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="…ou collez ici un JSON précédemment copié"
          className={cn(inputCls, "resize-none font-mono text-xs")}
        />
        <button
          type="button"
          disabled={!paste.trim()}
          onClick={() => doImport(paste)}
          data-cursor="link"
          className="rounded-full border border-rouge/60 px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-rouge transition-all duration-300 hover:bg-rouge hover:text-white disabled:opacity-40"
        >
          Importer ce contenu
        </button>
      </Group>

      {canDangerZone(user.role) ? (
        <Group title="Zone dangereuse" desc="Réinitialise TOUT le site (textes, images, projets, logo, bannières) aux contenus d'origine. Irréversible — exportez d'abord !">
          <button
            type="button"
            onClick={() => {
              if (!confirm) {
                setConfirm(true);
                window.setTimeout(() => setConfirm(false), 4000);
                return;
              }
              resetContent();
              setConfirm(false);
              notify("Site entièrement réinitialisé.");
            }}
            className={cn(
              "rounded-full border px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300",
              confirm ? "border-rouge bg-rouge text-white" : "border-white/20 text-white/60 hover:border-rouge hover:text-rouge",
            )}
          >
            {confirm ? "Cliquez pour confirmer !" : "Tout réinitialiser"}
          </button>
        </Group>
      ) : (
        <Group title="Zone dangereuse" desc="Réserve au super admin (Admin/Jaures).">
          <p className="flex items-center gap-2 text-xs text-white/35">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            Réinitialisation du site réservée au super admin.
          </p>
        </Group>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Comptes (base de données + rôles)                          */
/* ------------------------------------------------------------------ */
function ComptesTab({ user, notify }: { user: Account; notify: (m: string) => void }) {
  const users = useUsers();
  const [open, setOpen] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const assignable = assignableRoles(user.role);
  const canDelete = canDeleteAccounts(user.role);

  const submit = () => {
    const res = createAccount(pseudo, email, pass, role);
    if (!res.ok) {
      notify(res.error);
      return;
    }
    notify(`Compte créé : ${res.account.pseudo} (${ROLE_LABELS[role]}).`);
    setPseudo("");
    setEmail("");
    setPass("");
    setRole("editor");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <Group
        title={`Comptes de la base (${users.length})`}
        desc="Chaque compte se connecte avec son email et son mot de passe. Le super admin gère tout, le manager crée des comptes éditeurs, l'éditeur ne voit pas cet onglet."
        action={
          <AddBtn
            label={open ? "Fermer" : "Créer un compte"}
            onClick={() => setOpen((v) => !v)}
          />
        }
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mb-4 space-y-3 rounded-xl border border-rouge/40 bg-rouge/[0.05] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Pseudo" value={pseudo} onChange={setPseudo} placeholder="Ex. : Marie / Design" />
                  <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="marie@gmail.com" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Mot de passe (6 car. min)" value={pass} onChange={setPass} placeholder="••••••••" />
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">Rôle</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className={cn(inputCls, "appearance-none")}
                    >
                      {assignable.map((r) => (
                        <option key={r} value={r} className="bg-ink-2">
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                    {user.role === "manager" && (
                      <p className="mt-1.5 text-[10.5px] text-white/35">
                        En tant que manager, vous ne pouvez créer que des comptes éditeurs.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={submit}
                  data-cursor="link"
                  className="group relative w-full overflow-hidden rounded-full bg-rouge px-6 py-3 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white"
                >
                  <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 group-hover:translate-y-0" />
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
                    Créer le compte
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-ink p-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rouge/15 font-display text-lg text-rouge">
                {u.pseudo.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{u.pseudo}</span>
                  {u.system && (
                    <span className="shrink-0 rounded-full border border-rouge/50 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-rouge">
                      Protégé
                    </span>
                  )}
                </p>
                <p className="truncate text-[11px] text-white/40">{u.email}</p>
              </div>
              <select
                value={u.role}
                disabled={u.system || user.role !== "super"}
                onChange={(e) => {
                  if (setAccountRole(u.id, e.target.value as Role)) {
                    notify(`Rôle de ${u.pseudo} → ${ROLE_LABELS[e.target.value as Role]}.`);
                  }
                }}
                className={cn(
                  "shrink-0 rounded-lg border border-white/15 bg-ink-2 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/80",
                  (u.system || user.role !== "super") && "opacity-50",
                )}
              >
                {(u.system ? [u.role] : (["super", "manager", "editor"] as Role[])).map((r) => (
                  <option key={r} value={r} className="bg-ink-2">
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              {canDelete ? (
                u.system ? (
                  <span className="flex h-8 w-8 items-center justify-center text-white/20" title="Compte fondamental">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </span>
                ) : (
                  <DeleteBtn
                    label="Supprimer le compte"
                    onDelete={() => {
                      if (deleteAccount(u.id)) notify(`Compte ${u.pseudo} supprimé.`);
                    }}
                  />
                )
              ) : (
                <span className="flex h-8 w-8 items-center justify-center text-white/20" title="Suppression réservée au super admin">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </Group>

      <Group title="Niveaux d'accès" desc="Qui peut faire quoi sur le site.">
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <div
              key={r}
              className={cn(
                "rounded-xl border p-4",
                r === "super" ? "border-rouge/60 bg-rouge/[0.06]" : "border-white/10 bg-ink",
              )}
            >
              <p className={cn("font-display text-lg uppercase", r === "super" ? "text-rouge" : "text-white/85")}>
                {ROLE_LABELS[r]}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/45">{ROLE_DESC[r]}</p>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : En ligne (synchronisation cloud)                           */
/* ------------------------------------------------------------------ */
function CloudTab({ notify }: { notify: (m: string) => void }) {
  const status = useCloudStatus();
  const url = getCloudUrl();
  const [auto, setAuto] = useState(getAutoSave());
  const [confirmPull, setConfirmPull] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proformaConfig, setProformaConfig] = useState<ProformaConfig>(
    () => getProformaConfig() ?? { supabaseUrl: "", anonKey: "" },
  );
  const [functionTest, setFunctionTest] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const fmtTime = (t: number) =>
    new Date(t).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const doSave = async () => {
    const res = await pushCloud();
    notify(
      res.ok
        ? "Tout le site est enregistré en ligne."
        : "Échec de l'enregistrement : " + (res.error ?? "erreur réseau"),
    );
  };

  const doPull = async () => {
    if (!confirmPull) {
      setConfirmPull(true);
      window.setTimeout(() => setConfirmPull(false), 3500);
      return;
    }
    setConfirmPull(false);
    const res = await pullCloud();
    notify(
      res.ok
        ? "Version en ligne chargée sur cet appareil."
        : "Chargement impossible : " + (res.error ?? "erreur réseau"),
    );
  };

  const hasProformaConfig = Boolean(proformaConfig.supabaseUrl && proformaConfig.anonKey);
  const scriptLines = [
    ...(url ? [`window.DOXA_SYNC = ${JSON.stringify(url)};`] : []),
    ...(hasProformaConfig
      ? [`window.DOXA_PROFORMA = ${JSON.stringify(proformaConfig)};`]
      : []),
  ];
  const snippet = scriptLines.length ? `<script>${scriptLines.join(" ")}</script>` : "";

  const saveProformaSettings = () => {
    const normalized = {
      supabaseUrl: proformaConfig.supabaseUrl.trim().replace(/\/+$/, ""),
      anonKey: proformaConfig.anonKey.trim(),
    };
    if (!/^https:\/\/.+\.supabase\.co$/.test(normalized.supabaseUrl)) {
      notify("URL Supabase invalide. Format attendu : https://votre-projet.supabase.co");
      return;
    }
    if (normalized.anonKey.length < 20) {
      notify("Clé anon/publishable invalide ou incomplète.");
      return;
    }
    setProformaConfig(normalized);
    saveProformaConfig(normalized);
    setFunctionTest("idle");
    notify("Configuration pro forma enregistrée sur cet appareil.");
  };

  const testProformaFunction = async () => {
    setFunctionTest("testing");
    try {
      const result = await callProforma<{ ok: boolean; configured?: boolean }>({ action: "health" });
      setFunctionTest(result.ok ? "ok" : "error");
      notify(result.ok ? "Fonction devis joignable. Vérifiez aussi l'adresse d'envoi Resend." : "Fonction devis non configurée.");
    } catch (e) {
      setFunctionTest("error");
      notify(e instanceof Error ? e.message : "Fonction devis inaccessible.");
    }
  };

  return (
    <div className="space-y-6">
      <Group
        title="Enregistrement en ligne"
        desc="Contenu du site, comptes, projets publiés et thème : tout est envoyé vers une adresse en ligne. Le site publié la charge à chaque ouverture."
      >
        {/* État */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3.5",
            status.state === "saved"
              ? "border-[#28c840]/40 bg-[#28c840]/[0.06]"
              : status.state === "error"
                ? "border-rouge/40 bg-rouge/[0.06]"
                : "border-white/10 bg-ink",
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 shrink-0 rounded-full",
              status.state === "saved" && "bg-[#28c840]",
              status.state === "saving" && "animate-pulse bg-rouge",
              status.state === "error" && "bg-rouge",
              status.state === "offline" && "bg-white/25",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {status.state === "saved" && "Connecté en ligne"}
              {status.state === "saving" && status.label}
              {status.state === "error" && "Erreur de synchronisation"}
              {status.state === "offline" && "Hors ligne"}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/40">
              {status.state === "saved" &&
                `Dernier enregistrement à ${fmtTime(status.at)} — ${status.url}`}
              {status.state === "offline" &&
                "Les modifications restent sur cet appareil uniquement."}
              {status.state === "error" && status.message}
              {status.state === "saving" && "Veuillez patienter…"}
            </p>
          </div>
          {status.state === "saving" && (
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-rouge" />
          )}
        </div>

        <button
          onClick={() => void doSave()}
          disabled={status.state === "saving"}
          data-cursor="link"
          className="group relative w-full overflow-hidden rounded-full bg-rouge px-8 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white disabled:opacity-70"
        >
          <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center justify-center gap-3 transition-colors duration-300 group-hover:text-ink">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19a4.5 4.5 0 100-9 6 6 0 00-11.3 1.5A4 4 0 007 19z" />
              <path d="M12 12v6M9.5 14.5L12 12l2.5 2.5" />
            </svg>
            {status.state === "saving" ? "Enregistrement…" : "Enregistrer en ligne"}
          </span>
        </button>

        {/* Sauvegarde automatique */}
        <button
          onClick={() => {
            const v = !auto;
            setAuto(v);
            setAutoSave(v);
            notify(v ? "Sauvegarde automatique activée." : "Sauvegarde automatique désactivée.");
          }}
          data-cursor="link"
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink px-4 py-3.5 text-left"
        >
          <span>
            <span className="block text-sm font-semibold">Sauvegarde automatique</span>
            <span className="mt-0.5 block text-[11px] text-white/40">
              Envoie les modifications en ligne ~6 s après chaque changement.
            </span>
          </span>
          <span
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
              auto ? "bg-rouge" : "bg-white/15",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300",
                auto ? "left-[22px]" : "left-0.5",
              )}
            />
          </span>
        </button>
      </Group>

      <Group
        title="Demandes de devis et factures pro forma"
        desc="Connectez un projet Supabase pour recevoir les demandes clients, recevoir un lien de validation par email, chiffrer le devis et envoyer automatiquement le PDF définitif."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="URL du projet Supabase"
            value={proformaConfig.supabaseUrl}
            onChange={(v) => {
              setProformaConfig((c) => ({ ...c, supabaseUrl: v }));
              setFunctionTest("idle");
            }}
            placeholder="https://votre-projet.supabase.co"
          />
          <TextField
            label="Clé publique anon / publishable"
            value={proformaConfig.anonKey}
            onChange={(v) => {
              setProformaConfig((c) => ({ ...c, anonKey: v }));
              setFunctionTest("idle");
            }}
            placeholder="sb_publishable_… ou eyJ…"
          />
        </div>
        <p className="text-[10.5px] leading-relaxed text-white/40">
          La clé publishable/anon est publique et peut être intégrée au site. Ne collez jamais ici la clé service_role ni la clé secrète Resend.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveProformaSettings}
            data-cursor="link"
            className="rounded-full bg-rouge px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-rouge-deep"
          >
            Enregistrer la configuration
          </button>
          <button
            type="button"
            onClick={() => void testProformaFunction()}
            disabled={functionTest === "testing"}
            data-cursor="link"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/45 hover:text-white disabled:opacity-50"
          >
            {functionTest === "testing" && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-rouge" />}
            {functionTest === "ok" ? "Fonction joignable" : functionTest === "testing" ? "Test…" : "Tester la fonction"}
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-ink p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">Activation serveur — à faire une fois</p>
          <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-white/55">
            <li>1. Créez un projet Supabase et exécutez <code className="text-white">supabase/migrations/20260929000000_proforma_requests.sql</code> dans le SQL Editor.</li>
            <li>2. Déployez <code className="text-white">supabase/functions/proforma</code> avec le CLI Supabase : <code className="text-white">supabase functions deploy proforma --no-verify-jwt</code>.</li>
            <li>3. Dans Resend, vérifiez votre domaine d'expédition et créez une clé API.</li>
            <li>4. Ajoutez les secrets ci-dessous dans Supabase → Edge Functions → Secrets.</li>
          </ol>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-white/65">{`RESEND_API_KEY=re_...\nRESEND_FROM_EMAIL=Doxa Studio <devis@votredomaine.ci>\nDOXA_ADMIN_EMAIL=gondodanjaures@gmail.com\nDOXA_SITE_URL=https://votre-site.ci\nSUPABASE_SERVICE_ROLE_KEY=... (serveur uniquement)`}</pre>
          <p className="mt-2 text-[10px] leading-relaxed text-white/35">La clé service_role et la clé Resend restent côté Supabase — elles ne sont jamais placées dans le navigateur.</p>
        </div>
      </Group>

      {(url || hasProformaConfig) && (
        <Group
          title="Activer sur le site publié"
          desc="Collez ce bloc une seule fois dans le index.html de votre hébergement, avant </body>. Il active la synchro du site et le formulaire de demande de devis."
        >
          <ol className="space-y-2.5 text-[12.5px] leading-relaxed text-white/55">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rouge font-display text-[10px] text-white">1</span>
              Enregistrez vos paramètres ci-dessus puis copiez le bloc ci-dessous.
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rouge font-display text-[10px] text-white">2</span>
              Le code contient l'URL publique Supabase et sa clé publishable uniquement.
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rouge font-display text-[10px] text-white">3</span>
              Collez-le dans le fichier <span className="text-white">index.html</span> de votre
              hébergement, juste avant <span className="text-white">&lt;/body&gt;</span>.
            </li>
          </ol>

          <div className="flex items-stretch gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-xl border border-white/15 bg-ink px-4 py-3.5 font-mono text-[11.5px] text-rouge">
              {snippet}
            </code>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(snippet);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1800);
                } catch {
                  notify("Copie impossible dans ce navigateur.");
                }
              }}
              data-cursor="link"
              className={cn(
                "shrink-0 rounded-xl border px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-300",
                copied
                  ? "border-[#28c840] text-[#28c840]"
                  : "border-white/20 text-white/70 hover:border-rouge hover:text-rouge",
              )}
            >
              {copied ? "Copié" : "Copier"}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-ink p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">
              Méthode permanente — Netlify (recommandée)
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-white/55">
              Pour que vos modifications survivent à tous les déploiements, créez ces deux
              variables dans <span className="text-white">Netlify → Site settings → Environment variables</span>,
              puis relancez un déploiement. Elles sont injectées dans chaque build :
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-white/65">{`VITE_DOXA_SYNC = https://jsonblob.com/api/jsonBlob/VOTRE_ID
VITE_DOXA_PROFORMA = {"supabaseUrl":"https://zhvwgdxoevntgeyypotf.supabase.co","anonKey":"sb_publishable_..."}`}</pre>
            <p className="mt-2 text-[10px] leading-relaxed text-white/35">
              Le VOTRE_ID est la fin de l'URL créée par « Enregistrer en ligne » ci-dessus.
              Le site chargé en ligne devient alors la source unique : mêmes contenus sur tous
              les appareils, et chaque modification du dashboard est poussée en ligne ~6 s
              après. Testez toujours sur le domaine principal du site (pas sur les URLs
              « Deploy Preview » qui changent à chaque déploiement).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => void doPull()}
              data-cursor="link"
              className="rounded-full border border-white/20 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-white/50 hover:text-white"
            >
              Recharger depuis le cloud
            </button>
            <button
              onClick={() => {
                setCloudUrl(null);
                notify("Cet appareil est déconnecté du cloud.");
              }}
              data-cursor="link"
              className={cn(
                "rounded-full border px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300",
                confirmPull
                  ? "border-rouge bg-rouge text-white"
                  : "border-rouge/40 text-rouge hover:bg-rouge hover:text-white",
              )}
            >
              {confirmPull ? "Confirmer ?" : "Déconnecter cet appareil"}
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-white/35">
            Sur cet appareil, la synchronisation est déjà active : les
            modifications s'envient seules et le site charge la dernière
            version en ligne à chaque ouverture.
          </p>
        </Group>
      )}

      {!url && (
        <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-[12.5px] leading-relaxed text-white/40">
          Aucun cloud n'est lié à cet appareil : cliquez sur « Enregistrer en
          ligne » pour créer automatiquement votre adresse.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Guide des dimensions                                      */
/* ------------------------------------------------------------------ */
function FormatsTab() {
  return (
    <div className="space-y-6">
      <Group
        title="Guide des formats"
        desc="Fiche technique pour le web designer. Respecter ces dimensions garantit des images nettes, bien cadrées et rapides à charger."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {MEDIA_GUIDE.map((spec, i) => (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-ink p-5"
            >
              <span className="absolute right-3 top-3 font-display text-3xl text-white/[0.06]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-display text-xl uppercase text-white/90">{spec.title}</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-white/40">{spec.use}</p>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[8.5px] uppercase tracking-[0.18em] text-rouge">Ideal</p>
                  <p className="mt-1 font-display text-2xl uppercase">{spec.recommended}</p>
                  <p className="text-[10px] text-white/40">{spec.ratio}</p>
                </div>
                <svg viewBox="0 0 64 48" className="h-12 w-16 shrink-0 text-rouge" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="2" width="60" height="44" rx="4" />
                  <circle cx="47" cy="13" r="4" />
                  <path d="M7 39l14-14 8 8 8-11 20 17" />
                </svg>
              </div>
              <div className="mt-4 space-y-1.5 text-[10.5px] text-white/50">
                <p><span className="text-white/75">Autres :</span> {spec.alternatives}</p>
                <p><span className="text-white/75">Minimum :</span> {spec.minimum}</p>
                <p><span className="text-white/75">Export :</span> {spec.formats}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Group>

      <Group title="Regles d'export" desc="A transmettre au graphiste avant la preparation des medias.">
        <div className="grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Couleurs", "sRGB pour toutes les images web"],
            ["Compression", "Qualite 80-85 %, sans metadata lourde"],
            ["Nommage", "minuscules-sans-espace.webp"],
            ["Retina", "Toujours exporter au moins 2x la taille affichee"],
          ].map(([title, text]) => (
            <div key={title} className="bg-ink p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rouge">{title}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/50">{text}</p>
            </div>
          ))}
        </div>
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onglet : Devis & Factures pro forma (validation super admin)        */
/* ------------------------------------------------------------------ */
const defaultValid = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

function DevisTab({ notify }: { notify: (m: string) => void }) {
  const quotes = useQuotes();
  const { contact } = useContent();
  const [filter, setFilter] = useState<"pending" | "sent">("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [descs, setDescs] = useState<Record<string, string>>({});
  const [validUntil, setValidUntil] = useState(defaultValid);
  const [preview, setPreview] = useState<Quote | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const open = quotes.find((q) => q.id === openId) ?? null;
  const list = quotes.filter((q) => q.status === filter);

  useEffect(() => {
    if (!open) return;
    const a: Record<string, string> = {};
    const d: Record<string, string> = {};
    for (const need of open.needs) {
      const p = open.prices.find((x) => x.label === need);
      a[need] = p ? String(p.amount) : "";
      d[need] = p?.description ?? "";
    }
    setAmounts(a);
    setDescs(d);
    setValidUntil(open.validUntil || defaultValid());
  }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = open
    ? open.needs.reduce((sum, n) => sum + (Number(amounts[n]) || 0), 0)
    : 0;
  const pendingCount = quotes.filter((q) => q.status === "pending").length;

  const validate = () => {
    if (!open) return;
    const missing = open.needs.filter((n) => !(Number(amounts[n]) > 0));
    if (missing.length) {
      notify(`Renseignez un montant pour : ${missing.join(", ")}.`);
      return;
    }
    const prices = open.needs.map((label) => ({
      label,
      description: descs[label]?.trim() || "Prestation selon le brief validé",
      amount: Math.round(Number(amounts[label])),
    }));
    const sum = prices.reduce((s, p) => s + p.amount, 0);
    const updated: Quote = {
      ...open,
      prices,
      total: sum,
      validUntil,
      status: "sent",
      sentAt: Date.now(),
    };
    updateQuote(open.id, updated);
    setPreview(updated);
    notify(`Facture ${open.number} validée — prête à être envoyée au client.`);
  };

  const mailtoLink = (q: Quote) => {
    const body = [
      `Bonjour ${q.name},`,
      "",
      `Veuillez trouver ci-joint la facture pro forma ${q.number} du ${dateFR(q.createdAt)}.`,
      "",
      "Prestations :",
      ...q.prices.map(
        (p) => `• ${p.label} : ${fcfa(p.amount)}${p.description ? ` — ${p.description}` : ""}`,
      ),
      "",
      `Total : ${fcfa(q.total)}`,
      `Valable jusqu'au ${q.validUntil}`,
      "",
      "Pour confirmer le démarrage du projet, répondez simplement à cet email.",
      "",
      "Cordialement,",
      "Doxa Studio — Abidjan, Côte d'Ivoire",
      contact.email,
    ].join("\n");
    return `mailto:${q.email}?subject=${encodeURIComponent(
      `Facture pro forma ${q.number} — Doxa Studio`,
    )}&body=${encodeURIComponent(body)}`;
  };

  /* --------------------------- Aperçu facture ---------------------- */
  if (preview) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#28c840]">
              Facture validée
            </p>
            <h2 className="mt-1 font-display text-3xl uppercase">
              {preview.number} — {fcfa(preview.total)}
            </h2>
          </div>
          <button
            onClick={() => {
              setPreview(null);
              setOpenId(null);
              setFilter("sent");
            }}
            data-cursor="link"
            className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65 hover:border-white/45 hover:text-white"
          >
            Retour aux devis
          </button>
        </div>

        <ProformaSheet quote={preview} mode="final" />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            data-cursor="link"
            className="group relative overflow-hidden rounded-full bg-rouge px-7 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white"
          >
            <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 group-hover:translate-y-0" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-ink">
              Imprimer / Enregistrer en PDF
            </span>
          </button>
          <a
            href={mailtoLink(preview)}
            data-cursor="link"
            className="group relative overflow-hidden rounded-full border border-white/20 px-7 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:border-white/45 hover:text-white"
          >
            Envoyer par email au client
          </a>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(mailtoLink(preview).replace(/^mailto:[^?]*\?/, ""));
                notify("Contenu de l'email copié.");
              } catch {
                notify("Copie impossible dans ce navigateur.");
              }
            }}
            data-cursor="link"
            className="rounded-full border border-white/15 px-7 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/50 hover:text-white"
          >
            Copier le texte de l'email
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-white/35">
          Étapes : imprimez la facture en PDF, puis envoyez-la par email avec le bouton ci-dessus
          (joignez le PDF dans votre messagerie). Votre service d'email automatique peut être
          branché plus tard depuis l'onglet « En ligne ».
        </p>
      </div>
    );
  }

  /* ------------------------------ Éditeur -------------------------- */
  if (open) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rouge">
              Demande à chiffrer
            </p>
            <h2 className="mt-1 font-display text-3xl uppercase">{open.number}</h2>
            <p className="mt-1 text-[11px] text-white/40">
              Reçue le {dateFR(open.createdAt)} · {open.name} · {open.email}
            </p>
          </div>
          <button
            onClick={() => setOpenId(null)}
            data-cursor="link"
            className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65 hover:border-white/45 hover:text-white"
          >
            Fermer
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-ink p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">
                Client
              </p>
              <p className="mt-2 font-semibold">{open.name}</p>
              {open.company && <p className="text-[12px] text-white/45">{open.company}</p>}
              <p className="text-[11px] text-white/55">{open.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">
                Intention du projet
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-white/75">
                {open.intention}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">
                Expertises demandées
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {open.needs.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-rouge/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-rouge"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rouge/25 bg-ink-2 p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rouge">
              Votre chiffrage
            </p>
            <div className="mt-4 space-y-3">
              {open.needs.map((need) => (
                <div key={need} className="rounded-xl border border-white/10 bg-ink p-3.5">
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                    {need}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={amounts[need] ?? ""}
                    onChange={(e) => setAmounts((c) => ({ ...c, [need]: e.target.value }))}
                    placeholder="Montant en FCFA"
                    className={inputCls}
                  />
                  <input
                    value={descs[need] ?? ""}
                    onChange={(e) => setDescs((c) => ({ ...c, [need]: e.target.value }))}
                    placeholder="Détail inclus (optionnel)"
                    className="mt-2 w-full border-0 bg-transparent px-1 py-1.5 text-[11px] text-white/60 outline-none placeholder:text-white/25"
                  />
                </div>
              ))}
            </div>

            <label className="mt-4 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
              Valable jusqu'au
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={cn(inputCls, "mt-2 [color-scheme:dark]")}
            />

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Total pro forma
              </span>
              <span className="font-display text-2xl text-rouge">
                {fcfa(total)}
              </span>
            </div>

            <button
              onClick={validate}
              data-cursor="link"
              className="group relative mt-5 w-full overflow-hidden rounded-full bg-rouge px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
            >
              <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 group-hover:translate-y-0" />
              <span className="relative z-10 group-hover:text-ink">
                Valider et générer la facture
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- Liste --------------------------- */
  return (
    <div className="space-y-5">
      <Group
        title={`Demandes de devis (${quotes.length})`}
        desc="Les intentions envoyées depuis le formulaire du site arrivent ici. Ouvrez une demande, fixez les prix, validez : la facture pro forma est générée."
        action={
          <div className="flex gap-2">
            <GhostBtn
              label={filter === "pending" ? `En attente (${pendingCount})` : "En attente"}
              onClick={() => setFilter("pending")}
            />
            <GhostBtn
              label={filter === "sent" ? "Envoyées" : `Envoyées (${quotes.length - pendingCount})`}
              onClick={() => setFilter("sent")}
            />
          </div>
        }
      >
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">
            <p className="font-display text-2xl uppercase text-white/50">
              {filter === "pending" ? "Aucune demande en attente" : "Aucune facture envoyée"}
            </p>
            <p className="mt-2 text-sm text-white/35">
              {filter === "pending"
                ? "Les intentions soumises depuis le site apparaîtront ici automatiquement."
                : "Les factures validées apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((q) => (
              <div
                key={q.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-ink p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg uppercase">{q.number}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.14em]",
                        q.status === "pending"
                          ? "border-rouge/50 bg-rouge/10 text-rouge"
                          : "border-[#28c840]/50 bg-[#28c840]/10 text-[#28c840]",
                      )}
                    >
                      {q.status === "pending" ? "À chiffrer" : `Envoyée — ${fcfa(q.total)}`}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-white/55">
                    {q.name}
                    {q.company && ` · ${q.company}`} · {q.email}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/35">{q.intention}</p>
                  <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.16em] text-white/30">
                    {dateFR(q.createdAt)} · {q.needs.join(", ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setOpenId(q.id)}
                    data-cursor="link"
                    className="rounded-full bg-rouge px-5 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-rouge-deep"
                  >
                    {q.status === "pending" ? "Chiffrer" : "Voir la facture"}
                  </button>
                  {confirmDel === q.id ? (
                    <button
                      onClick={() => {
                        removeQuote(q.id);
                        setConfirmDel(null);
                        notify("Demande supprimée.");
                      }}
                      data-cursor="link"
                      className="rounded-full border border-rouge bg-rouge px-4 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white"
                    >
                      Confirmer
                    </button>
                  ) : (
                    <DeleteBtn
                      label="Supprimer la demande"
                      onDelete={() => {
                        setConfirmDel(q.id);
                        window.setTimeout(() => setConfirmDel(null), 3500);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Group>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page Administration                                                  */
/* ------------------------------------------------------------------ */
type TabId =
  | "accueil"
  | "projets"
  | "services"
  | "showreel"
  | "agence"
  | "fondateur"
  | "methode"
  | "identite"
  | "textes"
  | "coordonnees"
  | "bannieres"
  | "formats"
  | "devis"
  | "comptes"
  | "cloud"
  | "sauvegarde";

const TABS: { id: TabId; label: string }[] = [
  { id: "accueil", label: "Accueil" },
  { id: "projets", label: "Réalisations" },
  { id: "services", label: "Expertises" },
  { id: "showreel", label: "Showreel" },
  { id: "agence", label: "Agence" },
  { id: "fondateur", label: "Fondateur" },
  { id: "methode", label: "Méthode & Avis" },
  { id: "identite", label: "Logo" },
  { id: "textes", label: "Textes" },
  { id: "coordonnees", label: "Coordonnées" },
  { id: "bannieres", label: "Bannières" },
  { id: "formats", label: "Guide formats" },
  { id: "devis", label: "Devis & Factures" },
  { id: "comptes", label: "Comptes" },
  { id: "cloud", label: "En ligne" },
  { id: "sauvegarde", label: "Sauvegarde" },
];

/* ------------------------------------------------------------------ */
/* Barre « Enregistrer » + overlay de synchronisation                   */
/* ------------------------------------------------------------------ */
function SaveBar({ notify }: { notify: (m: string) => void }) {
  const pending = usePending();
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const doSave = async () => {
    if (saving) return;
    const items = commitPending();
    if (!items.length) return;
    setSaving(true);
    setProgress(0);
    const n = items.length;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < n; i++) {
      items[i].apply();
      setProgress(Math.round(((i + 0.5) / n) * 100));
      await sleep(240);
    }
    setProgress(100);
    await sleep(400);
    setSaving(false);
    setProgress(0);
    notify(
      n === 1
        ? "Média enregistré — le site est à jour."
        : `${n} médias enregistrés — le site est à jour.`,
    );
  };

  const doDiscard = () => {
    discardPending();
    notify("Modifications annulées — le site n'a pas été modifié.");
  };

  return (
    <>
      <AnimatePresence>
        {pending.length > 0 && !saving && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 z-[140] flex items-center gap-2 rounded-full border border-rouge/50 bg-ink-2/95 py-2.5 pl-4 pr-2.5 shadow-2xl shadow-rouge/20 backdrop-blur-xl sm:gap-3 sm:pl-5 sm:pr-3"
          >
            <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rouge font-display text-[11px] text-white">
                {pending.length}
              </span>
              <span className="hidden md:inline">
                {pending.length > 1 ? "médias en attente" : "média en attente"}
              </span>
            </span>
            <button
              onClick={doDiscard}
              data-cursor="link"
              className="rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={doSave}
              data-cursor="link"
              className="group relative overflow-hidden rounded-full bg-rouge px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            >
              <span className="absolute inset-0 -translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-ink">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
                Enregistrer
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[190] flex flex-col items-center justify-center bg-ink/92 backdrop-blur-md"
          >
            <p className="font-display text-4xl uppercase">
              Enregistrement<span className="text-rouge">…</span>
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.26em] text-white/50">
              Synchronisation du site
            </p>
            <div className="mt-9 h-[6px] w-72 overflow-hidden rounded-full bg-white/10 sm:w-96">
              <div
                className="h-full rounded-full bg-rouge transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 font-display text-lg text-white/70">{progress}%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Admin({
  user,
  onBack,
  onBackSite,
  onLogout,
}: {
  user: Account;
  onBack: () => void;
  onBackSite: () => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<TabId>("accueil");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3000);
  };
  const cloud = useCloudStatus();

  /* Les onglets dépendent du rôle du compte connecté. */
  const tabs = TABS.filter((t) => {
    if (t.id === "comptes") return canManageAccounts(user.role);
    if (t.id === "devis") return user.role === "super";
    return true;
  });

  return (
    <div className="min-h-screen">
      <SaveBar notify={notify} />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <button onClick={onBack} data-cursor="link" className="group flex items-center gap-3">
            <BrandMark className="h-9 w-9 object-contain" />
            <span className="font-display text-base uppercase tracking-[0.08em] text-white">
              Doxa<span className="text-rouge"> Studio</span>
            </span>
            <span className="hidden rounded-full border border-rouge/40 bg-rouge/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-rouge sm:inline">
              Administration
            </span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="hidden max-w-[260px] items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] text-white/60 md:flex">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-rouge" />
              <span className="truncate">{user.pseudo}</span>
              <span className="shrink-0 rounded-full bg-rouge/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-rouge">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
            <button
              onClick={() => setTab("cloud")}
              data-cursor="link"
              title={
                cloud.state === "saved"
                  ? "Synchronisé en ligne"
                  : "Non synchronisé en ligne"
              }
              className={cn(
                "hidden shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 sm:flex",
                cloud.state === "saved"
                  ? "border-[#28c840]/50 text-[#28c840]"
                  : "border-white/15 text-white/40 hover:border-white/40 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  cloud.state === "saved"
                    ? "animate-pulse bg-[#28c840]"
                    : "bg-white/30",
                )}
              />
              {cloud.state === "saving"
                ? "Envoi…"
                : cloud.state === "saved"
                  ? "En ligne"
                  : "Local"}
            </button>
            <button
              onClick={onBackSite}
              data-cursor="link"
              className="hidden rounded-full border border-white/15 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/50 hover:text-white sm:inline-flex"
            >
              Voir le site
            </button>
            <button
              onClick={onLogout}
              data-cursor="link"
              className="rounded-full border border-rouge/50 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-rouge transition-all duration-300 hover:bg-rouge hover:text-white"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/35">
            Tout le site, ici
          </p>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-cursor="link"
                className={cn(
                  "shrink-0 rounded-full border px-5 py-3 text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 lg:w-full",
                  tab === t.id
                    ? "border-rouge bg-rouge text-white"
                    : "border-white/12 text-white/55 hover:border-white/40 hover:text-white",
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-2xl border border-white/10 bg-ink-2/50 p-5 lg:block">
            <p className="text-[10px] uppercase tracking-[0.24em] text-rouge">Pouvoir total</p>
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              Chaque modification est enregistrée instantanément et visible sur
              le site public. Pensez à exporter une sauvegarde avant les gros
              changements.
            </p>
          </div>
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "accueil" && <AccueilTab notify={notify} />}
              {tab === "projets" && <ProjetsTab notify={notify} />}
              {tab === "services" && <ServicesTab notify={notify} />}
              {tab === "showreel" && <ShowreelTab notify={notify} />}
              {tab === "agence" && <AgenceTab notify={notify} />}
              {tab === "fondateur" && <FondateurTab notify={notify} />}
              {tab === "methode" && <MethodeTab notify={notify} />}
              {tab === "identite" && <IdentiteTab notify={notify} />}
              {tab === "textes" && <TextesTab />}
              {tab === "coordonnees" && <CoordonneesTab />}
              {tab === "bannieres" && <BannieresTab notify={notify} />}
              {tab === "formats" && <FormatsTab />}
              {tab === "devis" && <DevisTab notify={notify} />}
              {tab === "comptes" && <ComptesTab user={user} notify={notify} />}
              {tab === "cloud" && <CloudTab notify={notify} />}
              {tab === "sauvegarde" && <SauvegardeTab user={user} notify={notify} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 30, x: "-50%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 z-[150] flex items-center gap-3 rounded-full border border-rouge/40 bg-ink-2/95 py-3 pl-4 pr-6 shadow-2xl shadow-rouge/20 backdrop-blur-xl"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rouge">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <p className="text-[12.5px] font-medium">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
