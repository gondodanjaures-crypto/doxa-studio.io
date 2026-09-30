import { useEffect, useRef, useState } from "react";

/**
 * Curseur personnalisé : un point rouge précis + un anneau retardé.
 * Réagit aux éléments porteurs de `data-cursor` ("link" | "view" | "play").
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [mode, setMode] = useState<"default" | "link" | "media">("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("cursor-none-fine");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (el) {
        const kind = el.dataset.cursor;
        setLabel(el.dataset.cursorLabel ?? null);
        setMode(kind === "media" ? "media" : "link");
      } else {
        setLabel(null);
        setMode("default");
      }
    };

    const loop = () => {
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    // Ne masque le curseur que lorsqu'il quitte réellement la fenêtre
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cursor-none-fine");
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] hidden md:block"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <div
        ref={ringRef}
        className={[
          "fixed left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-out",
          mode === "default" ? "h-9 w-9 border-white/40 bg-transparent" : "",
          mode === "link" ? "h-14 w-14 border-rouge bg-rouge/20" : "",
          mode === "media" ? "h-24 w-24 border-rouge bg-rouge" : "",
        ].join(" ")}
      >
        {label && (
          <span className="font-display text-[10px] uppercase tracking-[0.18em] text-white">
            {label}
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        className={[
          "fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-rouge transition-opacity duration-200",
          mode === "media" ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
    </div>
  );
}
