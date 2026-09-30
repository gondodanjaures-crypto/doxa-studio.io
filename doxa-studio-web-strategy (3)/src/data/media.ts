/* ------------------------------------------------------------------ */
/* Conversion fichier → dataURL avec progression réelle                 */
/* ------------------------------------------------------------------ */
export type Progress = (p: number) => void;

const MIN_MS = 900; // durée mini lisible de la barre de chargement

function readWithProgress(file: File, onProgress: Progress): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress(e.loaded / e.total);
    };
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convertit un fichier en dataURL :
 * - image : lecture (0 → 55 %), décodage (60 %), compression canvas (85 %),
 *   encodage JPEG final (100 %)
 * - vidéo : lecture seule (8 Mo max)
 * La progression est lissée et la barre reste lisible au moins ~900 ms.
 */
export async function fileToMedia(
  file: File,
  kind: "image" | "video",
  onProgress: Progress,
): Promise<string> {
  const started = performance.now();
  let reported = 0;
  const report = (p: number) => {
    const target = Math.max(reported, Math.min(1, p));
    const elapsed = performance.now() - started;
    const capped =
      elapsed < MIN_MS ? Math.min(target, (elapsed / MIN_MS) * 0.92) : target;
    if (capped > reported) {
      reported = capped;
      onProgress(reported);
    }
  };

  let result: string;

  if (kind === "video") {
    if (file.size > 8 * 1024 * 1024) throw new Error("too-big");
    result = await readWithProgress(file, (p) => report(p * 0.9));
    report(0.95);
  } else {
    const raw = await readWithProgress(file, (p) => report(p * 0.55));
    report(0.6);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error("image"));
      im.src = raw;
    });
    report(0.72);
    /* Conserve le Full HD recommande pour les heroes et bannieres,
       tout en limitant les fichiers photo inutilement gigantesques. */
    const max = 1920;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    report(0.85);
    result = canvas.toDataURL("image/jpeg", 0.84);
    report(0.98);
  }

  /* Animer la fin si le traitement a été trop rapide. */
  const elapsed = performance.now() - started;
  if (elapsed < MIN_MS) {
    const from = reported;
    const remain = Math.max(150, MIN_MS - elapsed);
    await new Promise<void>((resolve) => {
      const t0 = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / remain);
        onProgress(from + (1 - from) * p);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  } else {
    onProgress(1);
  }

  return result;
}
