"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIsMounted } from "@/hooks/useIsMounted";
import { heroLogoDockProgress, NAV_LOGO_DOM_ID } from "@/lib/heroLogoDock";

/**
 * Distanz (px), über die sich die mobile Scroll-Überführung erstreckt. Bewusst
 * ein fester Wert statt an die Hero-Höhe gekoppelt – hält den Übergang auf
 * allen realistischen Mobil-Bildschirmen kurz und kontrolliert, ohne eine
 * zusätzliche Höhen-Messung als weitere Fehlerquelle einzuführen.
 */
const DOCK_DISTANCE = 300;

type Rect = { top: number; left: number; width: number; height: number };
type TargetGeometry = { centerX: number; centerY: number; height: number };

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
}

type HeroLogoMobileDockProps = {
  children: ReactNode;
  ready: boolean;
};

/**
 * Nur auf Mobil (< md) und ohne prefers-reduced-motion aktiv: überführt das
 * fertige Hero-Logo direkt scrollgebunden zur tatsächlichen Position des
 * Navigations-Logos. Auf Tablet/Desktop (>= md) oder bei reduzierter Bewegung
 * wird schlicht das Kind unverändert gerendert – ohne jeden Scroll-Listener.
 */
export function HeroLogoMobileDock({ children, ready }: HeroLogoMobileDockProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const active = isMobile && !prefersReducedMotion;

  useLayoutEffect(() => {
    if (!active) heroLogoDockProgress.set(1);
  }, [active]);

  if (!active) {
    return <>{children}</>;
  }

  return <HeroLogoDockActive ready={ready}>{children}</HeroLogoDockActive>;
}

