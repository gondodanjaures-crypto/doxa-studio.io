/**
 * Reproduction vectorielle du logo Doxa Studio :
 * œil-spirale formé de trois croissants imbriqués + pupille inclinée.
 */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g fill="currentColor">
        {/* Croissant extérieur */}
        <path
          d="M-22.6-40A46 46 0 1 1-22.6 40A42 42 0 0 0-22.6-40Z"
          transform="translate(60 60)"
        />
        {/* Croissant médian */}
        <path
          d="M-14.5-22.8A27 27 0 1 1-14.5 22.8A24.5 24.5 0 0 0-14.5-22.8Z"
          transform="translate(63 66) rotate(16)"
        />
        {/* Croissant intérieur */}
        <path
          d="M-8.5-11.1A14 14 0 1 1-8.5 11.1A12 12 0 0 0-8.5-11.1Z"
          transform="translate(59 59) rotate(42)"
        />
        {/* Pupille */}
        <ellipse
          rx="3"
          ry="4.2"
          transform="translate(56 55) rotate(-30)"
          className="fill-white transition-colors duration-500 group-hover:fill-rouge"
        />
      </g>
    </svg>
  );
}
