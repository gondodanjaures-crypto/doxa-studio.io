import { cn } from "../utils/cn";
import { parseVideoSource, vimeoEmbedUrl } from "../utils/video";

/**
 * Lecteur commun Vimeo / fichier direct. Tous les embeds Vimeo passent par
 * cette coque pour garder les paramètres (dont le hash privé `h`) cohérents.
 */
export default function VideoEmbed({
  src,
  title,
  mode = "player",
  className,
  poster,
  onLoadedMetadata,
}: {
  src: string;
  title: string;
  mode?: "background" | "player" | "preview";
  className?: string;
  poster?: string;
  onLoadedMetadata?: (size: { width: number; height: number }) => void;
}) {
  const video = parseVideoSource(src);
  if (!video) return poster ? <img src={poster} alt={title} className={cn("object-cover", className)} /> : null;

  if (video.type === "vimeo") {
    const background = mode === "background";
    return (
      <iframe
        src={vimeoEmbedUrl(video, {
          autoplay: background || mode === "player",
          muted: background || mode === "player",
          loop: background,
          background,
          controls: background ? false : true,
        })}
        title={title}
        className={cn("border-0", className, background && "pointer-events-none")}
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={video.url}
      poster={poster}
      className={cn("object-cover", className)}
      autoPlay={mode !== "preview"}
      muted={mode === "background" || mode === "preview"}
      loop={mode === "background"}
      controls={mode === "player"}
      playsInline
      preload={mode === "preview" ? "metadata" : "none"}
      onLoadedMetadata={(event) =>
        onLoadedMetadata?.({
          width: event.currentTarget.videoWidth,
          height: event.currentTarget.videoHeight,
        })
      }
    />
  );
}