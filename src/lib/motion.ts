export const easeGlass = [0.16, 1, 0.3, 1] as const;

/** Weiche, träge Feder für Hover-/Tilt-Interaktionen. */
export const springSoft = { type: "spring", stiffness: 220, damping: 26, mass: 0.7 } as const;

/** Etwas straffere Feder für Layout-Morphs (z. B. Navigation). */
export const springLayout = { type: "spring", stiffness: 210, damping: 28, mass: 0.9 } as const;

/** Sehr weiche, langsame Feder für Parallax-Glättung (Mausposition). */
export const springParallax = { stiffness: 55, damping: 20, mass: 0.6 } as const;
