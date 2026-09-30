import { useContent } from "../data/content";
import LogoMark from "./LogoMark";

/**
 * Logo du site : utilise le logo personnalisé (admin) si présent,
 * sinon le logotype SVG « œil Doxa » par défaut.
 */
export default function BrandMark({ className }: { className?: string }) {
  const { logo } = useContent();
  if (logo) {
    return (
      <img
        src={logo}
        alt="Logo Doxa Studio"
        draggable={false}
        className={className}
      />
    );
  }
  return <LogoMark className={className} />;
}
