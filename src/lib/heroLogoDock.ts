import { motionValue } from "framer-motion";

/**
 * Geteilter Fortschrittswert (0–1) für die mobile Scroll-Überführung des
 * Hero-Logos zur Navigation. Geschrieben von HeroLogoMobileDock, gelesen von
 * Navigation.tsx – als plain MotionValue, damit beide Seiten reagieren können,
 * ohne dass ein React-Re-Render über eine Context-Grenze nötig ist.
 */
// Auf der Startseite muss der erste mobile Browser-Paint bereits dem Anfang der
// Überführung entsprechen. Ein sichtbarer Standardwert würde das Nav-Logo vor
// der Hydrierung für einen Frame aufblitzen lassen. Navigation.tsx erzwingt den
// sichtbaren Zustand auf Desktop; Seiten ohne Dock verwenden den Wert nicht.
export const heroLogoDockProgress = motionValue(0);

export const NAV_LOGO_DOM_ID = "nav-logo-mark";
