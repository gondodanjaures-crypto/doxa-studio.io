import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import BrandMark from "./BrandLogo";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v += Math.random() * 13 + 5;
      if (v >= 100) {
        v = 100;
        clearInterval(id);
        setTimeout(() => setDone(true), 420);
      }
      setProgress(Math.floor(v));
    }, 90);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = done ? "" : "hidden";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-ink"
        >
          <div className="grid-lines absolute inset-0 opacity-50" />

          <motion.div
            initial={{ opacity: 0, rotate: -100, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col items-center"
          >
            <BrandMark className="h-28 w-28 text-white object-contain sm:h-36 sm:w-36" />
            <h1 className="mt-6 font-display text-4xl uppercase tracking-[0.06em] text-white sm:text-5xl">
              Doxa <span className="text-rouge">Studio</span>
            </h1>
            <p className="mt-3 text-[10px] uppercase tracking-[0.5em] text-white/40">
              Studio visuel — Abidjan
            </p>
          </motion.div>

          <div className="relative mt-12 h-[2px] w-56 overflow-hidden bg-white/10 sm:w-72">
            <motion.div
              className="h-full bg-rouge"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          <p className="relative mt-4 font-display text-sm tracking-[0.3em] text-white/50">
            {String(progress).padStart(3, "0")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
