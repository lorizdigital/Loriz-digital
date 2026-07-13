import { motionValue } from "framer-motion";

/**
 * Geteilter Fortschrittswert (0–1) für die mobile Scroll-Überführung des
 * Hero-Logos zur Navigation. Geschrieben von HeroLogoMobileDock, gelesen von
 * Navigation.tsx – als plain MotionValue, damit beide Seiten reagieren können,
 * ohne dass ein React-Re-Render über eine Context-Grenze nötig ist.
 */
// Der sichere Grundzustand ist das sichtbare Navigationslogo. Nur der aktive
// Dock auf der Startseite setzt den Wert synchron auf seinen Scrollfortschritt.
// So koennen Rechtstextseiten und Breakpoint-Wechsel keinen alten, unsichtbaren
// Zustand erben.
export const heroLogoDockProgress = motionValue(1);

export const NAV_LOGO_DOM_ID = "nav-logo-mark";
