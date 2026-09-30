/* Vimeo, liens directs et code d'intégration iframe. */
export type VideoSource =
  | { type: "vimeo"; id: string; embedUrl: string; hash?: string }
  | { type: "file"; url: string };

function getSourceUrl(input: string): string {
  const raw = input.trim();
  // Les clients collent parfois tout le bloc HTML d'intégration Vimeo.
  const iframeSrc = raw.match(/<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
  return (iframeSrc ?? raw)
    .replace(/&amp;/gi, "&")
    .replace(/&#0*38;/gi, "&")
    .trim();
}

export function parseVideoSource(input?: string | null): VideoSource | null {
  if (!input?.trim()) return null;
  const url = getSourceUrl(input);
  // Vidéos téléversées par l'admin : elles restent en data/blob URL locale.
  if (/^(data:video\/|blob:)/i.test(url)) return { type: "file", url };
  if (!/^https?:\/\//i.test(url)) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const isVimeo = hostname === "vimeo.com" || hostname.endsWith(".vimeo.com") || hostname === "vimeopro.com";

    if (isVimeo) {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const idIndex = segments.findIndex((part) => /^\d{6,12}$/.test(part));
      if (idIndex >= 0) {
        const id = segments[idIndex];
        // Private/unlisted Vimeo videos require their `h` hash in the embed URL.
        const hash = parsed.searchParams.get("h") ||
          (segments[idIndex + 1] && /^[a-f0-9]{6,}$/i.test(segments[idIndex + 1])
            ? segments[idIndex + 1]
            : undefined);
        return {
          type: "vimeo",
          id,
          embedUrl: `https://player.vimeo.com/video/${id}`,
          hash,
        };
      }
    }

    return { type: "file", url };
  } catch {
    return null;
  }
}

/** URL canonique sûre à enregistrer dans un projet ou une bannière. */
export function normalizeVideoInput(input?: string | null): string | null {
  const source = parseVideoSource(input);
  if (!source) return null;
  if (source.type === "file") return source.url;
  return source.hash
    ? `https://vimeo.com/${source.id}?h=${encodeURIComponent(source.hash)}`
    : `https://vimeo.com/${source.id}`;
}

export function isVimeoUrl(input?: string | null): boolean {
  return parseVideoSource(input)?.type === "vimeo";
}

export function vimeoEmbedUrl(
  source: VideoSource,
  options: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    background?: boolean;
    controls?: boolean;
  } = {},
): string {
  if (source.type !== "vimeo") return "";
  const params = new URLSearchParams({
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });
  if (source.hash) params.set("h", source.hash);
  if (options.autoplay) params.set("autoplay", "1");
  if (options.muted) params.set("muted", "1");
  if (options.loop) params.set("loop", "1");
  if (options.background) params.set("background", "1");
  if (options.background || options.controls === false) params.set("controls", "0");
  if (options.controls === true) params.set("controls", "1");
  return `${source.embedUrl}?${params.toString()}`;
}