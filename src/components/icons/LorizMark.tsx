/**
 * Bildmarke aus dem offiziellen Loriz-Digital-Logo-Pack (nur das Icon, ohne
 * Wortmarke/Canvas). Der Grundstrich folgt `currentColor` und passt sich so
 * automatisch an Light-/Dark-Mode an; die Akzentfläche bleibt fest auf dem
 * Marken-Taupe (#d7d2cc), analog zu den Light-/Dark-Varianten im Logo-Pack.
 */
export function LorizMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="72.8 44 140.4 162.6"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M 82.8 196.56 L 82.8 54 L 104.976 76.176 L 104.976 168.048 Z" fill="currentColor" />
      <path d="M 111.312 196.56 L 181.008 196.56 L 203.184 174.384 L 133.488 174.384 Z" fill="#d7d2cc" />
    </svg>
  );
}