function HeroLogoDockActive({ children, ready }: HeroLogoMobileDockProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const sourceMarkRef = useRef<HTMLDivElement>(null);
  const [initialRect, setInitialRect] = useState<Rect | null>(null);
  const [initialMarkHeight, setInitialMarkHeight] = useState(0);
  const [targetGeometry, setTargetGeometry] = useState<TargetGeometry | null>(null);
  const mounted = useIsMounted();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const heroOpacity = useMotionValue(1);

  // Startgeometrie: eigene, im Fluss stehende Platzhalter-Box. In eine
  // scroll-invariante ("Dokument"-)Referenz umgerechnet, damit die spätere
  // Transform-Berechnung unabhängig vom Scroll-Stand zum Messzeitpunkt ist.
  useLayoutEffect(() => {
    function measure() {
      const el = placeholderRef.current;
      const mark = sourceMarkRef.current;
      if (!el || !mark) return;
      const rect = el.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      setInitialRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      setInitialMarkHeight(markRect.height);
    }

    measure();

    const el = placeholderRef.current;
    const resizeObserver = new ResizeObserver(measure);
    if (el) resizeObserver.observe(el);

    // Mobile Browserleisten veraendern beim Scrollen nur die Viewport-Hoehe
    // und feuern dabei resize. Die Startgeometrie ist davon unabhaengig; eine
    // erneute React-State-Aktualisierung wuerde hier nur Frames kosten.
    let viewportWidth = window.innerWidth;
    function onResize() {
      if (window.innerWidth === viewportWidth) return;
      viewportWidth = window.innerWidth;
      measure();
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // Zielgeometrie: das echte Navigationslogo. Die mobile Navigation behaelt
  // waehrend des Scrollens bewusst dieselbe Geometrie. Deshalb genuegt eine
  // Messung bei Mount bzw. echter Breiten-/Orientierungsaenderung; synchrone
  // Layout-Reads in jedem Scroll-Frame sind nicht mehr erforderlich.
  useLayoutEffect(() => {
    function measure() {
      const el = document.getElementById(NAV_LOGO_DOM_ID);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTargetGeometry({
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        height: rect.height,
      });
    }

    measure();

    let viewportWidth = window.innerWidth;
    function onResize() {
      if (window.innerWidth === viewportWidth) return;
      viewportWidth = window.innerWidth;
      measure();
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", measure);

    const el = document.getElementById(NAV_LOGO_DOM_ID);
    const resizeObserver = new ResizeObserver(measure);
    if (el) resizeObserver.observe(el);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", measure);
      resizeObserver.disconnect();
    };
  }, []);

  // Alle visuellen Werte werden in demselben Scroll-Callback aus exakt
  // demselben window.scrollY berechnet. Dadurch koennen Position, Skalierung
  // und Crossfade bei grossen Scrollspruengen nicht in verschiedenen Frames
  // auf alten Zwischenwerten stehen bleiben. Der Callback enthaelt nur
  // Arithmetik und MotionValue-Writes, keine Layout-Reads oder React-Updates.
  useLayoutEffect(() => {
    if (!initialRect || !targetGeometry) return;

    const currentTargetGeometry = targetGeometry;
    const initialCenterX = initialRect.left + initialRect.width / 2;
    const initialCenterY = initialRect.top + initialRect.height / 2;
    const targetScale =
      initialMarkHeight > 0 && currentTargetGeometry.height > 0
        ? currentTargetGeometry.height / initialMarkHeight
        : 1;

    function updateFromScroll() {
      const scrollPosition = window.scrollY;
      const normalized = Math.min(1, Math.max(0, scrollPosition) / DOCK_DISTANCE);
      const smoothProgress = normalized * normalized * (3 - 2 * normalized);
      const dockProgress = ready ? smoothProgress : 0;
      const travelProgress = Math.min(1, Math.max(0, dockProgress / 0.9));

      x.set((currentTargetGeometry.centerX - initialCenterX) * travelProgress);
      // Negative Scrollwerte werden bewusst beibehalten: Das Portal folgt so
      // auch dem elastischen Mobile-Overscroll gemeinsam mit dem Hero-Inhalt.
      y.set(
        (currentTargetGeometry.centerY - initialCenterY) * travelProgress -
          scrollPosition * (1 - travelProgress),
      );
      scale.set(1 + (targetScale - 1) * travelProgress);

      const opacity = Math.min(1, Math.max(0, (1 - dockProgress) / 0.06));
      heroOpacity.set(opacity);
      heroLogoDockProgress.set(dockProgress);
    }

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateFromScroll);
  }, [
    heroOpacity,
    initialMarkHeight,
    initialRect,
    ready,
    scale,
    targetGeometry,
    x,
    y,
  ]);

  useLayoutEffect(() => {
    // Beim (Wieder-)Aktivieren des mobilen Docks darf kein alter globaler
    // Fortschrittswert aus einem vorherigen Breakpoint-Zustand aufblitzen.
    heroLogoDockProgress.set(0);
    return () => heroLogoDockProgress.set(1);
  }, []);

  return (
    <>
      <div
        ref={placeholderRef}
        aria-hidden="true"
        className="pointer-events-none flex w-full items-center justify-center py-1 sm:py-4 lg:py-0"
      >
        <div
          ref={sourceMarkRef}
          className="h-20 sm:h-28"
          style={{ aspectRatio: "140.4 / 162.6" }}
        />
      </div>

      {mounted &&
        initialRect &&
        createPortal(
          <motion.div
            aria-hidden="true"
            style={{
              position: "fixed",
              top: initialRect.top,
              left: initialRect.left,
              width: initialRect.width,
              height: initialRect.height,
              x,
              y,
              scale,
              opacity: heroOpacity,
              willChange: "transform, opacity",
              pointerEvents: "none",
              // Das Logo fliegt sichtbar vor dem Header. Das geoeffnete
              // MobileMenu-Panel liegt separat auf Ebene 70 und deckt es ab.
              zIndex: 60,
            }}
          >
            {children}
          </motion.div>,
          document.body,
        )}
    </>
  );
}
